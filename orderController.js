import pool from "./db.js";

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function isPositiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function readPrice(value) {
  const isIntegerPrice =
    (typeof value === "number" && Number.isSafeInteger(value)) ||
    (typeof value === "string" && /^\d+$/.test(value));
  const price = isIntegerPrice ? Number(value) : Number.NaN;
  if (!Number.isSafeInteger(price) || price < 0) {
    throw new Error("El precio de un producto no es un entero CLP válido.");
  }
  return price;
}

export async function createOrder(request, response, next) {
  const { id_cliente: customerId, carrito } = request.body ?? {};

  if (!isPositiveInteger(customerId)) {
    return response.status(400).json({ message: "id_cliente debe ser un entero positivo." });
  }

  if (
    !Array.isArray(carrito) ||
    carrito.length === 0 ||
    carrito.length > 100 ||
    carrito.some(
      (item) =>
        !item ||
        !isPositiveInteger(item.id_producto) ||
        !isPositiveInteger(item.cantidad) ||
        item.cantidad > 10000,
    )
  ) {
    return response.status(400).json({
      message: "carrito debe contener entre 1 y 100 productos con id_producto y cantidad válidos.",
    });
  }

  const quantities = new Map();
  for (const { id_producto: productId, cantidad } of carrito) {
    const combinedQuantity = (quantities.get(productId) ?? 0) + cantidad;
    if (!Number.isSafeInteger(combinedQuantity)) {
      return response.status(400).json({ message: "La cantidad solicitada no es válida." });
    }
    quantities.set(productId, combinedQuantity);
  }

  let connection;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [customers] = await connection.execute(
      "SELECT id_cliente FROM Cliente WHERE id_cliente = ? FOR UPDATE",
      [customerId],
    );
    if (customers.length === 0) {
      throw new RequestError(404, "El cliente indicado no existe.");
    }

    const productIds = [...quantities.keys()].sort((left, right) => left - right);
    const placeholders = productIds.map(() => "?").join(", ");
    const [products] = await connection.execute(
      `SELECT id_producto, nombre, precio, stock
      FROM Producto
      WHERE id_producto IN (${placeholders})
      ORDER BY id_producto
      FOR UPDATE`,
      productIds,
    );

    if (products.length !== productIds.length) {
      throw new RequestError(400, "Uno o más productos no existen.");
    }

    const productsById = new Map(
      products.map((product) => [Number(product.id_producto), product]),
    );
    let total = 0;

    for (const [productId, quantity] of quantities) {
      const product = productsById.get(productId);
      if (product.stock < quantity) {
        throw new RequestError(409, `Stock insuficiente para el producto ${product.nombre}.`);
      }

      total += readPrice(product.precio) * quantity;
      if (!Number.isSafeInteger(total)) {
        throw new RequestError(400, "El total del pedido excede el máximo permitido.");
      }
    }

    const [orderResult] = await connection.execute(
      "INSERT INTO Pedido (id_cliente, fecha, total) VALUES (?, CURRENT_TIMESTAMP, ?)",
      [customerId, total],
    );
    const orderId = orderResult.insertId;

    for (const [productId, quantity] of quantities) {
      const product = productsById.get(productId);
      const unitPrice = readPrice(product.precio);
      const subtotal = unitPrice * quantity;

      await connection.execute(
        `INSERT INTO Detalle_pedido
          (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)`,
        [orderId, productId, quantity, unitPrice, subtotal],
      );

      const [stockResult] = await connection.execute(
        "UPDATE Producto SET stock = stock - ? WHERE id_producto = ? AND stock >= ?",
        [quantity, productId, quantity],
      );
      if (stockResult.affectedRows !== 1) {
        throw new RequestError(409, `No fue posible reservar el stock de ${product.nombre}.`);
      }
    }

    await connection.commit();
    transactionStarted = false;

    return response.status(201).json({ id_pedido: orderId, id_cliente: customerId, total });
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        return next(new AggregateError([error, rollbackError], "Falló la transacción y su rollback."));
      }
    }

    if (error instanceof RequestError) {
      return response.status(error.status).json({ message: error.message });
    }
    return next(error);
  } finally {
    connection?.release();
  }
}

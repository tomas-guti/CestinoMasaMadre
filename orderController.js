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

function readOrderId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new RequestError(400, "El id del pedido debe ser un entero positivo.");
  }

  const id = Number(value);
  if (!isPositiveInteger(id) || id > 2147483647) {
    throw new RequestError(400, "El id del pedido debe ser un entero positivo.");
  }
  return id;
}

function handleRequestError(error, response, next) {
  if (error instanceof RequestError) {
    return response.status(error.status).json({ message: error.message });
  }
  return next(error);
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

function readCustomer(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RequestError(
      400,
      "cliente debe incluir nombre, email, telefono, calle, numero y comuna.",
    );
  }

  const { nombre, email, telefono, calle, numero, comuna } = value;
  if (
    typeof nombre !== "string" ||
    !nombre.trim() ||
    nombre.trim().length > 100 ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.trim().length > 100 ||
    typeof telefono !== "string" ||
    !telefono.trim() ||
    telefono.trim().length > 30 ||
    typeof calle !== "string" ||
    !calle.trim() ||
    calle.trim().length > 150 ||
    typeof numero !== "string" ||
    !numero.trim() ||
    numero.trim().length > 30 ||
    typeof comuna !== "string" ||
    !comuna.trim() ||
    comuna.trim().length > 100
  ) {
    throw new RequestError(400, "Los datos del cliente no son válidos.");
  }

  return {
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    telefono: telefono.trim(),
    calle: calle.trim(),
    numero: numero.trim(),
    comuna: comuna.trim(),
  };
}

export async function getAdminOrders(request, response, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT
        p.id_pedido,
        p.numero_boleta,
        c.nombre AS nombre_cliente,
        p.fecha,
        p.total,
        p.estado,
        c.email,
        c.telefono,
        c.calle,
        c.numero,
        c.comuna,
        dp.id_producto,
        pr.nombre AS nombre_producto,
        dp.cantidad,
        dp.precio_unitario,
        dp.subtotal
      FROM Pedido AS p
      INNER JOIN Cliente AS c ON c.id_cliente = p.id_cliente
      LEFT JOIN Detalle_pedido AS dp ON dp.id_pedido = p.id_pedido
      LEFT JOIN Producto AS pr ON pr.id_producto = dp.id_producto
      ORDER BY p.fecha DESC, p.id_pedido DESC, dp.id_producto`,
    );

    const ordersById = new Map();
    for (const row of rows) {
      let order = ordersById.get(row.id_pedido);
      if (!order) {
        order = {
          id_pedido: row.id_pedido,
          numero_boleta: row.numero_boleta,
          nombre_cliente: row.nombre_cliente,
          email: row.email,
          telefono: row.telefono,
          calle: row.calle,
          numero: row.numero,
          comuna: row.comuna,
          fecha: row.fecha,
          total: row.total,
          estado: row.estado,
          productos: [],
        };
        ordersById.set(row.id_pedido, order);
      }

      if (row.id_producto !== null) {
        order.productos.push({
          id_producto: row.id_producto,
          nombre: row.nombre_producto,
          cantidad: row.cantidad,
          precio_unitario: row.precio_unitario,
          subtotal: row.subtotal,
        });
      }
    }

    return response.json([...ordersById.values()]);
  } catch (error) {
    return next(error);
  }
}

export async function updateOrderStatus(request, response, next) {
  try {
    const id = readOrderId(request.params.id);
    const { estado } = request.body ?? {};
    if (typeof estado !== "string" || estado.trim().length === 0 || estado.trim().length > 50) {
      throw new RequestError(400, "estado debe ser un texto no vacío de hasta 50 caracteres.");
    }

    const normalizedStatus = estado.trim();
    const [result] = await pool.execute(
      "UPDATE Pedido SET estado = ? WHERE id_pedido = ?",
      [normalizedStatus, id],
    );

    if (result.affectedRows === 0) {
      const [orders] = await pool.execute(
        "SELECT id_pedido FROM Pedido WHERE id_pedido = ?",
        [id],
      );
      if (orders.length === 0) {
        throw new RequestError(404, "El pedido indicado no existe.");
      }
    }

    return response.json({ id_pedido: id, estado: normalizedStatus });
  } catch (error) {
    return handleRequestError(error, response, next);
  }
}

export async function confirmOrderPayment(request, response, next) {
  try {
    const id = readOrderId(request.params.id);
    const numeroBoleta = `BOL-${id}-${Date.now()}`;
    const [result] = await pool.execute(
      `UPDATE Pedido
      SET estado = 'Confirmado', numero_boleta = ?
      WHERE id_pedido = ? AND estado = 'Pendiente'`,
      [numeroBoleta, id],
    );

    if (result.affectedRows === 0) {
      const [orders] = await pool.execute(
        "SELECT estado FROM Pedido WHERE id_pedido = ?",
        [id],
      );
      if (orders.length === 0) {
        throw new RequestError(404, "El pedido indicado no existe.");
      }
      throw new RequestError(409, "Solo se pueden confirmar pedidos pendientes.");
    }

    const [rows] = await pool.execute(
      `SELECT
        p.id_pedido,
        p.numero_boleta,
        p.fecha,
        p.total,
        p.estado,
        c.nombre AS nombre_cliente,
        c.email,
        c.telefono,
        c.calle,
        c.numero,
        c.comuna,
        pr.nombre AS nombre_producto,
        dp.cantidad,
        dp.precio_unitario,
        dp.subtotal
      FROM Pedido AS p
      INNER JOIN Cliente AS c ON c.id_cliente = p.id_cliente
      LEFT JOIN Detalle_pedido AS dp ON dp.id_pedido = p.id_pedido
      LEFT JOIN Producto AS pr ON pr.id_producto = dp.id_producto
      WHERE p.id_pedido = ?
      ORDER BY dp.id_producto`,
      [id],
    );

    if (rows.length === 0) {
      throw new RequestError(404, "El pedido indicado no existe.");
    }

    const firstRow = rows[0];
    const pedido = {
      id_pedido: firstRow.id_pedido,
      numero_boleta: firstRow.numero_boleta,
      fecha: firstRow.fecha,
      total: firstRow.total,
      estado: firstRow.estado,
      cliente: {
        nombre: firstRow.nombre_cliente,
        email: firstRow.email,
        telefono: firstRow.telefono,
        calle: firstRow.calle,
        numero: firstRow.numero,
        comuna: firstRow.comuna,
      },
      productos: rows
        .filter((row) => row.nombre_producto !== null)
        .map((row) => ({
          nombre: row.nombre_producto,
          cantidad: row.cantidad,
          precio_unitario: row.precio_unitario,
          subtotal: row.subtotal,
        })),
    };

    return response.status(200).json(pedido);
  } catch (error) {
    return handleRequestError(error, response, next);
  }
}

export async function deleteOrder(request, response, next) {
  let connection;
  let transactionStarted = false;

  try {
    const id = readOrderId(request.params.id);
    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [orders] = await connection.execute(
      "SELECT id_pedido FROM Pedido WHERE id_pedido = ? FOR UPDATE",
      [id],
    );
    if (orders.length === 0) {
      throw new RequestError(404, "El pedido indicado no existe.");
    }

    await connection.execute(
      "DELETE FROM Detalle_pedido WHERE id_pedido = ?",
      [id],
    );
    await connection.execute(
      "DELETE FROM Pedido WHERE id_pedido = ?",
      [id],
    );

    await connection.commit();
    transactionStarted = false;
    return response.status(204).end();
  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        return next(new AggregateError([error, rollbackError], "Falló la eliminación y su rollback."));
      }
    }
    return handleRequestError(error, response, next);
  } finally {
    connection?.release();
  }
}

export async function cleanupAbandonedOrders() {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    const [orders] = await connection.execute(
      `SELECT id_pedido
      FROM Pedido
      WHERE estado = 'Pendiente'
        AND fecha < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 MINUTE)
      ORDER BY id_pedido
      FOR UPDATE`,
    );
    if (orders.length === 0) {
      await connection.commit();
      transactionStarted = false;
      return 0;
    }

    const orderIds = orders.map((order) => order.id_pedido);
    const placeholders = orderIds.map(() => "?").join(", ");
    const [reservedProducts] = await connection.execute(
      `SELECT id_producto, SUM(cantidad) AS cantidad
      FROM Detalle_pedido
      WHERE id_pedido IN (${placeholders})
      GROUP BY id_producto
      ORDER BY id_producto`,
      orderIds,
    );

    for (const product of reservedProducts) {
      await connection.execute(
        "UPDATE Producto SET stock = stock + ? WHERE id_producto = ?",
        [product.cantidad, product.id_producto],
      );
    }

    await connection.execute(
      `DELETE FROM Detalle_pedido
      WHERE id_pedido IN (${placeholders})`,
      orderIds,
    );
    await connection.execute(
      `DELETE FROM Pedido
      WHERE id_pedido IN (${placeholders})
        AND estado = 'Pendiente'
        AND fecha < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 15 MINUTE)`,
      orderIds,
    );

    await connection.commit();
    transactionStarted = false;
    return orders.length;
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        throw new AggregateError([error, rollbackError], "Falló la limpieza y su rollback.");
      }
    }
    throw error;
  } finally {
    connection.release();
  }
}

export async function createOrder(request, response, next) {
  let customer;
  try {
    customer = readCustomer(request.body?.cliente);
  } catch (error) {
    return handleRequestError(error, response, next);
  }
  const { carrito } = request.body ?? {};

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

    const [existingCustomers] = await connection.execute(
      "SELECT id_cliente FROM Cliente WHERE email = ? FOR UPDATE",
      [customer.email],
    );
    let customerId;
    if (existingCustomers.length === 0) {
      const [customerResult] = await connection.execute(
        `INSERT INTO Cliente (nombre, email, telefono, calle, numero, comuna)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          customer.nombre,
          customer.email,
          customer.telefono,
          customer.calle,
          customer.numero,
          customer.comuna,
        ],
      );
      customerId = customerResult.insertId;
    } else {
      await connection.execute(
        `UPDATE Cliente
        SET nombre = ?, telefono = ?, calle = ?, numero = ?, comuna = ?
        WHERE email = ?`,
        [
          customer.nombre,
          customer.telefono,
          customer.calle,
          customer.numero,
          customer.comuna,
          customer.email,
        ],
      );
      customerId = existingCustomers[0].id_cliente;
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
      `INSERT INTO Pedido (id_cliente, fecha, total, estado)
      VALUES (?, CURRENT_TIMESTAMP, ?, 'Pendiente')`,
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

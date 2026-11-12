import pool from "./db.js";

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const productFields = ["nombre", "categoria", "detalle", "precio", "stock", "imagen", "tag"];
const maxInteger = 2147483647;

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readProduct(body, { requireAllFields = false } = {}) {
  if (!isRecord(body)) {
    throw new RequestError(400, "El cuerpo debe ser un objeto de producto.");
  }

  if (
    typeof body.nombre !== "string" ||
    body.nombre.trim().length === 0 ||
    body.nombre.length > 100 ||
    !Number.isSafeInteger(body.precio) ||
    body.precio < 0 ||
    body.precio > maxInteger
  ) {
    throw new RequestError(400, "nombre y precio deben ser válidos.");
  }

  const product = {
    nombre: body.nombre.trim(),
    categoria: body.categoria ?? null,
    detalle: body.detalle ?? null,
    precio: body.precio,
    stock: body.stock === undefined ? 0 : body.stock,
    imagen: body.imagen ?? null,
    tag: body.tag ?? null,
  };

  if (
    requireAllFields &&
    productFields.some((field) => !Object.hasOwn(body, field))
  ) {
    throw new RequestError(400, "Para actualizar se requieren todos los campos del producto.");
  }

  if (
    !Number.isSafeInteger(product.stock) ||
    product.stock < 0 ||
    product.stock > maxInteger
  ) {
    throw new RequestError(400, "stock debe ser un entero no negativo válido.");
  }

  for (const [field, maxLength] of [
    ["categoria", 50],
    ["detalle", Number.POSITIVE_INFINITY],
    ["imagen", 255],
    ["tag", 50],
  ]) {
    if (
      product[field] !== null &&
      (typeof product[field] !== "string" || product[field].length > maxLength)
    ) {
      throw new RequestError(400, `${field} debe ser texto válido o null.`);
    }
  }

  return product;
}

function readProductId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new RequestError(400, "El id del producto debe ser un entero positivo.");
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id) || id > maxInteger) {
    throw new RequestError(400, "El id del producto debe ser un entero positivo.");
  }
  return id;
}

function handleRequestError(error, response, next) {
  if (error instanceof RequestError) {
    return response.status(error.status).json({ message: error.message });
  }
  return next(error);
}

export async function getProducts(request, response, next) {
  try {
    const [products] = await pool.execute(
      `SELECT
        id_producto AS id,
        nombre,
        categoria,
        detalle,
        precio,
        stock,
        imagen,
        tag
      FROM Producto
      ORDER BY id_producto`,
    );

    return response.json(products);
  } catch (error) {
    return next(error);
  }
}

export async function createProduct(request, response, next) {
  try {
    const product = readProduct(request.body);
    const [result] = await pool.execute(
      `INSERT INTO Producto (nombre, categoria, detalle, precio, stock, imagen, tag)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product.nombre,
        product.categoria,
        product.detalle,
        product.precio,
        product.stock,
        product.imagen,
        product.tag,
      ],
    );

    return response.status(201).json({ id: result.insertId, ...product });
  } catch (error) {
    return handleRequestError(error, response, next);
  }
}

export async function updateProduct(request, response, next) {
  try {
    const id = readProductId(request.params.id);
    const product = readProduct(request.body, { requireAllFields: true });
    const [result] = await pool.execute(
      `UPDATE Producto
      SET nombre = ?, categoria = ?, detalle = ?, precio = ?, stock = ?, imagen = ?, tag = ?
      WHERE id_producto = ?`,
      [
        product.nombre,
        product.categoria,
        product.detalle,
        product.precio,
        product.stock,
        product.imagen,
        product.tag,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      const [products] = await pool.execute(
        "SELECT id_producto FROM Producto WHERE id_producto = ?",
        [id],
      );
      if (products.length === 0) {
        throw new RequestError(404, "El producto indicado no existe.");
      }
    }

    return response.json({ id, ...product });
  } catch (error) {
    return handleRequestError(error, response, next);
  }
}

export async function deleteProduct(request, response, next) {
  try {
    const id = readProductId(request.params.id);
    const [result] = await pool.execute(
      "DELETE FROM Producto WHERE id_producto = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      throw new RequestError(404, "El producto indicado no existe.");
    }

    return response.status(204).end();
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return response.status(409).json({
        message: "No se puede eliminar el producto porque está asociado a pedidos.",
      });
    }
    return handleRequestError(error, response, next);
  }
}

import pool from "./db.js";

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
      WHERE stock > 0
      ORDER BY id_producto`,
    );

    return response.json(products);
  } catch (error) {
    return next(error);
  }
}

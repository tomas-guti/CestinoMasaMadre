import "dotenv/config";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import express from "express";
import { login } from "./authController.js";
import authenticateToken from "./authMiddleware.js";
import {
  cleanupAbandonedOrders,
  createOrder,
  deleteOrder,
  getAdminOrders,
  updateOrderStatus,
} from "./orderController.js";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "./productController.js";

const frontendOrigin = process.env.FRONTEND_ORIGIN;

if (!frontendOrigin) {
  throw new Error("Falta configurar FRONTEND_ORIGIN en las variables de entorno.");
}

if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
  throw new Error("JWT_SECRET debe tener al menos 32 bytes.");
}

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin === frontendOrigin);
    },
  }),
);
app.use(express.json({ limit: "10kb" }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Demasiados intentos. Intenta de nuevo más tarde." },
});

app.post("/api/auth/login", loginLimiter, login);
app.get("/api/productos", getProducts);
app.post("/api/productos", authenticateToken, createProduct);
app.put("/api/productos/:id", authenticateToken, updateProduct);
app.delete("/api/productos/:id", authenticateToken, deleteProduct);
app.get("/api/pedidos/admin", authenticateToken, getAdminOrders);
app.put("/api/pedidos/:id/estado", authenticateToken, updateOrderStatus);
app.delete("/api/pedidos/:id", authenticateToken, deleteOrder);
app.post("/api/pedidos", createOrder);
app.get("/api/admin/session", authenticateToken, (request, response) => {
  const { email, role, expiresAt } = request.auth;
  response.json({ user: { email, role, expiresAt } });
});

app.use((error, request, response, next) => {
  console.error("Error procesando solicitud:", error);
  if (response.headersSent) {
    return next(error);
  }
  return response.status(error.status ?? 500).json({
    message: error.status ? error.message : "Error interno del servidor.",
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

let cleanupInProgress = false;
setInterval(async () => {
  if (cleanupInProgress) return;

  cleanupInProgress = true;
  try {
    const deletedOrders = await cleanupAbandonedOrders();
    if (deletedOrders > 0) {
      console.log(`Limpieza automática: ${deletedOrders} pedidos pendientes expirados.`);
    }
  } catch (error) {
    console.error("Error limpiando pedidos pendientes expirados:", error);
  } finally {
    cleanupInProgress = false;
  }
}, 60 * 1000);

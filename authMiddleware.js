import "dotenv/config";
import jwt from "jsonwebtoken";

export default function authenticateToken(request, response, next) {
  const authorization = request.get("authorization");
  const [scheme, token, ...extraParts] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token || extraParts.length > 0) {
    return response.status(401).json({ message: "Se requiere un token de acceso válido." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "cestino-api",
      audience: "cestino-admin",
    });

    if (
      typeof payload === "string" ||
      payload.role !== "admin" ||
      typeof payload.sub !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return response.status(403).json({ message: "El token no concede acceso administrativo." });
    }

    request.auth = { email: payload.sub, role: payload.role, expiresAt: payload.exp * 1000 };
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return response.status(401).json({ message: "El token es inválido o ha expirado." });
    }
    return next(error);
  }
}

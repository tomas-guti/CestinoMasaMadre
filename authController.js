import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const bcryptHashPattern = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export async function login(request, response) {
  const { email, password } = request.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length > 254 ||
    password.length === 0 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return response.status(400).json({ message: "Correo o contraseña inválidos." });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const jwtSecret = process.env.JWT_SECRET;
  const bcryptCost = Number(passwordHash?.slice(4, 6));

  if (
    !adminEmail ||
    !passwordHash ||
    !bcryptHashPattern.test(passwordHash) ||
    bcryptCost < 4 ||
    bcryptCost > 15 ||
    !jwtSecret ||
    Buffer.byteLength(jwtSecret) < 32
  ) {
    return response.status(503).json({ message: "El acceso de administración no está configurado." });
  }

  const passwordMatches = await bcrypt.compare(password, passwordHash);
  if (email.trim().toLowerCase() !== adminEmail || !passwordMatches) {
    return response.status(401).json({ message: "Credenciales incorrectas." });
  }

  const token = jwt.sign(
    { role: "admin" },
    jwtSecret,
    {
      algorithm: "HS256",
      subject: adminEmail,
      issuer: "cestino-api",
      audience: "cestino-admin",
      expiresIn: "15m",
    },
  );

  return response.json({ token, tokenType: "Bearer", expiresIn: 900 });
}

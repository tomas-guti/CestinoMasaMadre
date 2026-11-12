-- 1. Crear la base de datos y usarla
CREATE DATABASE IF NOT EXISTS cestino_db;
USE cestino_db;

-- 2. Crear las tablas principales
CREATE TABLE Cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    calle VARCHAR(150) NOT NULL,
    numero VARCHAR(30) NOT NULL,
    comuna VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    detalle TEXT,
    precio INT NOT NULL, -- Guardamos en CLP (número entero)
    stock INT NOT NULL DEFAULT 0,
    imagen VARCHAR(255),
    tag VARCHAR(50)
) ENGINE=InnoDB;

-- 3. Crear las tablas transaccionales (Pedidos)
CREATE TABLE Pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total INT NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    INDEX idx_pedido_estado_fecha (estado, fecha),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
) ENGINE=InnoDB;

CREATE TABLE Detalle_pedido (
    id_detalle_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario INT NOT NULL,
    subtotal INT NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
) ENGINE=InnoDB;

-- 4. Insertar datos de prueba para que el catálogo no esté vacío
INSERT INTO Cliente (nombre, email, telefono, calle, numero, comuna)
VALUES ('Cliente Prueba', 'prueba@cestino.cl', '+56900000000', 'Calle de prueba', '1', 'Santiago');

INSERT INTO Producto (nombre, categoria, detalle, precio, stock, imagen, tag) VALUES
('Hogaza Clásica', 'Masa Madre', 'Hogaza tradicional fermentada por 24 horas.', 3500, 10, 'hogaza.jpg', 'Más Vendido'),
('Focaccia de Romero', 'Especialidades', 'Focaccia con aceite de oliva, sal de mar y romero.', 4500, 5, 'focaccia.jpg', 'Nuevo');
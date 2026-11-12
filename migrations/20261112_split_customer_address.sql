ALTER TABLE Cliente
    ADD COLUMN calle VARCHAR(150),
    ADD COLUMN numero VARCHAR(30),
    ADD COLUMN comuna VARCHAR(100);

CREATE INDEX idx_pedido_estado_fecha ON Pedido (estado, fecha);

ALTER TABLE Pedido
    ADD COLUMN numero_boleta VARCHAR(100) NULL,
    ADD UNIQUE INDEX uq_pedido_numero_boleta (numero_boleta);

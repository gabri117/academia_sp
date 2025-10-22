DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'recibo_estado_enum'
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'recibo_estado_enum'
              AND e.enumlabel = 'emitido'
        ) THEN
            ALTER TYPE recibo_estado_enum RENAME VALUE 'emitido' TO 'EMITIDO';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'recibo_estado_enum'
              AND e.enumlabel = 'anulado'
        ) THEN
            ALTER TYPE recibo_estado_enum RENAME VALUE 'anulado' TO 'ANULADO';
        END IF;
    ELSE
        CREATE TYPE recibo_estado_enum AS ENUM ('EMITIDO', 'ANULADO');
    END IF;
END
$$;

ALTER TABLE recibo
    ADD COLUMN IF NOT EXISTS estado recibo_estado_enum;

UPDATE recibo
SET estado = 'EMITIDO'
WHERE estado IS NULL;

ALTER TABLE recibo
    ALTER COLUMN estado SET NOT NULL,
    ALTER COLUMN estado SET DEFAULT 'EMITIDO';

COMMENT ON COLUMN recibo.estado IS 'Estado operacional del recibo (EMITIDO | ANULADO)';


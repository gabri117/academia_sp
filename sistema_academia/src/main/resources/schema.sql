-- ============================================================
-- ACADEMIA DB — Esquema base (PostgreSQL)
-- ============================================================

-- 0) Extensiones
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Tipos ENUM
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alumno_estado_enum') THEN
    CREATE TYPE alumno_estado_enum  AS ENUM ('activo','inactivo');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'oferta_status_enum') THEN
    CREATE TYPE oferta_status_enum  AS ENUM ('programado','en_curso','finalizado','cancelado');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cargo_estado_enum') THEN
    CREATE TYPE cargo_estado_enum   AS ENUM ('pendiente','cancelado');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jornada_enum') THEN
    CREATE TYPE jornada_enum        AS ENUM ('Matutina','Vespertina','Nocturna');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mes_enum') THEN
    CREATE TYPE mes_enum            AS ENUM (
      'enero','febrero','marzo','abril','mayo','junio',
      'julio','agosto','septiembre','octubre','noviembre','diciembre'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recibo_estado_enum') THEN
    CREATE TYPE recibo_estado_enum  AS ENUM ('EMITIDO','ANULADO');
  END IF;
END $$;

-- ============================================================
-- 2) Tablas sin dependencias
-- ============================================================

-- Encargado
CREATE TABLE IF NOT EXISTS Encargado (
  encargado_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       VARCHAR(50)  NOT NULL,
  apellido     VARCHAR(50)  NOT NULL,
  telefono     VARCHAR(15)
);

-- Establecimiento
CREATE TABLE IF NOT EXISTS Establecimiento (
  instituto_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          VARCHAR(100) NOT NULL,
  direccion       VARCHAR(100),
  nombre_director VARCHAR(50),
  telefono        VARCHAR(15),
  jornada         jornada_enum NOT NULL
);

-- NivelAcadémico
CREATE TABLE IF NOT EXISTS NivelAcademico (
  nivel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre   VARCHAR(20) NOT NULL UNIQUE
);

-- GradoAcadémico
CREATE TABLE IF NOT EXISTS GradoAcademico (
  grado_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nivel_id UUID NOT NULL,
  nombre   VARCHAR(50) NOT NULL,
  CONSTRAINT fk_grado_nivel
    FOREIGN KEY (nivel_id) REFERENCES NivelAcademico(nivel_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT uq_grado_por_nivel UNIQUE (nivel_id, nombre)
);

-- CursoCatálogo
CREATE TABLE IF NOT EXISTS CursoCatalogo (
  curso_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(30) NOT NULL,
  nivel_curso VARCHAR(20),
  duracion    VARCHAR(20)
);

-- Alumno (alumno_id como PK; carnet opcional pero único)
CREATE TABLE IF NOT EXISTS Alumno (
  alumno_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instituto_id     UUID NOT NULL,
  carnet           VARCHAR(20),  -- quita UNIQUE si no lo quieres exclusivo
  nombre           VARCHAR(50)  NOT NULL,
  apellido         VARCHAR(50)  NOT NULL,
  telefono         VARCHAR(15),
  direccion        VARCHAR(100),
  fecha_nacimiento DATE,
  estado           alumno_estado_enum NOT NULL DEFAULT 'activo',
  CONSTRAINT fk_alumno_establecimiento
    FOREIGN KEY (instituto_id) REFERENCES Establecimiento(instituto_id)
      ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Relación N:M Alumno–Encargado
CREATE TABLE IF NOT EXISTS AlumnoEncargado (
  alumno_id    UUID NOT NULL,
  encargado_id UUID NOT NULL,
  PRIMARY KEY (alumno_id, encargado_id),
  CONSTRAINT fk_ae_alumno
    FOREIGN KEY (alumno_id) REFERENCES Alumno(alumno_id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ae_encargado
    FOREIGN KEY (encargado_id) REFERENCES Encargado(encargado_id)
      ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 3) Ofertas, tarifas e inscripciones
-- ============================================================

-- OfertaCurso
CREATE TABLE IF NOT EXISTS OfertaCurso (
  oferta_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grado_id           UUID NOT NULL,
  instituto_id       UUID NOT NULL,
  curso_id           UUID NOT NULL,
  dia                VARCHAR(15),         -- según tu ajuste
  hora_inicio        TIME      NOT NULL,
  hora_finalizacion  TIME      NOT NULL,
  fecha_inicio       DATE      NOT NULL,
  fecha_finalizacion DATE      NOT NULL,
  capacidad          INTEGER   NOT NULL CHECK (capacidad >= 0),
  status             oferta_status_enum NOT NULL DEFAULT 'programado',
  CONSTRAINT fk_oferta_grado
    FOREIGN KEY (grado_id)     REFERENCES GradoAcademico(grado_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_oferta_inst
    FOREIGN KEY (instituto_id) REFERENCES Establecimiento(instituto_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_oferta_curso
    FOREIGN KEY (curso_id)     REFERENCES CursoCatalogo(curso_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT chk_fechas_oferta CHECK (fecha_finalizacion >= fecha_inicio)
);

-- TarifaCurso
CREATE TABLE IF NOT EXISTS TarifaCurso (
  tarifa_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id          UUID NOT NULL,
  monto_inscripcion  NUMERIC(10,2) NOT NULL CHECK (monto_inscripcion >= 0),
  monto_mensualidad  NUMERIC(10,2) NOT NULL CHECK (monto_mensualidad >= 0),
  CONSTRAINT fk_tarifa_oferta
    FOREIGN KEY (oferta_id) REFERENCES OfertaCurso(oferta_id)
      ON DELETE CASCADE ON UPDATE CASCADE
);

-- Inscripcion
CREATE TABLE IF NOT EXISTS Inscripcion (
  inscripcion_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id        UUID NOT NULL,
  oferta_id        UUID NOT NULL,
  fechaInscripcion DATE NOT NULL,
  estado           VARCHAR(15) NOT NULL,
  CONSTRAINT fk_insc_alumno
    FOREIGN KEY (alumno_id) REFERENCES Alumno(alumno_id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_insc_oferta
    FOREIGN KEY (oferta_id) REFERENCES OfertaCurso(oferta_id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT uq_insc_unica UNIQUE (alumno_id, oferta_id)
);

-- ============================================================
-- 4) Evaluaciones, sesiones y asistencia
-- ============================================================

-- UnidadEvaluacion
CREATE TABLE IF NOT EXISTS UnidadEvaluacion (
  evaluacion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id     UUID NOT NULL,
  nombre        VARCHAR(25) NOT NULL,
  CONSTRAINT fk_eval_oferta
    FOREIGN KEY (oferta_id) REFERENCES OfertaCurso(oferta_id)
      ON DELETE CASCADE ON UPDATE CASCADE
);

-- Calificacion
CREATE TABLE IF NOT EXISTS Calificacion (
  inscripcion_id UUID NOT NULL,
  evaluacion_id  UUID NOT NULL,
  nota           NUMERIC(5,2) NOT NULL CHECK (nota >= 0),
  observaciones  TEXT,
  PRIMARY KEY (inscripcion_id, evaluacion_id),
  CONSTRAINT fk_calif_insc
    FOREIGN KEY (inscripcion_id) REFERENCES Inscripcion(inscripcion_id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_calif_eval
    FOREIGN KEY (evaluacion_id)  REFERENCES UnidadEvaluacion(evaluacion_id)
      ON DELETE CASCADE ON UPDATE CASCADE
);

-- SesionClase
CREATE TABLE IF NOT EXISTS SesionClase (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id  UUID NOT NULL,
  fecha      DATE NOT NULL,
  CONSTRAINT fk_sesion_oferta
    FOREIGN KEY (oferta_id) REFERENCES OfertaCurso(oferta_id)
      ON DELETE CASCADE ON UPDATE CASCADE
);

-- Asistencia
CREATE TABLE IF NOT EXISTS Asistencia (
  session_id     UUID NOT NULL,
  inscripcion_id UUID NOT NULL,
  presente       BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (session_id, inscripcion_id),
  CONSTRAINT fk_asist_sesion
    FOREIGN KEY (session_id)     REFERENCES SesionClase(session_id)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_asist_insc
    FOREIGN KEY (inscripcion_id) REFERENCES Inscripcion(inscripcion_id)
      ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 5) Cobros, recibos y detalle
-- ============================================================

-- Cargo
CREATE TABLE IF NOT EXISTS Cargo (
  cargo_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarifa_id   UUID NOT NULL,
  periodo_mes mes_enum NOT NULL,
  concepto    VARCHAR(30) NOT NULL,
  monto       NUMERIC(10,2) NOT NULL CHECK (monto >= 0),
  estado      cargo_estado_enum NOT NULL DEFAULT 'pendiente',
  CONSTRAINT fk_cargo_tarifa
    FOREIGN KEY (tarifa_id) REFERENCES TarifaCurso(tarifa_id)
      ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT uq_cargo_por_mes UNIQUE (tarifa_id, periodo_mes, concepto)
);

-- Secuencia para correlativo de Recibo (necesaria para la función)
CREATE SEQUENCE IF NOT EXISTS seq_recibo_correlativo
  START 1 INCREMENT 1 MINVALUE 1;

-- Recibo
CREATE TABLE IF NOT EXISTS Recibo (
  recibo_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alumno_id          UUID NOT NULL REFERENCES Alumno(alumno_id),
  correlativo_recibo VARCHAR(20) UNIQUE,
  fecha              DATE NOT NULL DEFAULT CURRENT_DATE,
  total              NUMERIC(10,2) NOT NULL DEFAULT 0,
  estado             recibo_estado_enum NOT NULL DEFAULT 'EMITIDO',
  CONSTRAINT chk_total_recibo_nonneg CHECK (total >= 0)
);

-- Función y trigger para autogenerar correlativo
CREATE OR REPLACE FUNCTION set_correlativo_recibo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.correlativo_recibo IS NULL THEN
    NEW.correlativo_recibo := 'RECIBO-' || LPAD(nextval('seq_recibo_correlativo')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recibo_correlativo ON Recibo;
CREATE TRIGGER trg_recibo_correlativo
BEFORE INSERT ON Recibo
FOR EACH ROW
EXECUTE FUNCTION set_correlativo_recibo();

-- DetalleRecibo
CREATE TABLE IF NOT EXISTS DetalleRecibo (
  recibo_id      UUID NOT NULL REFERENCES Recibo(recibo_id) ON DELETE CASCADE,
  cargo_id       UUID NOT NULL REFERENCES Cargo(cargo_id)   ON DELETE RESTRICT,
  monto_aplicado NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (recibo_id, cargo_id),
  CONSTRAINT chk_monto_aplicado_nonneg CHECK (monto_aplicado >= 0)
);

-- ============================================================
-- 6) Índices útiles
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_alumno_instituto   ON Alumno(instituto_id);
CREATE INDEX IF NOT EXISTS idx_oferta_grado       ON OfertaCurso(grado_id);
CREATE INDEX IF NOT EXISTS idx_oferta_inst        ON OfertaCurso(instituto_id);
CREATE INDEX IF NOT EXISTS idx_oferta_curso       ON OfertaCurso(curso_id);
CREATE INDEX IF NOT EXISTS idx_insc_alumno        ON Inscripcion(alumno_id);
CREATE INDEX IF NOT EXISTS idx_insc_oferta        ON Inscripcion(oferta_id);
CREATE INDEX IF NOT EXISTS idx_eval_oferta        ON UnidadEvaluacion(oferta_id);
CREATE INDEX IF NOT EXISTS idx_sesion_oferta      ON SesionClase(oferta_id);
CREATE INDEX IF NOT EXISTS idx_cargo_tarifa       ON Cargo(tarifa_id);
CREATE INDEX IF NOT EXISTS idx_recibo_alumno      ON Recibo(alumno_id);

-- Datos semilla para demo y smoke tests
INSERT INTO nivelacademico (nivel_id, nombre)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Primaria'),
    ('22222222-2222-2222-2222-222222222222', 'Básico')
ON CONFLICT (nivel_id) DO NOTHING;

INSERT INTO gradoacademico (grado_id, nivel_id, nombre)
VALUES
    ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Primer Grado')
ON CONFLICT (grado_id) DO NOTHING;

INSERT INTO establecimiento (instituto_id, nombre, direccion, nombre_director, telefono, jornada)
VALUES
    ('44444444-4444-4444-4444-444444444444', 'Instituto Central QA', 'Av. Principal 123', 'Ana Gómez', '5025550000', 'Matutina')
ON CONFLICT (instituto_id) DO NOTHING;

INSERT INTO cursocatalogo (curso_id, nombre, nivel_curso, duracion)
VALUES
    ('55555555-5555-5555-5555-555555555555', 'Matemáticas', 'Primaria', '10 meses')
ON CONFLICT (curso_id) DO NOTHING;

INSERT INTO ofertacurso (oferta_id, grado_id, instituto_id, curso_id, dia, hora_inicio, hora_finalizacion, fecha_inicio, fecha_finalizacion, capacidad, status)
VALUES
    ('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'Lunes', '08:00:00', '09:30:00', '2025-01-10', '2025-10-30', 30, 'programado')
ON CONFLICT (oferta_id) DO NOTHING;

INSERT INTO tarifacurso (tarifa_id, oferta_id, monto_inscripcion, monto_mensualidad)
VALUES
    ('77777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666', 150.00, 200.00)
ON CONFLICT (tarifa_id) DO NOTHING;

INSERT INTO alumno (alumno_id, instituto_id, carnet, nombre, apellido, telefono, direccion, fecha_nacimiento, estado)
VALUES
    ('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'A-1001', 'Luis', 'Ramírez', '5025551000', 'Zona 5', '2012-03-15', 'activo')
ON CONFLICT (alumno_id) DO NOTHING;

INSERT INTO encargado (encargado_id, nombre, apellido, telefono)
VALUES
    ('99999999-9999-9999-9999-999999999999', 'Carla', 'Santos', '5025552000')
ON CONFLICT (encargado_id) DO NOTHING;

INSERT INTO alumnoencargado (alumno_id, encargado_id)
VALUES
    ('88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999')
ON CONFLICT DO NOTHING;

INSERT INTO inscripcion (inscripcion_id, alumno_id, oferta_id, fechainscripcion, estado)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-666666666666', '2025-01-15', 'ACTIVA')
ON CONFLICT (inscripcion_id) DO NOTHING;

INSERT INTO sesionclase (session_id, oferta_id, fecha)
VALUES
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', '2025-02-05')
ON CONFLICT (session_id) DO NOTHING;

INSERT INTO unidadevaluacion (evaluacion_id, oferta_id, nombre)
VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '66666666-6666-6666-6666-666666666666', 'Diagnóstico')
ON CONFLICT (evaluacion_id) DO NOTHING;

INSERT INTO cargo (cargo_id, tarifa_id, periodo_mes, concepto, monto, estado)
VALUES
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', 'enero', 'Mensualidad Enero', 200.00, 'pendiente')
ON CONFLICT (cargo_id) DO NOTHING;
-- NOTA: Cree recibos y detalles adicionales según necesidad de pruebas

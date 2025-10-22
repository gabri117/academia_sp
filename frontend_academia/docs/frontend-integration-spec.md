---
title: Frontend Integration Spec
date: 2025-02-01
---

# Modulo A

## Endpoints (metodo, path, params, body, response, errores, paginacion)

| Metodo | Path | Parametros | Body | Respuesta | Errores | Paginacion |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/alumnos` | `page`, `size`, `sort` | — | `Page<Alumno>` | 500 | Si |
| GET | `/alumnos/{id}` | `id` | — | `Alumno` | 404 | No |
| POST | `/alumnos` | — | `AlumnoCreateDTO` | `Alumno` | 400 | No |
| PUT | `/alumnos/{id}` | `id` | `AlumnoUpdateDTO` | `Alumno` | 400, 404 | No |
| DELETE | `/alumnos/{id}` | `id` | — | 204 vacio | 404 | No |
| GET | `/encargados` | `page`, `size`, `sort` | — | `Page<Encargado>` | 500 | Si |
| GET | `/encargados/{id}` | `id` | — | `Encargado` | 404 | No |
| POST | `/encargados` | — | `EncargadoCreateUpdateDTO` | `Encargado` | 400 | No |
| PUT | `/encargados/{id}` | `id` | `EncargadoCreateUpdateDTO` | `Encargado` | 400, 404 | No |
| DELETE | `/encargados/{id}` | `id` | — | 204 vacio | 404 | No |
| GET | `/establecimientos` | `page`, `size`, `sort` | — | `Page<Establecimiento>` | 500 | Si |
| GET | `/establecimientos/{institutoId}` | `institutoId` | — | `Establecimiento` | 404 | No |
| POST | `/establecimientos` | — | `EstablecimientoCreateUpdateDTO` | `Establecimiento` | 400 | No |
| PUT | `/establecimientos/{institutoId}` | `institutoId` | `EstablecimientoCreateUpdateDTO` | `Establecimiento` | 400, 404 | No |
| DELETE | `/establecimientos/{institutoId}` | `institutoId` | — | 204 vacio | 404 | No |
| GET | `/niveles-academicos` | — | — | `Nivel[]` | 500 | No |
| GET | `/niveles-academicos/{nivelId}` | `nivelId` | — | `Nivel` | 404 | No |
| POST | `/niveles-academicos` | — | `NivelCreateUpdateDTO` | `Nivel` | 400 | No |
| PUT | `/niveles-academicos/{nivelId}` | `nivelId` | `NivelCreateUpdateDTO` | `Nivel` | 400, 404 | No |
| DELETE | `/niveles-academicos/{nivelId}` | `nivelId` | — | 204 vacio | 404 | No |
| GET | `/grados-academicos` | — | — | `Grado[]` | 500 | No |
| GET | `/grados-academicos/nivel/{nivelId}` | `nivelId` | — | `Grado[]` | 404 | No |
| GET | `/grados-academicos/{gradoId}` | `gradoId` | — | `Grado` | 404 | No |
| POST | `/grados-academicos` | — | `GradoCreateUpdateDTO` | `Grado` | 400 | No |
| PUT | `/grados-academicos/{gradoId}` | `gradoId` | `GradoCreateUpdateDTO` | `Grado` | 400, 404 | No |
| DELETE | `/grados-academicos/{gradoId}` | `gradoId` | — | 204 vacio | 404 | No |
| GET | `/alumno-encargado/alumno/{alumnoId}` | `alumnoId` | — | `AlumnoEncargado[]` | 404 | No |
| GET | `/alumno-encargado/encargado/{encargadoId}` | `encargadoId` | — | `AlumnoEncargado[]` | 404 | No |
| POST | `/alumno-encargado` | — | `VinculoAlumnoEncargadoRequest` | `AlumnoEncargado` | 400, 409 | No |
| DELETE | `/alumno-encargado/{alumnoId}/{encargadoId}` | `alumnoId`, `encargadoId` | — | 204 vacio | 404 | No |

## Modelos y campos (Modulo A)

| Modelo/Campo | Tipo | Required | Default | Enum | Reglas |
| --- | --- | --- | --- | --- | --- |
| Alumno.id | uuid | Si | — | — | — |
| Alumno.institutoId | uuid | Si | — | — | — |
| Alumno.nombre | string | Si | — | — | max 50, notBlank |
| Alumno.apellido | string | Si | — | — | max 50, notBlank |
| Alumno.telefono | string | No | — | — | max 15 |
| Alumno.direccion | string | No | — | — | max 100 |
| Alumno.carnet | string | No | — | — | max 20 |
| Alumno.fechaNacimiento | date | No | — | — | formato `yyyy-MM-dd` |
| Alumno.estado | enum | Si | activo | activo/inactivo | — |
| Encargado.id | uuid | Si | — | — | — |
| Encargado.nombre | string | Si | — | — | max 50, notBlank |
| Encargado.apellido | string | Si | — | — | max 50, notBlank |
| Encargado.telefono | string | No | — | — | max 15 |
| Establecimiento.institutoId | uuid | Si | — | — | — |
| Establecimiento.nombre | string | Si | — | — | max 100, notBlank |
| Establecimiento.direccion | string | No | — | — | max 100 |
| Establecimiento.nombreDirector | string | No | — | — | max 50 |
| Establecimiento.telefono | string | No | — | — | max 15 |
| Establecimiento.jornada | enum | Si | — | Matutina/Vespertina/Nocturna | — |
| Nivel.nivelId | uuid | Si | — | — | — |
| Nivel.nombre | string | Si | — | — | max 20, notBlank |
| Grado.gradoId | uuid | Si | — | — | — |
| Grado.nivelId | uuid | Si | — | — | — |
| Grado.nombre | string | Si | — | — | max 50, notBlank |
| AlumnoEncargado.alumnoId | uuid | Si | — | — | — |
| AlumnoEncargado.alumnoNombreCompleto | string | Si | — | — | — |
| AlumnoEncargado.encargadoId | uuid | Si | — | — | — |
| AlumnoEncargado.encargadoNombreCompleto | string | Si | — | — | — |

## Mapa de paginas (Modulo A)

| Pagina | Endpoints | Acciones | Campos / Validaciones |
| --- | --- | --- | --- |
| AlumnosList | GET `/alumnos`, DELETE `/alumnos/{id}` | Listar, paginar, ordenar, eliminar | Busca localmente (TODO backend). |
| AlumnosForm | GET `/alumnos/{id}`, GET `/establecimientos`, POST/PUT `/alumnos` | Crear/editar | `alumnoCreateSchema`. |
| VincularEncargado | GET `/alumnos`, `/encargados`, `/alumno-encargado/*`, POST/DELETE `/alumno-encargado` | Vincular/desvincular | Seleccion obligatoria de alumno/encargado. |
| EncargadosList | GET `/encargados`, DELETE `/encargados/{id}` | Listar, paginar, eliminar | Filtro local. |
| EncargadosForm | GET `/encargados/{id}`, POST/PUT `/encargados` | Crear/editar | `encargadoSchema`. |
| EstablecimientosList | GET `/establecimientos`, DELETE `/establecimientos/{id}` | Listar, paginar, eliminar | Filtro local por nombre/director. |
| EstablecimientosForm | GET `/establecimientos/{id}`, POST/PUT `/establecimientos` | Crear/editar | `establecimientoSchema`. |
| NivelesList | GET `/niveles-academicos` | Listar | Filtro local por nombre. |
| NivelesForm | GET `/niveles-academicos/{id}`, POST/PUT `/niveles-academicos` | Crear/editar | `nivelSchema`. |
| GradosList | GET `/grados-academicos`, `/niveles-academicos` | Listar, eliminar | Muestra nombre del nivel. |
| GradosForm | GET `/grados-academicos/{id}`, GET `/niveles-academicos`, POST/PUT `/grados-academicos` | Crear/editar | `gradoSchema`. |

---

# Modulo B

## Endpoints (metodo, path, params, body, response, errores, paginacion)

| Metodo | Path | Parametros | Body | Respuesta | Errores | Paginacion |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/cursos-catalogo` | `page`, `size`, `sort`, `nombre` | — | `Page<CursoCatalogo>` | 500 | Si |
| GET | `/cursos-catalogo/{id}` | `id` | — | `CursoCatalogo` | 404 | No |
| POST | `/cursos-catalogo` | — | `CursoCatalogoCreateDTO` | `CursoCatalogo` | 400 | No |
| PUT | `/cursos-catalogo/{id}` | `id` | `CursoCatalogoUpdateDTO` | `CursoCatalogo` | 400, 404 | No |
| DELETE | `/cursos-catalogo/{id}` | `id` | — | 204 vacio | 404 | No |
| GET | `/ofertas-curso` | `gradoId`, `institutoId`, `cursoId`, `page`, `size`, `sort` | — | `Page<OfertaCurso>` | 500 | Si |
| GET | `/ofertas-curso/{id}` | `id` | — | `OfertaCurso` | 404 | No |
| POST | `/ofertas-curso` | — | `OfertaCursoCreateDTO` | `OfertaCurso` | 400 | No |
| PUT | `/ofertas-curso/{id}` | `id` | `OfertaCursoUpdateDTO` | `OfertaCurso` | 400, 404 | No |
| DELETE | `/ofertas-curso/{id}` | `id` | — | 204 vacio | 404 | No |
| GET | `/inscripciones` | `page`, `size`, `sort` | — | `Page<Inscripcion>` | 500 | Si |
| GET | `/inscripciones/{id}` | `id` | — | `Inscripcion` | 404 | No |
| POST | `/inscripciones` | — | `InscripcionCreateDTO` | `Inscripcion` | 400 | No |
| PUT | `/inscripciones/{id}` | `id` | `InscripcionUpdateDTO` | `Inscripcion` | 400, 404 | No |
| DELETE | `/inscripciones/{id}` | `id` | — | 204 vacio | 404 | No |
| GET | `/inscripciones/alumno/{alumnoId}` | `alumnoId` | — | `Inscripcion[]` | 404 | No |
| GET | `/inscripciones/oferta/{ofertaId}` | `ofertaId` | — | `Inscripcion[]` | 404 | No |

## Modelos y campos (Modulo B)

| Modelo/Campo | Tipo | Required | Default | Enum | Reglas |
| --- | --- | --- | --- | --- | --- |
| CursoCatalogo.id | uuid | Si | — | — | — |
| CursoCatalogo.nombre | string | Si | — | — | max 30, notBlank |
| CursoCatalogo.nivelCurso | string | No | — | — | max 20 |
| CursoCatalogo.duracion | string | No | — | — | max 20 |
| OfertaCurso.id | uuid | Si | — | — | — |
| OfertaCurso.gradoId | uuid | Si | — | — | — |
| OfertaCurso.institutoId | uuid | Si | — | — | — |
| OfertaCurso.cursoId | uuid | Si | — | — | — |
| OfertaCurso.dia | string | No | — | — | max 15 |
| OfertaCurso.horaInicio | time | Si | — | — | formato `HH:mm:ss` |
| OfertaCurso.horaFinalizacion | time | Si | — | — | formato `HH:mm:ss` |
| OfertaCurso.fechaInicio | date | Si | — | — | formato `yyyy-MM-dd` |
| OfertaCurso.fechaFinalizacion | date | Si | — | — | formato `yyyy-MM-dd` |
| OfertaCurso.capacidad | int | Si | — | — | min 0 |
| OfertaCurso.status | enum | Si | PROGRAMADO | PROGRAMADO/EN_CURSO/FINALIZADO/CANCELADO | — |
| Inscripcion.id | uuid | Si | — | — | — |
| Inscripcion.alumnoId | uuid | Si | — | — | — |
| Inscripcion.ofertaId | uuid | Si | — | — | — |
| Inscripcion.fechaInscripcion | date | Si | — | — | formato `yyyy-MM-dd` |
| Inscripcion.estado | string | Si | — | — | max 15 |

## Mapa de paginas (Modulo B)

| Pagina | Endpoints | Acciones | Campos / Validaciones |
| --- | --- | --- | --- |
| CursoCatalogoList | GET `/cursos-catalogo`, DELETE `/cursos-catalogo/{id}` | Listar, filtrar por nombre, paginar, ordenar, eliminar | Form de filtro pasa `nombre`; requiere rol admin para eliminar. |
| CursoCatalogoForm | GET `/cursos-catalogo/{id}`, POST/PUT `/cursos-catalogo` | Crear/editar curso | `cursoCatalogoSchema` (nombre requerido, opcionales normalizados). |
| OfertasList | GET `/ofertas-curso` | Listar con filtros (grado/instituto/curso), paginar, ordenar | Filtros combinados; mapping de status a label legible. |
| OfertasForm | GET `/ofertas-curso/{id}`, POST/PUT `/ofertas-curso`, catálogos (`grados`, `establecimientos`, `cursos-catalogo`) | Crear/editar oferta | `ofertaCursoSchema` (uuid requeridos, horas `HH:mm`, fechas `yyyy-MM-dd`, capacidad >=0, status enum). |
| InscripcionesList | GET `/inscripciones`, catálogos (`alumnos`, `cursos-catalogo`, `ofertas-curso`), DELETE `/inscripciones/{id}` | Listar, paginar, ordenar, eliminar, navegar a detalle | Botones "Ver alumno/oferta", editar/eliminar (solo admin). |
| InscripcionesForm | GET `/inscripciones/{id}`, POST/PUT `/inscripciones`, catálogos auxiliares | Crear/editar inscripcion | `inscripcionSchema` (alumnoId, ofertaId, fecha, estado). |
| InscripcionesPorAlumno | GET `/inscripciones/alumno/{alumnoId}`, GET `/alumnos/{id}`, catálogos | Listar inscripciones del alumno | Tabla simple; TODO(ux) breadcrumb; avisa truncamiento de catálogos. |
| InscripcionesPorOferta | GET `/inscripciones/oferta/{ofertaId}`, GET `/ofertas-curso/{id}` | Listar inscripciones de la oferta | Tabla alumnos; TODO(ux) encabezado con datos resumidos. |

## TODO (backend) Modulo B
- Incluir nombres legibles (curso, alumno) en respuestas de inscripciones para evitar consultas adicionales.
- Exponer paginación completa para catálogos consumidos por formularios (`grados`, `establecimientos`, `cursos-catalogo`).
- Documentar y validar campos `sort` soportados por los endpoints.
- Evaluar búsqueda textual adicional en `/ofertas-curso` si negocio lo requiere.

## TODO (ux) Modulo B
- Diseñar breadcrumb o navegación secundaria en vistas detalle.
- Definir estados vacíos visuales para listados sin resultados.
- Ajustar labels/tooltips finales (por ejemplo status legible).
- Validar experiencia de filtros en mobile.

## Antes vs Despues (Modulo B)

| Area | Antes | Despues |
| --- | --- | --- |
| Servicios | Endpoints llamados directamente desde páginas, sin tipos | **Servicios compartidos** con DTOs y paginación oficial, reutilizados por hooks; delegan en `src/api/client.ts`. |
| Formularios | Inputs genéricos sin validación real | `zod` schemas alineados al contrato, normalización de strings y fechas. |
| Listas | Datos mock sin filtros reales / sin paginación consistente | `Page<T>` con filtros, `page/size/sort`, y estados loading/error/empty claros. |
| Vistas detalle | No existían | Nuevas vistas por alumno y por oferta con datos cruzados. |
| Mocks | Sin cobertura | `handlers.moduleB.ts` con fixtures y filtros para cursos, ofertas e inscripciones. |
| Vinculación | DTOs antiguos, sin manejo de errores 409 | Usa `AlumnoEncargado`, feedback de MSW/cliente para conflictos. |

## Checklist QA Modulo B

1. **Cursos catálogo**
   - Listar y paginar cursos con filtro `nombre`.
   - Crear curso (validar límites de nombre/nivel/duración).
   - Editar curso existente y confirmar datos.
   - Eliminar curso (solo admin).
2. **Ofertas de curso**
   - Listar con filtros `gradoId`, `institutoId`, `cursoId` y ordenar por fecha/capacidad.
   - Crear oferta validando horas (`HH:mm`) y fechas (`yyyy-MM-dd`).
   - Editar oferta (status, capacidad, fechas).
   - Eliminar oferta (admin).
3. **Inscripciones**
   - Crear inscripción seleccionando alumno/oferta; validar estado máx 15 caracteres.
   - Editar inscripción y verificar persistencia.
   - Listar/paginar/ordenar inscripciones.
   - Eliminar inscripción (admin).
   - Abrir "Inscripciones por alumno" y "Inscripciones por oferta" desde la tabla principal.
4. **Errores**
   - Simular 400/404 (con MSW) y confirmar mensajes en formularios/listas.
   - Revisar avisos cuando catálogos auxiliares quedan truncados.
5. **Integración**
   - Ejecutar con mocks (`VITE_ENABLE_MSW=false npm run dev`) y con backend real para asegurar comportamiento equivalente.

---

## Checklist QA Módulo A

1. **Preparar entorno**: `npm install && npm run dev` (con mocks) o apuntar a backend real.
2. **Alumnos**
   - Listar alumnos (ver paginación, sort).
   - Crear alumno (validaciones nombre/apellido, fecha).
   - Editar alumno y verificar persistencia.
   - Eliminar alumno (confirmar restricción rol admin).
   - Manejar error de carga (simular 500 con MSW).
3. **Encargados**
   - Listar y ordenar.
   - Crear/editar (teléfono opcional).
   - Eliminar con usuario admin y validar alerta.
4. **Establecimientos**
   - Paginación y sort por nombre/jornada.
   - Crear establecimiento (jornada enum).
   - Actualizar teléfono y validar max-length.
   - Ver mensaje de error cuando API falla.
5. **Niveles**
   - Listar niveles existentes.
   - Crear nivel con nombre >20 (debe fallar).
   - Editar nivel.
6. **Grados**
   - Listar grados con nombres de nivel.
   - Crear grado seleccionando nivel.
   - Eliminar grado y verificar actualización.
7. **Vínculos alumno-encargado**
   - Vincular encargado, confirmar en tabla.
   - Intentar vínculo duplicado (observar error).
   - Desvincular como admin.
8. **General**
   - Revisar que estados loading y vacíos aparezcan correctamente.
   - Validar que los mocks (MSW) devuelvan datos esperados si se usa `VITE_ENABLE_MSW=true`.

---

## Modulo C

### Endpoints (metodo, path, params/body/response, errores, paginacion)

| Metodo | Path | Params / Query | Body | Respuesta | Errores | Paginacion |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/sesiones-clase` | — | `SesionClaseCreateDTO` (`ofertaId`, `fecha`) | `SesionClase` | 400 validación | No |
| GET | `/sesiones-clase/oferta/{ofertaId}` | `ofertaId` (uuid) | — | `SesionClase[]` | 404 oferta inexistente | No |
| GET | `/sesiones-clase/oferta/{ofertaId}/rango` | `ofertaId`, `desde`, `hasta` (yyyy-MM-dd) | — | `SesionClase[]` filtrado | 400 rango inválido | No |
| POST | `/asistencias` | — | `AsistenciaCreateDTO` | `Asistencia` | 400 campos faltantes | No |
| GET | `/asistencias/sesion/{sessionId}` | `sessionId` (uuid) | — | `Asistencia[]` | 404 sesión inexistente | No |
| GET | `/asistencias/inscripcion/{inscripcionId}` | `inscripcionId` (uuid) | — | `Asistencia[]` | 404 inscripción inexistente | No |
| POST | `/unidades-evaluacion` | — | `UnidadEvaluacionCreateDTO` | `UnidadEvaluacion` | 400 validación | No |
| GET | `/unidades-evaluacion/oferta/{ofertaId}` | `ofertaId` (uuid) | — | `UnidadEvaluacion[]` | 404 oferta inexistente | No |
| POST | `/calificaciones` | — | `CalificacionCreateDTO` | `Calificacion` | 400 validación | No |
| GET | `/calificaciones/inscripcion/{inscripcionId}` | `inscripcionId` (uuid) | — | `Calificacion[]` | 404 inscripción inexistente | No |
| GET | `/calificaciones/oferta/{ofertaId}` | `ofertaId` (uuid) | — | `Calificacion[]` | 404 oferta inexistente | No |
| POST | `/tarifas-curso` | — | `TarifaCursoCreateDTO` | `TarifaCurso` | 400 validación | No |
| PUT | `/tarifas-curso/{tarifaId}` | `tarifaId` (uuid) | `TarifaCursoUpdateDTO` | `TarifaCurso` | 400, 404 | No |
| GET | `/tarifas-curso/{tarifaId}` | `tarifaId` (uuid) | — | `TarifaCurso` | 404 tarifa inexistente | No |
| DELETE | `/tarifas-curso/{tarifaId}` | `tarifaId` (uuid) | — | 204 vacio | 404 | No |
| GET | `/tarifas-curso/oferta/{ofertaId}` | `ofertaId` (uuid) | — | `TarifaCurso[]` | 404 oferta inexistente | No |
| POST | `/cargos` | — | `CargoCreateDTO` | `Cargo` | 400 validación | No |
| PUT | `/cargos/{cargoId}` | `cargoId` (uuid) | `CargoUpdateDTO` | `Cargo` | 400, 404 | No |
| GET | `/cargos/{cargoId}` | `cargoId` (uuid) | — | `Cargo` | 404 cargo inexistente | No |
| DELETE | `/cargos/{cargoId}` | `cargoId` (uuid) | — | 204 vacio | 404 | No |
| GET | `/cargos/tarifa/{tarifaId}` | `tarifaId` (uuid) | — | `Cargo[]` | 404 tarifa inexistente | No |
| POST | `/cargos/{cargoId}/recalcular` | `cargoId` (uuid) | — | `Cargo` | 404 | No |
| POST | `/recibos` | — | `ReciboCreateDTO` | `Recibo` | 400 validación | No |
| GET | `/recibos/alumno/{alumnoId}` | `alumnoId` (uuid) | — | `Recibo[]` | 404 alumno inexistente | No |
| POST | `/detalle-recibo` | — | `DetalleReciboCreateDTO` | `DetalleRecibo` | 400 validación | No |
| GET | `/detalle-recibo/recibo/{reciboId}` | `reciboId` (uuid) | — | `DetalleRecibo[]` | 404 recibo inexistente | No |
| GET | `/alumnos/{alumnoId}/estado-cuenta` | `alumnoId` (uuid) | — | `EstadoCuenta` | 404 alumno inexistente | No |

### Modelos y campos (Modulo C)

| Modelo / Campo | Tipo | Required | Default | Reglas |
| --- | --- | --- | --- | --- |
| SesionClase.sessionId | uuid | Si | — | Generado backend |
| SesionClase.ofertaId | uuid | Si | — | Debe existir oferta |
| SesionClase.fecha | string | Si | — | Formato `yyyy-MM-dd` |
| Asistencia.sessionId | uuid | Si | — | — |
| Asistencia.inscripcionId | uuid | Si | — | — |
| Asistencia.presente | boolean | Si | — | true/false |
| UnidadEvaluacion.evaluacionId | uuid | Si | — | — |
| UnidadEvaluacion.ofertaId | uuid | Si | — | — |
| UnidadEvaluacion.nombre | string | Si | — | max 25, notBlank |
| Calificacion.inscripcionId | uuid | Si | — | — |
| Calificacion.evaluacionId | uuid | Si | — | — |
| Calificacion.nota | number | Si | — | 0.00 ≤ nota ≤ 100.00, 2 decimales |
| Calificacion.observaciones | string | No | — | max 250 |
| TarifaCurso.tarifaId | uuid | Si | — | — |
| TarifaCurso.ofertaId | uuid | Si | — | — |
| TarifaCurso.montoInscripcion | number | Si | — | ≥ 0.00, 2 decimales |
| TarifaCurso.montoMensualidad | number | Si | — | ≥ 0.00, 2 decimales |
| Cargo.cargoId | uuid | Si | — | — |
| Cargo.tarifaId | uuid | Si | — | — |
| Cargo.periodoMes | enum Mes | Si | — | Mes calendario |
| Cargo.concepto | string | Si | — | max 30, notBlank |
| Cargo.monto | number | Si | — | ≥ 0.00, 2 decimales |
| Cargo.estado | enum CargoEstado | Si | PENDIENTE | PENDIENTE/CANCELADO |
| Recibo.reciboId | uuid | Si | — | — |
| Recibo.alumnoId | uuid | Si | — | — |
| Recibo.correlativoRecibo | string | No | — | max 20 |
| Recibo.fecha | string | No | — | `yyyy-MM-dd` |
| Recibo.total | number | No | — | ≥ 0.00, 2 decimales |
| Recibo.estado | enum ReciboEstado | Si | EMITIDO | EMITIDO/ANULADO |
| DetalleRecibo.reciboId | uuid | Sim | — | Parte clave compuesta |
| DetalleRecibo.cargoId | uuid | Si | — | Parte clave compuesta |
| DetalleRecibo.montoAplicado | number | Si | — | ≥ 0.00, 2 decimales |
| EstadoCuenta.alumnoId | uuid | Si | — | — |
| EstadoCuenta.periodos | array | Si | — | `EstadoCuentaPeriodo[]` |
| EstadoCuenta.saldoTotal | number | Si | — | Puede ser negativo |
| EstadoCuentaPeriodo.periodo | enum Mes | Si | — | — |
| EstadoCuentaPeriodo.totalCargos | number | Si | — | ≥ 0.00 |
| EstadoCuentaPeriodo.totalPagos | number | Si | — | ≥ 0.00 |
| EstadoCuentaPeriodo.saldo | number | Si | — | ≥ -999999.99 |

### Mapa de paginas — endpoints / acciones — campos / validaciones

| Pagina | Endpoints | Acciones | Campos / Validaciones |
| --- | --- | --- | --- |
| `sesiones/SesionesForm` | POST `/sesiones-clase` | Crear sesión | `sesionClaseCreateSchema` (ofertaId uuid, fecha ISO) |
| `sesiones/SesionesPorOferta` | GET `/sesiones-clase/oferta/{id}`, `/rango` | Buscar por oferta/rango | Filtros uuid y fechas validadas |
| `asistencias/AsistenciasForm` | POST `/asistencias` | Registrar asistencia | `asistenciaCreateSchema` (uuid + boolean) |
| `asistencias/AsistenciasPorSesion` | GET `/asistencias/sesion/{sessionId}` | Listar por sesión | Filtro uuid |
| `asistencias/AsistenciasPorInscripcion` | GET `/asistencias/inscripcion/{inscripcionId}` | Listar por inscripción | Filtro uuid |
| `unidades/UnidadesForm` | POST `/unidades-evaluacion` | Crear unidad | `unidadEvaluacionCreateSchema` (nombre ≤25) |
| `unidades/UnidadesPorOferta` | GET `/unidades-evaluacion/oferta/{ofertaId}` | Listar unidades | Filtro uuid |
| `calificaciones/CalificacionesForm` | POST `/calificaciones` | Registrar calificación | `calificacionCreateSchema` (nota 0–100, observaciones ≤250) |
| `calificaciones/CalificacionesPorInscripcion` | GET `/calificaciones/inscripcion/{inscripcionId}` | Historial por inscripción | Filtro uuid |
| `calificaciones/CalificacionesPorOferta` | GET `/calificaciones/oferta/{ofertaId}` | Resumen por oferta | Filtro uuid |
| `tarifas/TarifasForm` | POST `/tarifas-curso` | Crear tarifa | `tarifaCursoCreateSchema` (montos ≥0) |
| `cargos/CargosForm` | POST `/cargos` | Crear cargo | `cargoCreateSchema` (mes enum, monto ≥0) |
| `cargos/CargosPorTarifa` | GET `/cargos/tarifa/{tarifaId}`, POST `/cargos/{cargoId}/recalcular` | Listar y recalcular | Filtros uuid, acción recalcular |
| `recibos/RecibosForm` | POST `/recibos` | Registrar recibo | `reciboCreateSchema` (fecha opt, total ≥0) |
| `recibos/RecibosPorAlumno` | GET `/recibos/alumno/{alumnoId}` | Listar recibos | Filtro uuid |
| `recibos/DetalleReciboForm` | POST `/detalle-recibo` | Registrar detalle | `detalleReciboCreateSchema` (uuid + monto ≥0) |
| `recibos/DetallePorRecibo` | GET `/detalle-recibo/recibo/{reciboId}` | Ver detalle | Filtro uuid |
| `finanzas/EstadoCuentaAlumno` | GET `/alumnos/{alumnoId}/estado-cuenta` | Consultar estado | Filtro uuid, muestra resumen |

### TODO

#### TODO (backend)
- Documentar errores estructurados para rangos inválidos.
- Definir lógica final de recalculo de cargos (ajuste de estado).
- Evaluar paginación en listados largos (asistencias, calificaciones, recibos).
- Confirmar si `/detalle-recibo` requiere soporte de idempotencia/PUT.

#### TODO (ux)
- Diseñar empty states específicos (sesiones sin resultados, asistencias vacías, etc.).
- Revisar necesidad de selectores avanzados de fecha/rango.
- Definir iconografía para estados (Presente/Ausente, Recibo Emitido/Anulado).
- Ajustar copy de confirmaciones/deshacer en acciones sensibles.

### Antes vs Despues (Modulo C)

| Area | Antes | Despues |
| --- | --- | --- |
| Formularios | Validaciones manuales, sin normalizar decimales/fechas | `zod` schemas compartidos, conversión automática de montos y fechas |
| Listados | Datos mock básicos, sin manejo de errores | `useApiQuery` con loading/error/empty claros y filtros controlados |
| Servicios | Axios ad-hoc por página | Servicios tipados que delegan en `src/api/client.ts` |
| Documentación | No había referencia | Tablas de endpoints/modelos y mapas de página |

### Checklist QA Modulo C

1. **Sesiones**
   - Crear sesión con fecha válida.
   - Filtrar sesiones por oferta y rango (caso sin resultados).
   - Ver mensaje al omitir `ofertaId`.
2. **Asistencias**
   - Registrar asistencia (presente y ausente).
   - Consultar por sesión y por inscripción.
   - Probar UUID inválido y revisar feedback.
3. **Unidades y Calificaciones**
   - Crear unidad (nombre ≤25).
   - Registrar calificación (nota 0–100, 2 decimales).
   - Listar calificaciones por inscripción y oferta.
   - Forzar nota >100 y validar error.
4. **Tarifas y Cargos**
   - Crear tarifa (montos ≥0).
   - Actualizar tarifa existente.
   - Crear cargo y recalcular uno existente.
5. **Recibos y Detalle**
   - Crear recibo (fecha opcional).
   - Listar recibos por alumno.
   - Registrar detalle de recibo y verificar listado.
6. **Estado de cuenta**
   - Consultar estado de cuenta (con y sin datos).
7. **Errores y formatos**
   - Forzar 400 en cada endpoint (monto negativo, uuid vacío) y comprobar mensajes.
   - Verificar formatos `yyyy-MM-dd` y montos `0.00`.
8. **Mocks vs backend**
   - Ejecutar `VITE_ENABLE_MSW=false npm run dev` para ejercitar mocks.
   - Cambiar a backend real (sin flag) y repetir flujo crítico.

import { HttpResponse, http } from 'msw'

import sesionesList from './fixtures/sesiones.list.json'
import sesionCreate from './fixtures/sesiones.create.json'
import asistenciasPorSesion from './fixtures/asistencias.sesion.json'
import asistenciasPorInscripcion from './fixtures/asistencias.inscripcion.json'
import asistenciaCreate from './fixtures/asistencias.create.json'
import unidadesList from './fixtures/unidades.list.json'
import unidadCreate from './fixtures/unidades.create.json'
import calificacionesInscripcion from './fixtures/calificaciones.inscripcion.json'
import calificacionesOferta from './fixtures/calificaciones.oferta.json'
import calificacionCreate from './fixtures/calificaciones.create.json'
import tarifasList from './fixtures/tarifas.list.json'
import tarifaDetail from './fixtures/tarifas.detail.json'
import tarifaCreate from './fixtures/tarifas.create.json'
import tarifaUpdate from './fixtures/tarifas.update.json'
import cargosList from './fixtures/cargos.list.json'
import cargoDetail from './fixtures/cargos.detail.json'
import cargoCreate from './fixtures/cargos.create.json'
import cargoUpdate from './fixtures/cargos.update.json'
import recibosList from './fixtures/recibos.list.json'
import reciboCreate from './fixtures/recibos.create.json'
import detalleReciboList from './fixtures/detalle-recibo.list.json'
import detalleReciboCreate from './fixtures/detalle-recibo.create.json'
import estadoCuentaDetail from './fixtures/estado-cuenta.detail.json'

const delay = 400
const apiBase = 'http://localhost:8080/api/v1'

export const moduleCHandlers = [
  // Sesiones de clase
  http.get(`${apiBase}/sesiones-clase/oferta/:ofertaId`, ({ params, request }) => {
    const search = new URL(request.url).searchParams
    const desde = search.get('desde')
    const hasta = search.get('hasta')
    const filtered = (sesionesList as typeof sesionesList).filter((sesion) => {
      if (sesion.ofertaId !== params.ofertaId) return false
      if (desde && sesion.fecha < desde) return false
      if (hasta && sesion.fecha > hasta) return false
      return true
    })
    return HttpResponse.json(filtered, { status: 200, delay })
  }),
  http.post(`${apiBase}/sesiones-clase`, async ({ request }) => {
    const body = await request.json()
    if (!body?.ofertaId || !body?.fecha) {
      return HttpResponse.json(
        { message: 'ofertaId y fecha son obligatorios' },
        { status: 400, delay },
      )
    }
    return HttpResponse.json(
      {
        ...sesionCreate,
        sessionId: crypto.randomUUID(),
        ofertaId: body.ofertaId,
        fecha: body.fecha,
      },
      { status: 201, delay },
    )
  }),

  // Asistencias
  http.get(`${apiBase}/asistencias/sesion/:sessionId`, ({ params }) => {
    const data = (asistenciasPorSesion as typeof asistenciasPorSesion).filter(
      (item) => item.sessionId === params.sessionId,
    )
    return HttpResponse.json(data, { status: 200, delay })
  }),
  http.get(`${apiBase}/asistencias/inscripcion/:inscripcionId`, ({ params }) => {
    const data = (asistenciasPorInscripcion as typeof asistenciasPorInscripcion).filter(
      (item) => item.inscripcionId === params.inscripcionId,
    )
    return HttpResponse.json(data, { status: 200, delay })
  }),
  http.post(`${apiBase}/asistencias`, async ({ request }) => {
    const body = await request.json()
    if (!body?.sessionId || !body?.inscripcionId) {
      return HttpResponse.json(
        { message: 'sessionId e inscripcionId son obligatorios' },
        { status: 400, delay },
      )
    }
    return HttpResponse.json(
      { ...asistenciaCreate, ...body },
      { status: 201, delay },
    )
  }),

  // Unidades de evaluación
  http.get(`${apiBase}/unidades-evaluacion/oferta/:ofertaId`, ({ params }) => {
    const data = (unidadesList as typeof unidadesList).filter(
      (item) => item.ofertaId === params.ofertaId,
    )
    return HttpResponse.json(data, { status: 200, delay })
  }),
  http.post(`${apiBase}/unidades-evaluacion`, async ({ request }) => {
    const body = await request.json()
    if (!body?.ofertaId || !body?.nombre) {
      return HttpResponse.json(
        { message: 'ofertaId y nombre son obligatorios' },
        { status: 400, delay },
      )
    }
    return HttpResponse.json(
      {
        ...unidadCreate,
        evaluacionId: crypto.randomUUID(),
        ofertaId: body.ofertaId,
        nombre: body.nombre,
      },
      { status: 201, delay },
    )
  }),

  // Calificaciones
  http.get(`${apiBase}/calificaciones/inscripcion/:inscripcionId`, ({ params }) => {
    const data = (calificacionesInscripcion as typeof calificacionesInscripcion).filter(
      (item) => item.inscripcionId === params.inscripcionId,
    )
    return HttpResponse.json(data, { status: 200, delay })
  }),
  http.get(`${apiBase}/calificaciones/oferta/:ofertaId`, () =>
    HttpResponse.json(calificacionesOferta, { status: 200, delay }),
  ),
  http.post(`${apiBase}/calificaciones`, async ({ request }) => {
    const body = await request.json()
    if (!body?.inscripcionId || !body?.evaluacionId || typeof body?.nota !== 'number') {
      return HttpResponse.json(
        { message: 'inscripcionId, evaluacionId y nota son obligatorios' },
        { status: 400, delay },
      )
    }
    return HttpResponse.json({ ...calificacionCreate, ...body }, { status: 201, delay })
  }),

  // Tarifas
  http.get(`${apiBase}/tarifas-curso/oferta/:ofertaId`, ({ params }) => {
    const data = (tarifasList as typeof tarifasList).filter(
      (item) => item.ofertaId === params.ofertaId,
    )
    return HttpResponse.json(data, { status: 200, delay })
  }),
  http.get(`${apiBase}/tarifas-curso/:tarifaId`, ({ params }) => {
    if (params.tarifaId === (tarifaDetail as { tarifaId: string }).tarifaId) {
      return HttpResponse.json(tarifaDetail, { status: 200, delay })
    }
    return HttpResponse.json({ message: 'Tarifa no encontrada' }, { status: 404, delay })
  }),
  http.post(`${apiBase}/tarifas-curso`, async ({ request }) => {
    const body = await request.json()
    if (!body?.ofertaId) {
      return HttpResponse.json({ message: 'ofertaId requerido' }, { status: 400, delay })
    }
    return HttpResponse.json(
      { ...tarifaCreate, ...body, tarifaId: crypto.randomUUID() },
      { status: 201, delay },
    )
  }),
  http.put(`${apiBase}/tarifas-curso/:tarifaId`, async ({ params, request }) => {
    const body = await request.json()
    if (params.tarifaId !== (tarifaDetail as { tarifaId: string }).tarifaId) {
      return HttpResponse.json({ message: 'Tarifa no encontrada' }, { status: 404, delay })
    }
    return HttpResponse.json({ ...tarifaUpdate, ...body, tarifaId: params.tarifaId }, { status: 200, delay })
  }),
  http.delete(`${apiBase}/tarifas-curso/:tarifaId`, ({ params }) => {
    if (params.tarifaId !== (tarifaDetail as { tarifaId: string }).tarifaId) {
      return HttpResponse.json({ message: 'Tarifa no encontrada' }, { status: 404, delay })
    }
    return new HttpResponse(null, { status: 204, delay })
  }),

  // Cargos
  http.get(`${apiBase}/cargos/tarifa/:tarifaId`, ({ params }) => {
    const data = (cargosList as typeof cargosList).filter((item) => item.tarifaId === params.tarifaId)
    return HttpResponse.json(data, { status: 200, delay })
  }),
  http.get(`${apiBase}/cargos/:cargoId`, ({ params }) => {
    if (params.cargoId === (cargoDetail as { cargoId: string }).cargoId) {
      return HttpResponse.json(cargoDetail, { status: 200, delay })
    }
    return HttpResponse.json({ message: 'Cargo no encontrado' }, { status: 404, delay })
  }),
  http.post(`${apiBase}/cargos`, async ({ request }) => {
    const body = await request.json()
    if (!body?.tarifaId) {
      return HttpResponse.json({ message: 'tarifaId requerido' }, { status: 400, delay })
    }
    return HttpResponse.json(
      { ...cargoCreate, ...body, cargoId: crypto.randomUUID() },
      { status: 201, delay },
    )
  }),
  http.put(`${apiBase}/cargos/:cargoId`, async ({ params, request }) => {
    const body = await request.json()
    if (params.cargoId !== (cargoDetail as { cargoId: string }).cargoId) {
      return HttpResponse.json({ message: 'Cargo no encontrado' }, { status: 404, delay })
    }
    return HttpResponse.json({ ...cargoUpdate, ...body, cargoId: params.cargoId }, { status: 200, delay })
  }),
  http.delete(`${apiBase}/cargos/:cargoId`, ({ params }) => {
    if (params.cargoId !== (cargoDetail as { cargoId: string }).cargoId) {
      return HttpResponse.json({ message: 'Cargo no encontrado' }, { status: 404, delay })
    }
    return new HttpResponse(null, { status: 204, delay })
  }),
  http.post(`${apiBase}/cargos/:cargoId/recalcular`, ({ params }) => {
    if (params.cargoId !== (cargoDetail as { cargoId: string }).cargoId) {
      return HttpResponse.json({ message: 'Cargo no encontrado' }, { status: 404, delay })
    }
    return HttpResponse.json({ ...cargoDetail, monto: cargoDetail.monto }, { status: 200, delay })
  }),

  // Recibos
  http.get(`${apiBase}/recibos/alumno/:alumnoId`, ({ params }) => {
    const data = (recibosList as typeof recibosList).filter((item) => item.alumnoId === params.alumnoId)
    return HttpResponse.json(data, { status: 200, delay })
  }),
  http.get(`${apiBase}/recibos/:reciboId`, ({ params }) => {
    const recibo = (recibosList as typeof recibosList).find((item) => item.reciboId === params.reciboId)
    if (!recibo) {
      return HttpResponse.json({ message: 'Recibo no encontrado' }, { status: 404, delay })
    }
    return HttpResponse.json(recibo, { status: 200, delay })
  }),
  http.post(`${apiBase}/recibos`, async ({ request }) => {
    const body = await request.json()
    if (!body?.alumnoId) {
      return HttpResponse.json({ message: 'alumnoId requerido' }, { status: 400, delay })
    }
    return HttpResponse.json(
      { ...reciboCreate, ...body, reciboId: crypto.randomUUID() },
      { status: 201, delay },
    )
  }),
  http.put(`${apiBase}/recibos/:reciboId`, async ({ params, request }) => {
    const body = await request.json()
    const recibo = (recibosList as typeof recibosList).find((item) => item.reciboId === params.reciboId)
    if (!recibo) {
      return HttpResponse.json({ message: 'Recibo no encontrado' }, { status: 404, delay })
    }
    return HttpResponse.json({ ...recibo, ...body, reciboId: params.reciboId }, { status: 200, delay })
  }),

  // Detalle de recibo
  http.get(`${apiBase}/detalle-recibo/recibo/:reciboId`, ({ params }) => {
    const data = (detalleReciboList as typeof detalleReciboList).filter(
      (item) => item.reciboId === params.reciboId,
    )
    return HttpResponse.json(data, { status: 200, delay })
  }),
  http.post(`${apiBase}/detalle-recibo`, async ({ request }) => {
    const body = await request.json()
    if (!body?.reciboId || !body?.cargoId) {
      return HttpResponse.json({ message: 'reciboId y cargoId son requeridos' }, { status: 400, delay })
    }
    return HttpResponse.json({ ...detalleReciboCreate, ...body }, { status: 201, delay })
  }),

  // Estado de cuenta
  http.get(`${apiBase}/alumnos/:alumnoId/estado-cuenta`, ({ params }) => {
    if (params.alumnoId === (estadoCuentaDetail as { alumnoId: string }).alumnoId) {
      return HttpResponse.json(estadoCuentaDetail, { status: 200, delay })
    }
    return HttpResponse.json(
      { alumnoId: params.alumnoId, periodos: [], saldoTotal: 0 },
      { status: 200, delay },
    )
  }),
]

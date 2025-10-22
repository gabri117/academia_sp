import { HttpResponse, http } from 'msw'
import alumnosList from './fixtures/alumnos.list.json'
import alumnoDetail from './fixtures/alumnos.detail.json'
import alumnoCreate from './fixtures/alumnos.create.json'
import alumnoUpdate from './fixtures/alumnos.update.json'
import alumnosErrors from './fixtures/alumnos.errors.json'
import encargadosList from './fixtures/encargados.list.json'
import encargadoDetail from './fixtures/encargados.detail.json'
import encargadoCreate from './fixtures/encargados.create.json'
import encargadoUpdate from './fixtures/encargados.update.json'
import encargadosErrors from './fixtures/encargados.errors.json'
import establecimientosList from './fixtures/establecimientos.list.json'
import establecimientoDetail from './fixtures/establecimientos.detail.json'
import establecimientoCreate from './fixtures/establecimientos.create.json'
import establecimientoUpdate from './fixtures/establecimientos.update.json'
import establecimientosErrors from './fixtures/establecimientos.errors.json'
import nivelesList from './fixtures/niveles.list.json'
import nivelDetail from './fixtures/niveles.detail.json'
import nivelCreate from './fixtures/niveles.create.json'
import nivelUpdate from './fixtures/niveles.update.json'
import nivelesErrors from './fixtures/niveles.errors.json'
import gradosList from './fixtures/grados.list.json'
import gradoDetail from './fixtures/grados.detail.json'
import gradoCreate from './fixtures/grados.create.json'
import gradoUpdate from './fixtures/grados.update.json'
import gradosErrors from './fixtures/grados.errors.json'
import vinculosList from './fixtures/vinculos.list.json'
import vinculoCreate from './fixtures/vinculos.create.json'
import vinculosErrors from './fixtures/vinculos.errors.json'
import { moduleCHandlers } from './handlers.moduleC'
import { moduleBHandlers } from './handlers.moduleB'

const apiBase = 'http://localhost:8080/api/v1'

export const handlers = [
  http.get(`${apiBase}/alumnos`, () => HttpResponse.json(alumnosList, { status: 200 })),
  http.get(`${apiBase}/alumnos/:id`, ({ params }) => {
    if (params.id === (alumnoDetail as { id: string }).id) {
      return HttpResponse.json(alumnoDetail, { status: 200 })
    }
    return HttpResponse.json(alumnosErrors.notFound, { status: 404 })
  }),
  http.post(`${apiBase}/alumnos`, async ({ request }) => {
    const body = (await request.json()) as any
    if (!body || !body.nombre) {
      return HttpResponse.json(alumnosErrors.validation, { status: 400 })
    }
    return HttpResponse.json({ ...alumnoCreate, id: crypto.randomUUID() }, { status: 201 })
  }),
  http.put(`${apiBase}/alumnos/:id`, async ({ params, request }) => {
    const body = (await request.json()) as any
    if (!body || !body.nombre) {
      return HttpResponse.json(alumnosErrors.validation, { status: 400 })
    }
    if (params.id !== (alumnoDetail as { id: string }).id) {
      return HttpResponse.json(alumnosErrors.notFound, { status: 404 })
    }
    return HttpResponse.json({ ...alumnoUpdate, id: params.id }, { status: 200 })
  }),
  http.delete(`${apiBase}/alumnos/:id`, ({ params }) => {
    if (params.id !== (alumnoDetail as { id: string }).id) {
      return HttpResponse.json(alumnosErrors.notFound, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${apiBase}/encargados`, () => HttpResponse.json(encargadosList, { status: 200 })),
  http.get(`${apiBase}/encargados/:id`, ({ params }) => {
    if (params.id === (encargadoDetail as { id: string }).id) {
      return HttpResponse.json(encargadoDetail, { status: 200 })
    }
    return HttpResponse.json(encargadosErrors.notFound, { status: 404 })
  }),
  http.post(`${apiBase}/encargados`, async ({ request }) => {
    const body = (await request.json()) as any
    if (!body || !body.apellido) {
      return HttpResponse.json(encargadosErrors.validation, { status: 400 })
    }
    return HttpResponse.json({ ...encargadoCreate, id: crypto.randomUUID() }, { status: 201 })
  }),
  http.put(`${apiBase}/encargados/:id`, async ({ params, request }) => {
    const body = (await request.json()) as any
    if (!body || !body.nombre) {
      return HttpResponse.json(encargadosErrors.validation, { status: 400 })
    }
    if (params.id !== (encargadoDetail as { id: string }).id) {
      return HttpResponse.json(encargadosErrors.notFound, { status: 404 })
    }
    return HttpResponse.json({ ...encargadoUpdate, id: params.id }, { status: 200 })
  }),
  http.delete(`${apiBase}/encargados/:id`, ({ params }) => {
    if (params.id !== (encargadoDetail as { id: string }).id) {
      return HttpResponse.json(encargadosErrors.notFound, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${apiBase}/establecimientos`, () => HttpResponse.json(establecimientosList, { status: 200 })),
  http.get(`${apiBase}/establecimientos/:id`, ({ params }) => {
    if (params.id === (establecimientoDetail as { institutoId: string }).institutoId) {
      return HttpResponse.json(establecimientoDetail, { status: 200 })
    }
    return HttpResponse.json(establecimientosErrors.notFound, { status: 404 })
  }),
  http.post(`${apiBase}/establecimientos`, async ({ request }) => {
    const body = (await request.json()) as any
    if (!body || !body.jornada) {
      return HttpResponse.json(establecimientosErrors.validation, { status: 400 })
    }
    return HttpResponse.json({ ...establecimientoCreate, institutoId: crypto.randomUUID() }, { status: 201 })
  }),
  http.put(`${apiBase}/establecimientos/:id`, async ({ params, request }) => {
    const body = (await request.json()) as any
    if (!body || !body.nombre) {
      return HttpResponse.json(establecimientosErrors.validation, { status: 400 })
    }
    if (params.id !== (establecimientoDetail as { institutoId: string }).institutoId) {
      return HttpResponse.json(establecimientosErrors.notFound, { status: 404 })
    }
    return HttpResponse.json({ ...establecimientoUpdate, institutoId: params.id }, { status: 200 })
  }),
  http.delete(`${apiBase}/establecimientos/:id`, ({ params }) => {
    if (params.id !== (establecimientoDetail as { institutoId: string }).institutoId) {
      return HttpResponse.json(establecimientosErrors.notFound, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${apiBase}/niveles-academicos`, () => HttpResponse.json(nivelesList.data, { status: 200 })),
  http.get(`${apiBase}/niveles-academicos/:id`, ({ params }) => {
    if (params.id === (nivelDetail as { nivelId: string }).nivelId) {
      return HttpResponse.json(nivelDetail, { status: 200 })
    }
    return HttpResponse.json(nivelesErrors.notFound, { status: 404 })
  }),
  http.post(`${apiBase}/niveles-academicos`, async ({ request }) => {
    const body = (await request.json()) as any
    if (!body || !body.nombre) {
      return HttpResponse.json(nivelesErrors.validation, { status: 400 })
    }
    return HttpResponse.json({ ...nivelCreate, nivelId: crypto.randomUUID() }, { status: 201 })
  }),
  http.put(`${apiBase}/niveles-academicos/:id`, async ({ params, request }) => {
    const body = (await request.json()) as any
    if (!body || !body.nombre) {
      return HttpResponse.json(nivelesErrors.validation, { status: 400 })
    }
    if (params.id !== (nivelDetail as { nivelId: string }).nivelId) {
      return HttpResponse.json(nivelesErrors.notFound, { status: 404 })
    }
    return HttpResponse.json({ ...nivelUpdate, nivelId: params.id }, { status: 200 })
  }),
  http.delete(`${apiBase}/niveles-academicos/:id`, ({ params }) => {
    if (params.id !== (nivelDetail as { nivelId: string }).nivelId) {
      return HttpResponse.json(nivelesErrors.notFound, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${apiBase}/grados-academicos`, () => HttpResponse.json(gradosList.data, { status: 200 })),
  http.get(`${apiBase}/grados-academicos/:id`, ({ params }) => {
    if (params.id === (gradoDetail as { gradoId: string }).gradoId) {
      return HttpResponse.json(gradoDetail, { status: 200 })
    }
    return HttpResponse.json(gradosErrors.notFound, { status: 404 })
  }),
  http.get(`${apiBase}/grados-academicos/nivel/:id`, ({ params }) => {
    const filtered = gradosList.data.filter((grado) => grado.nivelId === params.id)
    return HttpResponse.json(filtered, { status: 200 })
  }),
  http.post(`${apiBase}/grados-academicos`, async ({ request }) => {
    const body = (await request.json()) as any
    if (!body || !body.nombre) {
      return HttpResponse.json(gradosErrors.validation, { status: 400 })
    }
    return HttpResponse.json({ ...gradoCreate, gradoId: crypto.randomUUID() }, { status: 201 })
  }),
  http.put(`${apiBase}/grados-academicos/:id`, async ({ params, request }) => {
    const body = (await request.json()) as any
    if (!body || !body.nombre) {
      return HttpResponse.json(gradosErrors.validation, { status: 400 })
    }
    if (params.id !== (gradoDetail as { gradoId: string }).gradoId) {
      return HttpResponse.json(gradosErrors.notFound, { status: 404 })
    }
    return HttpResponse.json({ ...gradoUpdate, gradoId: params.id }, { status: 200 })
  }),
  http.delete(`${apiBase}/grados-academicos/:id`, ({ params }) => {
    if (params.id !== (gradoDetail as { gradoId: string }).gradoId) {
      return HttpResponse.json(gradosErrors.notFound, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${apiBase}/alumno-encargado/alumno/:alumnoId`, ({ params }) => {
    if (params.alumnoId === (alumnoDetail as { id: string }).id) {
      return HttpResponse.json(vinculosList.data, { status: 200 })
    }
    return HttpResponse.json([], { status: 200 })
  }),
  http.get(`${apiBase}/alumno-encargado/encargado/:encargadoId`, ({ params }) => {
    const filtered = vinculosList.data.filter((registro) => registro.encargadoId === params.encargadoId)
    return HttpResponse.json(filtered, { status: 200 })
  }),
  http.post(`${apiBase}/alumno-encargado`, async ({ request }) => {
    const body = (await request.json()) as any
    if (!body || !body.alumnoId) {
      return HttpResponse.json(vinculosErrors.conflict, { status: 409 })
    }
    const nuevo = {
      ...vinculoCreate,
      alumnoNombreCompleto: 'Alumno mock',
      encargadoNombreCompleto: 'Encargado mock',
    }
    return HttpResponse.json(nuevo, { status: 201 })
  }),
  http.delete(`${apiBase}/alumno-encargado/:alumnoId/:encargadoId`, ({ params }) => {
    if (
      params.alumnoId !== (alumnoDetail as { id: string }).id ||
      params.encargadoId !== (encargadoDetail as { id: string }).id
    ) {
      return HttpResponse.json(vinculosErrors.conflict, { status: 409 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // Extra handlers de módulos
  ...moduleBHandlers,
  ...moduleCHandlers,
]



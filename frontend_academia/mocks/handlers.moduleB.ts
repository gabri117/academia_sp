import { HttpResponse, http } from 'msw'

import cursosCatalogoListFixture from './fixtures/cursos-catalogo.list.json'
import cursosCatalogoDetail from './fixtures/cursos-catalogo.detail.json'
import cursosCatalogoCreate from './fixtures/cursos-catalogo.create.json'
import cursosCatalogoUpdate from './fixtures/cursos-catalogo.update.json'
import cursosCatalogoErrors from './fixtures/cursos-catalogo.errors.json'
import ofertasCursoListFixture from './fixtures/ofertas-curso.list.json'
import ofertasCursoDetail from './fixtures/ofertas-curso.detail.json'
import ofertasCursoCreate from './fixtures/ofertas-curso.create.json'
import ofertasCursoUpdate from './fixtures/ofertas-curso.update.json'
import ofertasCursoErrors from './fixtures/ofertas-curso.errors.json'
import inscripcionesListFixture from './fixtures/inscripciones.list.json'
import inscripcionDetail from './fixtures/inscripciones.detail.json'
import inscripcionCreate from './fixtures/inscripciones.create.json'
import inscripcionUpdate from './fixtures/inscripciones.update.json'
import inscripcionErrors from './fixtures/inscripciones.errors.json'
import inscripcionesByAlumno from './fixtures/inscripciones.by-alumno.json'
import inscripcionesByOferta from './fixtures/inscripciones.by-oferta.json'

const apiBase = 'http://localhost:8080/api/v1'

type PageQuery = {
  page: number
  size: number
  sort?: string | string[]
}

const parsePageQuery = (request: Request): PageQuery => {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') ?? '0')
  const size = Number(url.searchParams.get('size') ?? '20')
  const sortValues = url.searchParams.getAll('sort')
  const sort = sortValues.length === 0 ? undefined : sortValues.length === 1 ? sortValues[0] : sortValues
  return {
    page: Number.isNaN(page) ? 0 : Math.max(page, 0),
    size: Number.isNaN(size) || size <= 0 ? 20 : size,
    sort,
  }
}

const paginate = <T>(items: T[], page: number, size: number) => {
  const totalElements = items.length
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size)
  const start = page * size
  const content = items.slice(start, start + size)
  return {
    content,
    totalElements,
    totalPages,
    size,
    number: page,
  }
}

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? ''

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

export const moduleBHandlers = [
  // === Cursos catalogo ===
  http.get(`${apiBase}/cursos-catalogo`, ({ request }) => {
    const { page, size } = parsePageQuery(request)
    const url = new URL(request.url)
    const nombreFilter = normalize(url.searchParams.get('nombre'))

    const filtered = nombreFilter
      ? cursosCatalogoListFixture.content.filter((item) => normalize(item.nombre).includes(nombreFilter))
      : cursosCatalogoListFixture.content

    const pageResult = paginate(filtered, page, size)
    return HttpResponse.json(pageResult, { status: 200 })
  }),

  http.get(`${apiBase}/cursos-catalogo/:id`, ({ params }) => {
    if (params.id === cursosCatalogoDetail.id) {
      return HttpResponse.json(cursosCatalogoDetail, { status: 200 })
    }
    return HttpResponse.json(cursosCatalogoErrors.notFound, { status: 404 })
  }),

  http.post(`${apiBase}/cursos-catalogo`, async ({ request }) => {
    const body = toRecord(await request.json())
    const nuevo = {
      ...cursosCatalogoCreate,
      ...body,
      id: crypto.randomUUID(),
    }
    return HttpResponse.json(nuevo, { status: 201 })
  }),

  http.put(`${apiBase}/cursos-catalogo/:id`, async ({ params, request }) => {
    if (params.id !== cursosCatalogoDetail.id) {
      return HttpResponse.json(cursosCatalogoErrors.notFound, { status: 404 })
    }

    const body = toRecord(await request.json())
    const actualizado = {
      ...cursosCatalogoUpdate,
      ...body,
      id: params.id,
    }
    return HttpResponse.json(actualizado, { status: 200 })
  }),

  http.delete(`${apiBase}/cursos-catalogo/:id`, ({ params }) => {
    if (params.id !== cursosCatalogoDetail.id) {
      return HttpResponse.json(cursosCatalogoErrors.notFound, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // === Ofertas de curso ===
  http.get(`${apiBase}/ofertas-curso`, ({ request }) => {
    const { page, size } = parsePageQuery(request)
    const url = new URL(request.url)
    const gradoId = url.searchParams.get('gradoId')
    const institutoId = url.searchParams.get('institutoId')
    const cursoId = url.searchParams.get('cursoId')

    const filtered = ofertasCursoListFixture.content.filter((item) => {
      if (gradoId && item.gradoId !== gradoId) return false
      if (institutoId && item.institutoId !== institutoId) return false
      if (cursoId && item.cursoId !== cursoId) return false
      return true
    })

    const pageResult = paginate(filtered, page, size)
    return HttpResponse.json(pageResult, { status: 200 })
  }),

  http.get(`${apiBase}/ofertas-curso/:id`, ({ params }) => {
    const oferta = ofertasCursoListFixture.content.find((item) => item.id === params.id)
    if (!oferta) {
      return HttpResponse.json(ofertasCursoErrors.notFound, { status: 404 })
    }
    return HttpResponse.json(oferta ?? ofertasCursoDetail, { status: 200 })
  }),

  http.post(`${apiBase}/ofertas-curso`, async ({ request }) => {
    const body = toRecord(await request.json())
    const nueva = {
      ...ofertasCursoCreate,
      ...body,
      id: crypto.randomUUID(),
    }
    return HttpResponse.json(nueva, { status: 201 })
  }),

  http.put(`${apiBase}/ofertas-curso/:id`, async ({ params, request }) => {
    const existente = ofertasCursoListFixture.content.find((item) => item.id === params.id)
    if (!existente) {
      return HttpResponse.json(ofertasCursoErrors.notFound, { status: 404 })
    }
    const body = toRecord(await request.json())
    const actualizada = {
      ...existente,
      ...ofertasCursoUpdate,
      ...body,
      id: params.id,
    }
    return HttpResponse.json(actualizada, { status: 200 })
  }),

  http.delete(`${apiBase}/ofertas-curso/:id`, ({ params }) => {
    const existe = ofertasCursoListFixture.content.some((item) => item.id === params.id)
    if (!existe) {
      return HttpResponse.json(ofertasCursoErrors.notFound, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // === Inscripciones ===
  http.get(`${apiBase}/inscripciones`, ({ request }) => {
    const { page, size } = parsePageQuery(request)
    const pageResult = paginate(inscripcionesListFixture.content, page, size)
    return HttpResponse.json(pageResult, { status: 200 })
  }),

  http.get(`${apiBase}/inscripciones/:id`, ({ params }) => {
    const match =
      inscripcionesListFixture.content.find((item) => item.id === params.id) ??
      (inscripcionDetail.id === params.id ? inscripcionDetail : undefined)
    if (!match) {
      return HttpResponse.json(inscripcionErrors.notFound, { status: 404 })
    }
    return HttpResponse.json(match, { status: 200 })
  }),

  http.post(`${apiBase}/inscripciones`, async ({ request }) => {
    const body = toRecord(await request.json())
    const nueva = {
      ...inscripcionCreate,
      ...body,
      id: crypto.randomUUID(),
    }
    return HttpResponse.json(nueva, { status: 201 })
  }),

  http.put(`${apiBase}/inscripciones/:id`, async ({ params, request }) => {
    const existente =
      inscripcionesListFixture.content.find((item) => item.id === params.id) ??
      (inscripcionDetail.id === params.id ? inscripcionDetail : undefined)
    if (!existente) {
      return HttpResponse.json(inscripcionErrors.notFound, { status: 404 })
    }
    const body = toRecord(await request.json())
    const actualizada = {
      ...existente,
      ...inscripcionUpdate,
      ...body,
      id: params.id,
    }
    return HttpResponse.json(actualizada, { status: 200 })
  }),

  http.delete(`${apiBase}/inscripciones/:id`, ({ params }) => {
    const existe =
      inscripcionesListFixture.content.some((item) => item.id === params.id) ||
      inscripcionDetail.id === params.id
    if (!existe) {
      return HttpResponse.json(inscripcionErrors.notFound, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${apiBase}/inscripciones/alumno/:alumnoId`, ({ params }) => {
    const filtered = inscripcionesByAlumno.filter((item) => item.alumnoId === params.alumnoId)
    return HttpResponse.json(filtered, { status: 200 })
  }),

  http.get(`${apiBase}/inscripciones/oferta/:ofertaId`, ({ params }) => {
    const filtered = inscripcionesByOferta.filter((item) => item.ofertaId === params.ofertaId)
    return HttpResponse.json(filtered, { status: 200 })
  }),
]

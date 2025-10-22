import {
  createCursoCatalogo as apiCreateCursoCatalogo,
  deleteCursoCatalogo as apiDeleteCursoCatalogo,
  getCursoCatalogo as apiGetCursoCatalogo,
  listCursosCatalogo as apiListCursosCatalogo,
  updateCursoCatalogo as apiUpdateCursoCatalogo,
} from '../api/client'
import type { CursoCatalogo, CursoCatalogoCreateDTO, CursoCatalogoUpdateDTO } from '../contract/moduleB'
import type { UUID } from '../contract/moduleA'
import type { Page, PageableQuery } from '../contract/pagination'

export type ListCursosCatalogoParams = PageableQuery & {
  nombre?: string
}

type CursoCatalogoDiccionarioEntry = Pick<CursoCatalogo, 'id' | 'nombre'>

type CursoCatalogoApi = CursoCatalogo & {
  // Algunos entornos exponen snake_case; se normaliza para la UI.
  nivel_curso?: string | null
}

export type CursoCatalogoComboItem = Pick<CursoCatalogo, 'id' | 'nombre' | 'duracion'> & {
  nivelCurso?: string | null
}

let cursosDiccionarioCache: Map<string, string> | null = null
let cursosDiccionarioPromise: Promise<Map<string, string>> | null = null

export const listCursosCatalogo = (
  params: ListCursosCatalogoParams = {},
): Promise<Page<CursoCatalogo>> => {
  const { nombre, ...pageable } = params
  return apiListCursosCatalogo({ ...pageable, nombre })
}

export const getCursoCatalogo = (id: UUID) => apiGetCursoCatalogo(id)

export const createCursoCatalogo = (payload: CursoCatalogoCreateDTO) => apiCreateCursoCatalogo(payload)

export const updateCursoCatalogo = (id: UUID, payload: CursoCatalogoUpdateDTO) =>
  apiUpdateCursoCatalogo(id, payload)

export const removeCursoCatalogo = (id: UUID) => apiDeleteCursoCatalogo(id)

export const listarCursosParaCombo = async (
  params: Partial<PageableQuery> & { nombre?: string } = {},
): Promise<Page<CursoCatalogoComboItem>> => {
  const { page = 0, size = 500, sort = 'nombre,asc', nombre } = params

  const pageResponse = await apiListCursosCatalogo({ page, size, sort, nombre })

  return {
    ...pageResponse,
    content: pageResponse.content.map((curso) => {
      const cursoApi = curso as CursoCatalogoApi

      return {
        id: curso.id,
        nombre: curso.nombre,
        duracion: curso.duracion ?? cursoApi.duracion ?? null,
        nivelCurso: curso.nivelCurso ?? cursoApi.nivel_curso ?? null,
      }
    }),
  }
}

export const listarCursosParaDiccionario = async (
  params: { size?: number; useCache?: boolean } = {},
): Promise<Map<string, string>> => {
  const { size = 500, useCache = true } = params

  if (useCache && cursosDiccionarioCache) {
    return cursosDiccionarioCache
  }

  const fetchPromise =
    cursosDiccionarioPromise ??
    apiListCursosCatalogo({
      page: 0,
      size,
      sort: 'nombre,asc',
    })

  cursosDiccionarioPromise = fetchPromise

  try {
    const page = await fetchPromise
    const entries = page.content as CursoCatalogoDiccionarioEntry[]
    const dictionary = new Map(
      entries
        .filter((curso) => Boolean(curso.id))
        .map((curso) => [curso.id, curso.nombre ?? 'Curso']),
    )

    if (useCache) {
      cursosDiccionarioCache = dictionary
    }

    return dictionary
  } finally {
    cursosDiccionarioPromise = null
  }
}

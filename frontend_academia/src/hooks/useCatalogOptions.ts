import { z } from 'zod'
//Archivoodificado
import {
  listarOfertasCatalogo,
  listInscripciones,
  listInscripcionesPorOferta,   //Aqui se modifico
  listSesionesPorOferta,
  listarUnidadesPorOferta,
  listarTarifasPorOferta,
  listarCargosPorTarifa,
  listarRecibosPorAlumno,
  listAlumnos,
} from '../api/client'
import type { PageableQuery } from '../contract/pagination'
import { useApiQuery } from './useApiQuery'

export type SelectOption = {
  value: string
  label: string
}

export type OfertaSelectOption = SelectOption & {
  cursoNombre: string
  dia: string
  horaInicio: string
  horaFin: string
}

const ofertaCatalogoSchema = z.array(
  z.object({
    id: z.string(),
    cursoNombre: z.string().optional().nullable(),
    dia: z.string().optional().nullable(),
    horaInicio: z.string().optional().nullable(),
    horaFin: z.string().optional().nullable(),
  }),
)


const inscripcionListSchema = z.array(
  z.object({
    id: z.string(),
    alumnoId: z.string().optional(),
    alumnoNombreCompleto: z.string().optional(),
    alumnoNombre: z.string().optional(),
    alumnoApellido: z.string().optional(),
  }),
)

const inscripcionPageSchema = z.object({
  content: inscripcionListSchema,
})

const sesionListSchema = z.array(
  z.object({
    sessionId: z.string(),
    ofertaId: z.string(),
    fecha: z.string(),
  }),
)

const unidadListSchema = z.array(
  z.object({
    evaluacionId: z.string(),
    nombre: z.string(),
  }),
)

const tarifaListSchema = z.array(
  z.object({
    tarifaId: z.string(),
    ofertaId: z.string().optional(),
    montoInscripcion: z.number().optional(),
    montoMensualidad: z.number().optional(),
    descripcion: z.string().optional(),
  }),
)

const cargoListSchema = z.array(
  z.object({
    cargoId: z.string(),
    concepto: z.string().optional(),
  }),
)

const reciboListSchema = z.array(
  z.object({
    reciboId: z.string(),
    correlativoRecibo: z.string().optional(),
    fecha: z.string().optional(),
  }),
)

const alumnoPageSchema = z.object({
  content: z.array(
    z.object({
      id: z.string(),
      nombre: z.string().optional(),
      apellido: z.string().optional(),
      carnet: z.string().optional(),
    }),
  ),
})

const defaultPageQuery: PageableQuery = { page: 0, size: 100 }

const buildOptionLabel = (
  parts: Array<string | undefined | null>,
  fallback: string,
): string => {
  const label = parts.filter((value) => value && value.trim().length > 0).join(' - ')
  return label.length > 0 ? label : fallback
}

const normalizeText = (value?: string | null): string => {
  if (!value) return ''
  return value.trim()
}

const ensureText = (value: string | null | undefined, fallback: string): string => {
  const normalized = normalizeText(value)
  return normalized.length > 0 ? normalized : fallback
}

const formatHora = (value?: string | null): string => {
  const normalized = normalizeText(value)
  if (!normalized) return '--'
  const [hour, minute] = normalized.split(':')
  if (hour && minute) {
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  }
  return normalized
}

const formatDia = (value?: string | null): string => ensureText(value, 'Sin día')

export const useOfertaOptions = () =>
  useApiQuery<OfertaSelectOption[]>({
    queryKey: ['ofertas', 'options'],
    queryFn: async () => {
      const response = await listarOfertasCatalogo({ page: 0, size: 200 })
      const parsed = ofertaCatalogoSchema.parse(response)

      return parsed.map((oferta) => {
        const cursoNombre = ensureText(oferta.cursoNombre, 'Curso')
        const dia = formatDia(oferta.dia)
        const horaInicio = formatHora(oferta.horaInicio)
        const horaFin = formatHora(oferta.horaFin)
        const label = `${cursoNombre} - Día: ${dia} | Inicio: ${horaInicio} | Fin: ${horaFin}`

        return {
          value: oferta.id,
          label,
          cursoNombre,
          dia,
          horaInicio,
          horaFin,
        }
      })
    },
  })


export const useSesionOptions = (ofertaId: string | null) =>
  useApiQuery<SelectOption[]>({
    queryKey: ['sesiones', 'options', ofertaId ?? 'none'],
    queryFn: async () => {
      if (!ofertaId) return []
      const data = await listSesionesPorOferta(ofertaId)
      const parsed = sesionListSchema.parse(data)
      return parsed.map((sesion) => ({
        value: sesion.sessionId,
        label: sesion.fecha,
      }))
    },
    enabled: Boolean(ofertaId),
  })

export const useInscripcionOptions = (ofertaId: string | null) =>
  useApiQuery<SelectOption[]>({
    queryKey: ['inscripciones', 'options', ofertaId ?? 'none'],
    queryFn: async () => {
      if (!ofertaId) return []
      //Aqui se modificó
      const data = await listInscripcionesPorOferta(ofertaId)
      const parsed = inscripcionListSchema.parse(data)
      return parsed.map((inscripcion) => ({
        value: inscripcion.id,
        label: buildOptionLabel(
          [
            inscripcion.alumnoNombreCompleto,
            buildOptionLabel(
              [inscripcion.alumnoNombre, inscripcion.alumnoApellido],
              inscripcion.id,
            ),
          ],
          inscripcion.id,
        ),
      }))
    },
    enabled: Boolean(ofertaId),
  })

export const useUnidadOptions = (ofertaId: string | null) =>
  useApiQuery<SelectOption[]>({
    queryKey: ['unidades', 'options', ofertaId ?? 'none'],
    queryFn: async () => {
      if (!ofertaId) return []
      const data = await listarUnidadesPorOferta(ofertaId)
      const parsed = unidadListSchema.parse(data)
      return parsed.map((unidad) => ({
        value: unidad.evaluacionId,
        label: unidad.nombre,
      }))
    },
    enabled: Boolean(ofertaId),
  })

export const useTarifaOptionsByOferta = (ofertaId: string | null) =>
  useApiQuery<SelectOption[]>({
    queryKey: ['tarifas', 'options', ofertaId ?? 'none'],
    queryFn: async () => {
      if (!ofertaId) return []
      const data = await listarTarifasPorOferta(ofertaId)
      const parsed = tarifaListSchema.parse(data)
      return parsed.map((tarifa) => ({
        value: tarifa.tarifaId,
        label: buildOptionLabel(
          [
            tarifa.descripcion,
            tarifa.montoMensualidad !== undefined
              ? `Q${tarifa.montoMensualidad.toFixed(2)}`
              : undefined,
          ],
          tarifa.tarifaId,
        ),
      }))
    },
    enabled: Boolean(ofertaId),
  })

export const useCargoOptions = (tarifaId: string | null) =>
  useApiQuery<SelectOption[]>({
    queryKey: ['cargos', 'options', tarifaId ?? 'none'],
    queryFn: async () => {
      if (!tarifaId) return []
      const data = await listarCargosPorTarifa(tarifaId)
      const parsed = cargoListSchema.parse(data)
      return parsed.map((cargo) => ({
        value: cargo.cargoId,
        label: buildOptionLabel([cargo.concepto], cargo.cargoId),
      }))
    },
    enabled: Boolean(tarifaId),
  })

export const useAlumnoOptions = () =>
  useApiQuery<SelectOption[]>({
    queryKey: ['alumnos', 'options'],
    queryFn: async () => {
      const response = await listAlumnos({ ...defaultPageQuery, sort: 'nombre,asc' })
      const parsed = alumnoPageSchema.parse(response)
      return parsed.content.map((alumno) => ({
        value: alumno.id,
        label: (() => {
          const nombre = buildOptionLabel([alumno.nombre, alumno.apellido], alumno.id)
          const carnet = ensureText(alumno.carnet, '')
          return carnet ? `${nombre} - Carnet: ${carnet}` : nombre
        })(),
      }))
    },
  })

export const useReciboOptions = (alumnoId: string | null) =>
  useApiQuery<SelectOption[]>({
    queryKey: ['recibos', 'options', alumnoId ?? 'none'],
    queryFn: async () => {
      if (!alumnoId) return []
      const data = await listarRecibosPorAlumno(alumnoId)
      const parsed = reciboListSchema.parse(data)
      return parsed.map((recibo) => ({
        value: recibo.reciboId,
        label: buildOptionLabel(
          [recibo.correlativoRecibo, recibo.fecha],
          recibo.reciboId,
        ),
      }))
    },
    enabled: Boolean(alumnoId),
  })

// Hook auxiliar para inscripciones cuando no se filtra por oferta (usado en listados de QA si se requiere)
export const useAllInscripcionesOptions = () =>
  useApiQuery<SelectOption[]>({
    queryKey: ['inscripciones', 'options', 'all'],
    queryFn: async () => {
      const response = await listInscripciones({ ...defaultPageQuery, sort: 'fechaInscripcion,desc' })
      const parsed = inscripcionPageSchema.parse(response)
      return parsed.content.map((inscripcion) => ({
        value: inscripcion.id,
        label: buildOptionLabel(
          [
            inscripcion.alumnoNombreCompleto,
            buildOptionLabel(
              [inscripcion.alumnoNombre, inscripcion.alumnoApellido],
              inscripcion.id,
            ),
          ],
          inscripcion.id,
        ),
      }))
    },
  })

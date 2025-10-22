// src/pages/InscripcionesPorOferta.tsx
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import { useApiQuery } from '@/hooks'
import { isApiError } from '@/api/types'
import type { Alumno } from '@/contract/moduleA'
import type { CursoCatalogo, Inscripcion, OfertaCurso } from '@/contract/moduleB'
import type { Page as PageResult } from '@/contract/pagination'
import { listInscripcionesByOferta } from '@/services/inscripciones'
import { getOfertaCurso, listOfertasCurso } from '@/services/ofertas'
import { listAlumnos } from '@/services/alumnos'
import { listCursosCatalogo } from '@/services/cursosCatalogo'

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  return value.slice(0, 10)
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const InscripcionesPorOferta = () => {
  const { ofertaId } = useParams<{ ofertaId: string }>()
  const navigate = useNavigate()

  const {
    data: inscripciones,
    isLoading,
    error,
    refetch,
  } = useApiQuery<Inscripcion[]>({
    queryKey: ['inscripciones', 'oferta', ofertaId],
    queryFn: () => listInscripcionesByOferta(ofertaId!),
    enabled: Boolean(ofertaId),
  })

  const {
    data: oferta,
    isLoading: isLoadingOferta,
    error: ofertaError,
  } = useApiQuery<OfertaCurso>({
    queryKey: ['oferta-curso', ofertaId, 'detalle'],
    queryFn: () => getOfertaCurso(ofertaId!),
    enabled: Boolean(ofertaId),
  })

  const { data: alumnosPage } = useApiQuery<PageResult<Alumno>>({
    queryKey: ['alumnos', 'options', 'inscripciones-oferta'],
    queryFn: () => listAlumnos({ page: 0, size: 100, sort: 'nombre,asc' }),
  })

  const { data: cursosPage } = useApiQuery<PageResult<CursoCatalogo>>({
    queryKey: ['cursos-catalogo', 'inscripciones-oferta'],
    queryFn: () => listCursosCatalogo({ page: 0, size: 100, sort: 'nombre,asc' }),
  })

  const { data: ofertasPage } = useApiQuery<PageResult<OfertaCurso>>({
    queryKey: ['ofertas-curso', 'inscripciones-oferta'],
    queryFn: () => listOfertasCurso({ page: 0, size: 100, sort: 'fechaInicio,desc' }),
  })

  const alumnos = alumnosPage?.content ?? []
  const cursos = cursosPage?.content ?? []
  const ofertasData = ofertasPage?.content ?? []

  const isAlumnosTruncated =
    alumnosPage !== undefined && alumnosPage.totalElements > alumnosPage.size
  const isCursosTruncated =
    cursosPage !== undefined && cursosPage.totalElements > cursosPage.size
  const isOfertasTruncated =
    ofertasPage !== undefined && ofertasPage.totalElements > ofertasPage.size

  const alumnoMap = useMemo(
    () => new Map(alumnos.map((alumno) => [alumno.id, `${alumno.nombre} ${alumno.apellido}`.trim()])),
    [alumnos],
  )

  const cursoMap = useMemo(
    () => new Map(cursos.map((curso) => [curso.id, curso.nombre])),
    [cursos],
  )

  const ofertaMap = useMemo(
    () => new Map(ofertasData.map((ofertaItem) => [ofertaItem.id, ofertaItem])),
    [ofertasData],
  )

  const columns: TableColumn<Inscripcion>[] = [
    {
      key: 'alumnoId',
      header: 'Alumno',
      render: (inscripcionRow) => alumnoMap.get(inscripcionRow.alumnoId) ?? inscripcionRow.alumnoId,
    },
    {
      key: 'fechaInscripcion',
      header: 'Fecha de inscripción',
      render: (inscripcionRow) => formatDate(inscripcionRow.fechaInscripcion),
    },
    {
      key: 'estado',
      header: 'Estado',
    },
  ]

  if (error) {
    return (
      <Page
        title="Inscripciones por oferta"
        description="Detalle de inscripciones asociadas a la oferta."
      >
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(error, 'No fue posible cargar las inscripciones de la oferta.')}
          <div className="mt-3">
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  const ofertaRef = oferta ?? ofertaMap.get(ofertaId ?? '')
  const cursoNombre = ofertaRef ? (cursoMap.get(ofertaRef.cursoId) ?? ofertaRef.cursoId) : ''
  // Aseguramos que siempre sea string:
  const heading: string = ofertaRef
    ? `Inscripciones de la oferta ${cursoNombre}`
    : 'Inscripciones por oferta'

  return (
    <Page
      title={heading} // string siempre
      description="Detalle de alumnos inscritos en la oferta seleccionada."
    >
      <div className="space-y-4">
        {ofertaError && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            {getErrorMessage(ofertaError, 'No fue posible cargar la información de la oferta.')}
          </div>
        )}

        {(isAlumnosTruncated || isCursosTruncated || isOfertasTruncated) && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            Catálogos auxiliares limitados a los primeros 100 registros. TODO(backend): incluir
            nombres legibles en la respuesta de inscripciones o habilitar paginación para estos
            listados.
          </div>
        )}

        {isLoading || isLoadingOferta ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : (
          // TODO(ux): mostrar encabezado con info resumida de la oferta (fecha, capacidad).
          <Table
            data={inscripciones ?? []}
            columns={columns}
            emptyMessage="La oferta no posee inscripciones registradas."
            getRowKey={(item) => item.id}
          />
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default InscripcionesPorOferta

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import Input from '../../components/form/Input'
import { isApiError } from '../../api/types'
import { useToast } from '../../components/ui/Toast'
import { useAuthStore } from '../../store/auth'
import { useApiMutation, useApiQuery } from '../../hooks'

import type { Alumno, AlumnoEncargado, Encargado } from '../../contract/moduleA'
import type { Page as PageResult } from '../../contract/pagination'

import { listAlumnos } from '../../services/alumnos'
import { listEncargados } from '../../services/encargados'
import {
  createAlumnoEncargado,
  listEncargadosPorAlumno,
  listAlumnosPorEncargado, // modo B
  removeAlumnoEncargado,
} from '../../services/alumnoEncargado'

// 🎨 Style kit
import HeroSummary from '@/components/kit/HeroSummary'
import PanelCard from '@/components/kit/PanelCard'
import { Chip } from '@/components/kit/Chip'
import { cls } from '@/components/ui/stylekit'
import NiceSelect from '@/components/ui/NiceSelect' // 👈 combobox

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const value = (error as { message?: unknown }).message
    if (typeof value === 'string') return value
  }
  return fallback
}

const SORT_OPTIONS = [{ label: 'Por defecto', value: 'none' }]

const VincularEncargado = () => {
  const { notify } = useToast()
  const role = useAuthStore((state) => state.role)
  const [searchParams, setSearchParams] = useSearchParams()

  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>('')
  const [selectedEncargadoId, setSelectedEncargadoId] = useState<string>('')

  const alumnoIdParam = searchParams.get('alumnoId')
  const encargadoIdParam = searchParams.get('encargadoId')

  const [alumnoFilter, setAlumnoFilter] = useState('')
  const [encargadoFilter, setEncargadoFilter] = useState('')
  const [sort, setSort] = useState(SORT_OPTIONS[0].value)

  const updateSearchParams = (alumnoIdValue: string | null, encargadoIdValue: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (alumnoIdValue) params.set('alumnoId', alumnoIdValue)
    else params.delete('alumnoId')

    if (encargadoIdValue) params.set('encargadoId', encargadoIdValue)
    else params.delete('encargadoId')

    setSearchParams(params)
  }

  // ---------- Opciones para combos ----------
  const {
    data: alumnosResponse,
    isLoading: isLoadingAlumnos,
    error: alumnosError,
  } = useApiQuery<PageResult<Alumno>>({
    queryKey: ['alumnos', 'options'],
    queryFn: () => listAlumnos({ page: 0, size: 100, sort: 'nombre,asc' }),
  })

  const {
    data: encargadosResponse,
    isLoading: isLoadingEncargados,
    error: encargadosError,
  } = useApiQuery<PageResult<Encargado>>({
    queryKey: ['encargados', 'options'],
    queryFn: () => listEncargados({ page: 0, size: 100, sort: 'nombre,asc' }),
  })

  // ---------- Sin auto-selección del primer alumno ----------
  useEffect(() => {
    if (alumnoIdParam && alumnoIdParam !== selectedAlumnoId) {
      setSelectedAlumnoId(alumnoIdParam)
    }
  }, [alumnoIdParam, selectedAlumnoId])

  // Mantener selección de encargado desde query param (modo B)
  useEffect(() => {
    if (encargadoIdParam && encargadoIdParam !== selectedEncargadoId) {
      setSelectedEncargadoId(encargadoIdParam)
    }
  }, [encargadoIdParam, selectedEncargadoId])

  // ---------- Cargas por alumno (modo A) ----------
  const {
    data: vinculadosEncargados, // encargados del alumno
    isLoading: isLoadingVinculosEncargados,
    error: vinculosEncargadosError,
    refetch: refetchEncargadosDeAlumno,
  } = useApiQuery<AlumnoEncargado[]>({
    queryKey: ['alumno-encargado', selectedAlumnoId],
    queryFn: () =>
      selectedAlumnoId ? listEncargadosPorAlumno(selectedAlumnoId) : Promise.resolve([]),
    enabled: Boolean(selectedAlumnoId),
  })

  // ---------- Cargas por encargado (modo B) ----------
  const {
    data: vinculadosAlumnos, // alumnos del encargado
    isLoading: isLoadingVinculosAlumnos,
    error: vinculosAlumnosError,
    refetch: refetchAlumnosDeEncargado,
  } = useApiQuery<AlumnoEncargado[]>({
    queryKey: ['encargado-alumnos', selectedEncargadoId],
    queryFn: () =>
      selectedEncargadoId ? listAlumnosPorEncargado(selectedEncargadoId) : Promise.resolve([]),
    enabled: Boolean(selectedEncargadoId && !selectedAlumnoId), // solo cuando NO hay alumno seleccionado
  })

  // ---------- Mutations ----------
  const { mutateAsync: vincular, isPending: isLinking } = useApiMutation({
    mutationFn: createAlumnoEncargado,
    onSuccess: () => {
      notify({
        title: 'Vínculo creado',
        description: 'Se vinculó el encargado al alumno.',
        variant: 'success',
      })
      if (selectedAlumnoId) refetchEncargadosDeAlumno()
      else if (selectedEncargadoId) refetchAlumnosDeEncargado()
    },
    onError: (error) => {
      const msg = getErrorMessage(error, 'No fue posible vincular el encargado.')
      notify({
        title: 'Error al vincular',
        description: /existe|duplicad/i.test(msg) ? 'Este vínculo ya existe.' : msg,
        variant: 'error',
      })
    },
  })

  const { mutateAsync: desvincular, isPending: isUnlinking } = useApiMutation({
    mutationFn: ({ alumnoId, encargadoId }: { alumnoId: string; encargadoId: string }) =>
      removeAlumnoEncargado(alumnoId, encargadoId),
    onSuccess: () => {
      notify({
        title: 'Vínculo eliminado',
        description: 'Se quitó el encargado del alumno.',
        variant: 'success',
      })
      if (selectedAlumnoId) refetchEncargadosDeAlumno()
      else if (selectedEncargadoId) refetchAlumnosDeEncargado()
    },
    onError: (error) => {
      notify({
        title: 'Error al eliminar',
        description: getErrorMessage(error, 'No fue posible eliminar el vínculo.'),
        variant: 'error',
      })
    },
  })

  // ---------- Diccionarios para teléfonos ----------
  const alumnoPhoneById = useMemo(() => {
    const map: Record<string, string | undefined> = {}
    for (const a of alumnosResponse?.content ?? []) map[a.id] = a.telefono ?? undefined
    return map
  }, [alumnosResponse])

  const encargadoPhoneById = useMemo(() => {
    const map: Record<string, string | undefined> = {}
    for (const e of encargadosResponse?.content ?? []) map[e.id] = e.telefono ?? undefined
    return map
  }, [encargadosResponse])

  // ---------- Opciones + filtros locales ----------
  const alumnoOptions = useMemo(
    () =>
      (alumnosResponse?.content ?? []).map((alumno) => ({
        label: `${alumno.nombre} ${alumno.apellido}`,
        value: alumno.id,
      })),
    [alumnosResponse],
  )

  const encargadoOptions = useMemo(
    () =>
      (encargadosResponse?.content ?? []).map((encargado) => ({
        label: `${encargado.nombre} ${encargado.apellido}`,
        value: encargado.id,
      })),
    [encargadosResponse],
  )

  const normalizedFilter = (v: string) => v.trim().toLowerCase()

  const filteredAlumnoOptions = useMemo(() => {
    const term = normalizedFilter(alumnoFilter)
    if (!term) return alumnoOptions
    const filtered = alumnoOptions.filter((o) => o.label.toLowerCase().includes(term))
    if (selectedAlumnoId && !filtered.some((o) => o.value === selectedAlumnoId)) {
      const current = alumnoOptions.find((o) => o.value === selectedAlumnoId)
      if (current) filtered.unshift(current)
    }
    return filtered
  }, [alumnoFilter, alumnoOptions, selectedAlumnoId])

  const filteredEncargadoOptions = useMemo(() => {
    const term = normalizedFilter(encargadoFilter)
    if (!term) return encargadoOptions
    const filtered = encargadoOptions.filter((o) => o.label.toLowerCase().includes(term))
    if (selectedEncargadoId && !filtered.some((o) => o.value === selectedEncargadoId)) {
      const current = encargadoOptions.find((o) => o.value === selectedEncargadoId)
      if (current) filtered.unshift(current)
    }
    return filtered
  }, [encargadoFilter, encargadoOptions, selectedEncargadoId])

  const selectedAlumnoOption = useMemo(
    () => alumnoOptions.find((o) => o.value === selectedAlumnoId) ?? null,
    [alumnoOptions, selectedAlumnoId],
  )
  const selectedEncargadoOption = useMemo(
    () => encargadoOptions.find((o) => o.value === selectedEncargadoId) ?? null,
    [encargadoOptions, selectedEncargadoId],
  )

  // ---------- Modo / dataset / columnas ----------
  const isModoAlumno = Boolean(selectedAlumnoId)

  const vinculadosEncargadosNorm: AlumnoEncargado[] = useMemo(
    () =>
      (vinculadosEncargados ?? []).map((r) => ({
        ...r,
        encargadoTelefono: (r as any).encargadoTelefono ?? encargadoPhoneById[r.encargadoId] ?? '-',
      })),
    [vinculadosEncargados, encargadoPhoneById],
  )

  const vinculadosAlumnosNorm: AlumnoEncargado[] = useMemo(
    () =>
      (vinculadosAlumnos ?? []).map((r) => ({
        ...r,
        alumnoNombreCompleto:
          r.alumnoNombreCompleto ??
          `${(r as any).alumnoNombre ?? ''} ${(r as any).alumnoApellido ?? ''}`.trim(),
        alumnoTelefono: (r as any).alumnoTelefono ?? alumnoPhoneById[r.alumnoId] ?? '-',
      })),
    [vinculadosAlumnos, alumnoPhoneById],
  )

  const dataTable: AlumnoEncargado[] = isModoAlumno
    ? vinculadosEncargadosNorm
    : vinculadosAlumnosNorm

  const columnsEncargados: TableColumn<AlumnoEncargado>[] = [
    { key: 'encargadoNombreCompleto', header: 'Encargado' },
    {
      key: 'encargadoTelefono' as any,
      header: 'Teléfono',
      render: (row) => ((row as any).encargadoTelefono ?? '-'),
    },
  ]

  const columnsAlumnos: TableColumn<AlumnoEncargado>[] = [
    { key: 'alumnoNombreCompleto', header: 'Alumno' },
    {
      key: 'alumnoTelefono' as any,
      header: 'Teléfono',
      render: (row) => ((row as any).alumnoTelefono ?? '-'),
    },
  ]

  const columns: TableColumn<AlumnoEncargado>[] = isModoAlumno ? columnsEncargados : columnsAlumnos

  // ---------- Guard anti-duplicado ----------
  const existsLinkAlready = useMemo(() => {
    if (!selectedAlumnoId || !selectedEncargadoId) return false
    if (isModoAlumno) {
      return (vinculadosEncargados ?? []).some(r => r.encargadoId === selectedEncargadoId)
    }
    return (vinculadosAlumnos ?? []).some(r => r.alumnoId === selectedAlumnoId)
  }, [selectedAlumnoId, selectedEncargadoId, isModoAlumno, vinculadosEncargados, vinculadosAlumnos])

  // ---------- Handlers ----------
  const handleVincular = async () => {
    if (!selectedAlumnoId || !selectedEncargadoId) {
      notify({
        title: 'Selección requerida',
        description: 'Selecciona un alumno y un encargado.',
        variant: 'warning',
      })
      return
    }
    await vincular({ alumnoId: selectedAlumnoId, encargadoId: selectedEncargadoId })
    setSelectedEncargadoId('')
    setEncargadoFilter('')
    updateSearchParams(selectedAlumnoId, null)
  }

  const handleDesvincular = async (registro: AlumnoEncargado) => {
    if (role !== 'admin') {
      notify({
        title: 'Acción no permitida',
        description: 'Solo administradores pueden eliminar vínculos.',
        variant: 'warning',
      })
      return
    }
    const confirmado = window.confirm('¿Deseas eliminar este vínculo?')
    if (!confirmado) return
    await desvincular({ alumnoId: registro.alumnoId, encargadoId: registro.encargadoId })
  }

  const handleClearSelections = () => {
    setSelectedAlumnoId('')
    setSelectedEncargadoId('')
    setAlumnoFilter('')
    setEncargadoFilter('')
    updateSearchParams(null, null) // limpia ?alumnoId y ?encargadoId
  }

  // ---------- UI helpers ----------
  const combinedOptionsError = alumnosError ?? encargadosError
  const total = dataTable.length

  const safeLabel = (opt: { label: string } | null, fallback = 'Seleccionado'): string =>
    opt?.label || fallback

  const filtrosLabel = selectedAlumnoId
    ? `Alumno: “${safeLabel(selectedAlumnoOption)}”`
    : selectedEncargadoId
      ? `Encargado: “${safeLabel(selectedEncargadoOption)}”`
      : 'Sin selección'

  const filtrosAccent: 'white' | 'yellow' | 'orange' =
    selectedAlumnoId ? 'yellow' : selectedEncargadoId ? 'orange' : 'white'

  return (
    <Page
      title="Vincular encargado"
      description="Relaciona encargados con alumnos para gestionar permisos y seguimiento."
      actions={
        <div className="flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
          <Button variant="secondary" onClick={handleClearSelections}>Limpiar</Button>
          <Button onClick={handleVincular} disabled={!selectedAlumnoId || !selectedEncargadoId || existsLinkAlready}>
            {existsLinkAlready ? 'Ya vinculado' : 'Vincular'}
          </Button>
        </div>
      }
    >
      {/* Hero resumen */}
      <HeroSummary
        title="Gestión de vínculos"
        total={total}
        filtersLabel={filtrosLabel}
        filtersAccent={filtrosAccent}
        sort={sort}
        options={SORT_OPTIONS}
        onChangeSort={(v) => setSort(v)}
      />

      {/* Barra de modo con chips — permitir que los menús se sobrepongan */}
      <div className="mb-4 relative z-20">
        <PanelCard className="px-5 py-4 overflow-visible">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="block text-sm font-semibold text-[#2e2e2e]">Modo de trabajo</span>
              <p className="text-sm text-[#667085]">Elige si partir de un alumno o de un encargado.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip
                active={!!selectedAlumnoId}
                onClick={() => {
                  setSelectedEncargadoId('')
                  updateSearchParams(selectedAlumnoId || null, null)
                }}
              >
                Por alumno
              </Chip>
              <Chip
                active={!!selectedEncargadoId && !selectedAlumnoId}
                onClick={() => {
                  setSelectedAlumnoId('')
                  updateSearchParams(null, selectedEncargadoId || null)
                }}
              >
                Por encargado
              </Chip>
              <Chip onClick={handleClearSelections}>Limpiar</Chip>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Selecciones y filtros — 👇 clave: overflow-visible y z-index alto */}
      <div className="relative z-30">
        <PanelCard className="px-5 py-5 overflow-visible">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[#2e2e2e]">Alumno</span>
              <Input
                label="Buscar alumno"
                value={alumnoFilter}
                onChange={(e) => setAlumnoFilter(e.target.value)}
                placeholder="Escribe para filtrar alumnos"
              />
              <NiceSelect
                label="Alumno"
                value={selectedAlumnoId}
                onChange={(val) => {
                  setSelectedAlumnoId(val)
                  updateSearchParams(val || null, selectedEncargadoId || null)
                  setAlumnoFilter('')
                }}
                disabled={isLoadingAlumnos}
                options={[
                  { value: '', label: 'Selecciona un alumno' },
                  ...filteredAlumnoOptions.map(o => ({ value: o.value, label: o.label })),
                ]}
                header="Alumnos disponibles"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-[#2e2e2e]">Encargado</span>
              <Input
                label="Buscar encargado"
                value={encargadoFilter}
                onChange={(e) => setEncargadoFilter(e.target.value)}
                placeholder="Escribe para filtrar encargados"
              />
              <NiceSelect
                label="Encargado"
                value={selectedEncargadoId}
                onChange={(val) => {
                  setSelectedEncargadoId(val)
                  setEncargadoFilter('')
                  updateSearchParams(selectedAlumnoId || null, val || null)
                }}
                disabled={isLoadingEncargados}
                options={[
                  { value: '', label: 'Selecciona un encargado' },
                  ...filteredEncargadoOptions.map(o => ({ value: o.value, label: o.label })),
                ]}
                header="Encargados disponibles"
              />
            </div>
          </div>

          {/* Acciones (duplicadas arriba) */}
          <div className="mt-4 flex justify-end">
            <div className="flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
              <Button
                variant="secondary"
                onClick={handleClearSelections}
                disabled={
                  !selectedAlumnoId &&
                  !selectedEncargadoId &&
                  !alumnoFilter.trim() &&
                  !encargadoFilter.trim()
                }
              >
                Limpiar selección
              </Button>

              <Button
                onClick={handleVincular}
                isLoading={isLinking}
                disabled={!selectedAlumnoId || !selectedEncargadoId || existsLinkAlready}
              >
                {existsLinkAlready ? 'Ya vinculado' : 'Vincular encargado'}
              </Button>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Mensajes/alertas */}
      {combinedOptionsError && (
        <div className={`${cls.panelCard} mt-4 border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700`}>
          {getErrorMessage(combinedOptionsError, 'No fue posible cargar las listas de alumnos o encargados.')}
          <span> Recarga la página para intentar nuevamente.</span>
        </div>
      )}

      {(isModoAlumno ? vinculosEncargadosError : vinculosAlumnosError) ? (
        <div className={`${cls.panelCard} mt-4 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700`}>
          {getErrorMessage(
            isModoAlumno ? vinculosEncargadosError : vinculosAlumnosError,
            isModoAlumno
              ? 'No fue posible cargar los vínculos del alumno.'
              : 'No fue posible cargar los alumnos del encargado.'
          )}
        </div>
      ) : (isModoAlumno ? isLoadingVinculosEncargados : isLoadingVinculosAlumnos) ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        // 👇 que la tabla nunca tape los dropdowns
        <div className={`${cls.panelCard} mt-4 p-0 relative z-0 overflow-visible`}>
          <Table
            data={dataTable}
            columns={columns}
            emptyMessage={
              isModoAlumno
                ? (selectedAlumnoId ? 'Sin encargados vinculados.' : 'Selecciona un alumno para ver sus encargados.')
                : (selectedEncargadoId ? 'Sin alumnos vinculados.' : 'Selecciona un encargado para ver sus alumnos.')
            }
            classNameHeader={cls.tableHeader}
            classNameRow={cls.tableRow}
            renderActions={(registro) => (
              <div className="flex justify-end gap-2">
                {role === 'admin' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDesvincular(registro)}
                    isLoading={isUnlinking}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            )}
          />
        </div>
      )}
    </Page>
  )
}

export default VincularEncargado

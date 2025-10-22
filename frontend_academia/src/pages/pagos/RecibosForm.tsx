import { useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { z } from 'zod'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Input from '../../components/form/Input'
import Select from '../../components/form/Select'
import { useToast } from '../../components/ui/Toast'
import { useApiMutation } from '../../hooks'
import { isApiError } from '../../api/types'
import type { ReciboCreateDTO, ReciboUpdateDTO } from '../../contract/moduleC'
import { crearRecibo, actualizarRecibo } from '../../services/recibos'
import { useAlumnoOptions } from '../../hooks/useCatalogOptions'
import PanelCard from '@/components/kit/PanelCard'
//Coment
const reciboCreateSchema = z.object({
  alumnoId: z.string().uuid({ message: 'Seleccione un alumno valido' }),
  total: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0.01, { message: 'El monto no puede ser 0' }),
  ),
  estado: z.enum(['EMITIDO', 'ANULADO']).default('EMITIDO'),
  fecha: z.string().default(new Date().toISOString().split('T')[0]),
})

type ReciboFormValues = z.input<typeof reciboCreateSchema>

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const RecibosForm = () => {
  const { notify } = useToast()
  const navigate = useNavigate()
  const { data: alumnos = [] } = useAlumnoOptions()
  const { id } = useParams()
  const location = useLocation()
  const isEditMode = Boolean(id)

  const methods = useForm<ReciboFormValues>({
    resolver: zodResolver(reciboCreateSchema),
    defaultValues: {
      alumnoId: '',
      total: undefined,
      estado: 'EMITIDO',
      fecha: new Date().toISOString().split('T')[0],
    },
  })

  const { mutateAsync: guardarRecibo, isPending } = useApiMutation({
    mutationFn: (payload: ReciboCreateDTO) => crearRecibo(payload),
    onSuccess: () => {
      notify({
        title: 'Recibo emitido',
        description: 'El recibo se registro correctamente.',
        variant: 'success',
      })
      navigate('/pagos/recibos')
    },
    onError: (error) => {
      notify({
        title: 'Error al emitir recibo',
        description: getErrorMessage(error, 'No fue posible emitir el recibo.'),
        variant: 'error',
      })
    },
  })

  // Cargar datos si se entra en modo edicion
  const [queryAlumno, setQueryAlumno] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedAlumno, setSelectedAlumno] = useState<{ label: string; value: string } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isEditMode) {
      const reciboData = location.state?.recibo
      if (reciboData) {
        methods.reset({
          alumnoId: reciboData.alumnoId ?? '',
          total: reciboData.total ?? undefined,
          estado: reciboData.estado ?? 'EMITIDO',
          fecha: reciboData.fecha ?? new Date().toISOString().split('T')[0],
        })
        const alumnoSeleccionado = alumnos.find(a => a.value === reciboData.alumnoId)
        if (alumnoSeleccionado) {
          setSelectedAlumno(alumnoSeleccionado)
          setQueryAlumno(alumnoSeleccionado.label)
        }
      }
    }
  }, [isEditMode, location.state, alumnos])

  const filteredAlumnos = useMemo(
    () =>
      queryAlumno.trim().length > 0
        ? alumnos.filter((a: { label: string }) =>
            a.label.toLowerCase().includes(queryAlumno.toLowerCase()),
          )
        : [],
    [alumnos, queryAlumno],
  )

  const handleSelectAlumno = (alumno: { label: string; value: string }) => {
    setSelectedAlumno(alumno)
    methods.setValue('alumnoId', alumno.value)
    setQueryAlumno(alumno.label)
    setShowSuggestions(false)
  }

  const handleClear = () => {
    setQueryAlumno('')
    setSelectedAlumno(null)
    methods.setValue('alumnoId', '')
    setShowSuggestions(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === 'alumnoId') {
        const alumnoSeleccionado = alumnos.find((alumno) => alumno.value === value.alumnoId)
        if (alumnoSeleccionado) {
          setSelectedAlumno(alumnoSeleccionado)
          setQueryAlumno(alumnoSeleccionado.label)
        } else if (!value.alumnoId) {
          setSelectedAlumno(null)
          setQueryAlumno('')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [alumnos, methods])

  const onSubmit = async (values: ReciboFormValues) => {
    const fecha = values.fecha?.trim() ? values.fecha : undefined
    const total = typeof values.total === 'number' ? values.total : undefined

    try {
      if (isEditMode && id) {
        const updatePayload: ReciboUpdateDTO = {
          fecha,
          total,
          estado: values.estado,
        }
        await actualizarRecibo(id, updatePayload)
        notify({
          title: 'Recibo actualizado',
          description: 'Los cambios se guardaron correctamente.',
          variant: 'success',
        })
        navigate('/pagos/recibos')
      } else {
        const createPayload: ReciboCreateDTO = {
          alumnoId: values.alumnoId,
          fecha,
          total,
          estado: values.estado,
        }
        await guardarRecibo(createPayload)
      }
    } catch (error) {
      notify({
        title: isEditMode ? 'Error al actualizar' : 'Error al emitir',
        description: getErrorMessage(error, 'No fue posible guardar los cambios.'),
        variant: 'error',
      })
    }
  }


  return (
    <Page
      title={isEditMode ? 'Editar recibo' : 'Emitir nuevo recibo'}
      description={
        isEditMode
          ? 'Modifica los datos del recibo seleccionado.'
          : 'Registra un nuevo recibo para un alumno.'
      }
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="grid max-w-3xl gap-6">
          <PanelCard className="px-6 py-6">
            <input type="hidden" value={selectedAlumno?.value ?? ''} {...methods.register('alumnoId')} />

            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-[#1f3c63]">
                {isEditMode ? 'Actualiza la informacion del recibo' : 'Completa los datos del nuevo recibo'}
              </h2>
              <p className="text-sm text-[#667085]">
                {isEditMode
                  ? 'Puedes ajustar la fecha, el estado o el monto antes de guardar los cambios.'
                  : 'Selecciona el alumno, define la fecha y el monto total a registrar.'}
              </p>
            </div>

            <div className="grid gap-4">
              <div className="relative space-y-2" ref={containerRef}>
                <label className="block text-sm font-medium text-[#1f3c63]">Alumno</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    value={queryAlumno}
                    onChange={(event) => {
                      if (!isEditMode) {
                        setQueryAlumno(event.target.value)
                        setShowSuggestions(true)
                      }
                    }}
                    placeholder="Buscar alumno por nombre o apellido"
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm shadow-[0_12px_32px_-26px_rgba(0,102,204,0.65)] focus:outline-none ${
                      isEditMode
                        ? 'cursor-not-allowed border-[#dbe7f7] bg-[#f4f6fb] text-[#667085]'
                        : 'border-[#cfe0f7] bg-[rgba(229,242,255,0.45)] text-[#1f3c63] focus:border-[#3385ff] focus:ring-2 focus:ring-[rgba(51,133,255,0.28)]'
                    }`}
                    readOnly={isEditMode}
                  />
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-full border border-[#cfe0f7] bg-white px-4 py-2 text-sm font-medium text-[#1f3c63] shadow-[0_10px_24px_-20px_rgba(0,68,140,0.35)] transition-colors hover:bg-[rgba(0,102,204,0.08)]"
                  >
                    Limpiar
                  </button>
                </div>
                {showSuggestions && filteredAlumnos.length > 0 && (
                  <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-[#cfe0f7] bg-white shadow-[0_24px_40px_-20px_rgba(31,60,99,0.25)]">
                    {filteredAlumnos.map((alumno) => (
                      <li
                        key={alumno.value}
                        className="cursor-pointer px-3 py-2 text-sm text-[#1f3c63] hover:bg-[rgba(0,102,204,0.08)]"
                        onMouseDown={(event) => {
                          event.preventDefault()
                          handleSelectAlumno(alumno)
                        }}
                      >
                        {alumno.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Input
                label="Correlativo"
                placeholder={isEditMode ? 'El correlativo no se puede editar' : 'Se generara automaticamente'}
                disabled
                value={isEditMode ? 'No editable' : 'El correlativo se generara automaticamente'}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Fecha"
                  type="date"
                  placeholder="yyyy-MM-dd"
                  {...methods.register('fecha', {
                    setValueAs: (value: string) => (value?.trim() ? value : undefined),
                  })}
                  error={methods.formState.errors.fecha?.message}
                />
                <Input
                  label="Monto total (Q)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...methods.register('total', {
                    setValueAs: (value: string) => {
                      if (value === '') return undefined
                      const parsed = Number.parseFloat(value)
                      return Number.isNaN(parsed) ? undefined : parsed
                    },
                  })}
                  error={methods.formState.errors.total?.message}
                />
              </div>

              <Controller
                name="estado"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Select
                    label="Estado"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    error={fieldState.error?.message}
                    options={[
                      { label: 'Emitido', value: 'EMITIDO' },
                      { label: 'Anulado', value: 'ANULADO' },
                    ]}
                  />
                )}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[rgba(0,102,204,0.12)] pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate('/pagos/recibos')}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isPending}>
                {isEditMode ? 'Guardar cambios' : 'Guardar recibo'}
              </Button>
            </div>
          </PanelCard>
        </form>
      </FormProvider>
    </Page>
  )
}

export default RecibosForm

import { useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Select from '../../components/form/Select'
import Input from '../../components/form/Input'
import { useToast } from '../../components/ui/Toast'
import { useApiMutation } from '../../hooks'
import { isApiError } from '../../api/types'
import type { TarifaCurso, TarifaCursoCreateDTO, TarifaCursoUpdateDTO } from '../../contract/moduleC'
import type { UUID } from '../../contract/moduleA'
import { crearTarifaCurso, actualizarTarifaCurso, listarTarifasPorOferta } from '../../services/tarifas'
import { tarifaCursoCreateSchema } from '../../validation/schemas'
import { useOfertaOptions } from '../../hooks/useCatalogOptions'

// Style kit (solo visual)
import PanelCard from '@/components/kit/PanelCard'

type TarifaFormValues = z.infer<typeof tarifaCursoCreateSchema>

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const TarifasForm = () => {
  const { notify } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [tarifaExistente, setTarifaExistente] = useState<TarifaCurso | null>(null)
  const [isLoadingTarifa, setIsLoadingTarifa] = useState(false)
  const ofertaSeleccionadaRef = useRef<string>('')

  const methods = useForm<TarifaFormValues>({
    resolver: zodResolver(tarifaCursoCreateSchema),
    defaultValues: {
      ofertaId: '',
      montoInscripcion: 0,
      montoMensualidad: 0,
    },
  })

  const { watch, setValue } = methods
  const ofertaId = watch('ofertaId')

  // Preseleccion desde la URL
  useEffect(() => {
    const pre = searchParams.get('ofertaId')
    if (pre) methods.setValue('ofertaId', pre, { shouldDirty: false, shouldValidate: false })
  }, [methods, searchParams])

  // Opciones de oferta
  const { data: ofertaOptions = [], isLoading: isLoadingOfertas } = useOfertaOptions()
  const ofertaSelectOptions = useMemo(
    () =>
      ofertaOptions.map((o) => ({
        value: o.value,
        label: `${o.cursoNombre} - Dia: ${o.dia} | ${o.horaInicio}-${o.horaFin}`,
      })),
    [ofertaOptions],
  )

  // Mutaciones
  const { mutateAsync: crear, isPending: isCreating } = useApiMutation({
    mutationFn: (payload: TarifaCursoCreateDTO) => crearTarifaCurso(payload),
    onSuccess: () => {
      notify({ title: 'Tarifa creada', description: 'La tarifa se registro correctamente.', variant: 'success' })
      navigate('/pagos/tarifas')
    },
    onError: (error) => {
      notify({
        title: 'Error al crear tarifa',
        description: getErrorMessage(error, 'No fue posible registrar la tarifa.'),
        variant: 'error',
      })
    },
  })

  const { mutateAsync: actualizar, isPending: isUpdating } = useApiMutation({
    mutationFn: (args: { tarifaId: string; data: TarifaCursoUpdateDTO }) =>
      actualizarTarifaCurso(args.tarifaId as any, args.data),
    onSuccess: () => {
      notify({ title: 'Tarifa actualizada', description: 'Los montos se guardaron correctamente.', variant: 'success' })
      navigate('/pagos/tarifas')
    },
    onError: (error) => {
      notify({
        title: 'Error al actualizar tarifa',
        description: getErrorMessage(error, 'No fue posible actualizar la tarifa.'),
        variant: 'error',
      })
    },
  })

  // Auto-cargar tarifa al cambiar oferta
  useEffect(() => {
    const cargarTarifa = async (id: string) => {
      if (!id) { setTarifaExistente(null); return }
      setIsLoadingTarifa(true)
      try {
        const list = await listarTarifasPorOferta(id as UUID)
        const t = list?.[0] ?? null
        setTarifaExistente(t || null)
        setValue('montoInscripcion', t?.montoInscripcion ?? 0)
        setValue('montoMensualidad', t?.montoMensualidad ?? 0)
      } catch (e) {
        setTarifaExistente(null)
        notify({
          title: 'No se pudo cargar la tarifa',
          description: getErrorMessage(e, 'Verifica tu conexion o vuelve a intentar.'),
          variant: 'warning',
        })
      } finally {
        setIsLoadingTarifa(false)
      }
    }

    if (ofertaId !== ofertaSeleccionadaRef.current) {
      ofertaSeleccionadaRef.current = ofertaId
      void cargarTarifa(ofertaId)
    }
  }, [ofertaId, notify, setValue])

  const onSubmit = async (values: TarifaFormValues) => {
    if (!values.ofertaId) {
      notify({ title: 'Selecciona una oferta', description: 'Debes elegir una oferta primero.', variant: 'warning' })
      return
    }

    if (tarifaExistente?.tarifaId) {
      await actualizar({
        tarifaId: tarifaExistente.tarifaId,
        data: {
          ofertaId: values.ofertaId,
          montoInscripcion: values.montoInscripcion,
          montoMensualidad: values.montoMensualidad,
        },
      })
    } else {
      const payload: TarifaCursoCreateDTO = {
        ofertaId: values.ofertaId,
        montoInscripcion: values.montoInscripcion,
        montoMensualidad: values.montoMensualidad,
      }
      await crear(payload)
    }
  }

  const isSaving = isCreating || isUpdating
  const hasOferta = Boolean(ofertaId)
  const initials = tarifaExistente ? 'AT' : 'NT' // (A)ctualizar / (N)ueva Tarifa
  const mainTitle = tarifaExistente ? 'Actualizar tarifa' : 'Nueva tarifa'
  const subtitle = tarifaExistente
    ? 'Modifica los montos de la oferta seleccionada.'
    : 'Registra montos para la oferta seleccionada.'

  return (
    <Page
      title={
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#2fb6ff] via-[#2575fc] to-[#1abc9c] text-xs font-bold text-white shadow-[0_12px_28px_-14px_rgba(37,117,252,0.45)]">
            {initials}
          </span>
          <span className="bg-gradient-to-r from-[#2fb6ff] via-[#2575fc] to-[#1abc9c] bg-clip-text text-lg font-semibold text-transparent md:text-xl">
            {mainTitle}
          </span>
        </div>
      }
      description={<span className="text-[13px] text-[#1f3c63]/80">{subtitle}</span>}
      actions={
        <div className="flex items-center gap-2 rounded-full bg-[rgba(0,102,204,0.08)] px-2 py-1 backdrop-blur-sm">
          <Button variant="secondary" onClick={() => navigate('/pagos/tarifas')}>Cancelar</Button>
          <Button form="tarifa-form" type="submit" isLoading={isSaving}>
            {tarifaExistente ? 'Guardar cambios' : 'Guardar tarifa'}
          </Button>
        </div>
      }
    >
      <FormProvider {...methods}>
        <form id="tarifa-form" onSubmit={methods.handleSubmit(onSubmit)} className="grid gap-4 max-w-2xl">
          {/* Seleccion de oferta */}
          <PanelCard className="px-5 py-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#2e2e2e]">Oferta</h3>
              <p className="text-sm text-[#667085]">Elige una oferta para consultar o definir su tarifa.</p>
            </div>

            <Select
              label="Oferta"
              placeholder={isLoadingOfertas ? 'Cargando ofertas...' : 'Selecciona una oferta'}
              options={ofertaSelectOptions}
              disabled={isLoadingOfertas}
              {...methods.register('ofertaId')}
              error={methods.formState.errors.ofertaId?.message}
            />

            {/* Chips de estado */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                hasOferta
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {hasOferta ? 'Oferta seleccionada' : 'Sin oferta seleccionada'}
              </span>

              {isLoadingTarifa && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                  Cargando tarifa...
                </span>
              )}

              {!isLoadingTarifa && hasOferta && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  tarifaExistente
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {tarifaExistente ? 'Con tarifa registrada' : 'Sin tarifa registrada'}
                </span>
              )}
            </div>
          </PanelCard>

          {/* Resumen actual */}
          <PanelCard className="px-5 py-5">
            <div className="mb-2">
              <h3 className="text-base font-semibold text-[#2e2e2e]">Resumen</h3>
            </div>

            <p className="text-sm text-[#667085] mb-3">
              {isLoadingTarifa
                ? 'Cargando informacion de la tarifa...'
                : tarifaExistente
                ? 'Tarifa actualmente registrada para esta oferta:'
                : hasOferta
                ? 'Esta oferta no tiene una tarifa registrada. Completa los montos para crearla.'
                : 'Selecciona una oferta para ver su tarifa.'}
            </p>

            {tarifaExistente && !isLoadingTarifa && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3 bg-white/50">
                  <span className="block text-xs opacity-70">Monto de inscripcion</span>
                  <span className="text-base font-semibold">Q {Number(tarifaExistente.montoInscripcion).toFixed(2)}</span>
                </div>
                <div className="rounded-lg border p-3 bg-white/50">
                  <span className="block text-xs opacity-70">Monto de mensualidad</span>
                  <span className="text-base font-semibold">Q {Number(tarifaExistente.montoMensualidad).toFixed(2)}</span>
                </div>
              </div>
            )}
          </PanelCard>

          {/* Montos */}
          <PanelCard className="px-5 py-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[#2e2e2e]">Montos</h3>
              <p className="text-sm text-[#667085]">Ingresa los valores en quetzales (Q).</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Monto de inscripcion"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...methods.register('montoInscripcion', {
                  setValueAs: (value: string) => {
                    const parsed = Number.parseFloat(value)
                    return Number.isNaN(parsed) ? 0 : parsed
                  },
                })}
                error={methods.formState.errors.montoInscripcion?.message}
              />

              <Input
                label="Monto de mensualidad"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...methods.register('montoMensualidad', {
                  setValueAs: (value: string) => {
                    const parsed = Number.parseFloat(value)
                    return Number.isNaN(parsed) ? 0 : parsed
                  },
                })}
                error={methods.formState.errors.montoMensualidad?.message}
              />
            </div>
          </PanelCard>
        </form>
      </FormProvider>
    </Page>
  )
}

export default TarifasForm

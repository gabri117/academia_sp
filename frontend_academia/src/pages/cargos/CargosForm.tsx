import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { isApiError } from '@/api/types'
import PanelCard from '@/components/kit/PanelCard'
import Input from '@/components/form/Input'
import Select from '@/components/form/Select'
import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { MES, CARGO_ESTADO, type CargoCreateDTO } from '@/contract/moduleC'
import { useApiMutation, useApiQuery } from '@/hooks'
import { crearCargo } from '@/services/cargos'
import { obtenerTarifaCurso } from '@/services/tarifas'
import { cargoCreateSchema } from '@/validation/schemas'

type CargoFormValues = z.infer<typeof cargoCreateSchema>

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type ConceptoPreset = 'Mensualidad' | 'Inscripcion' | 'Otros'

const CONCEPTO_OPTIONS: Array<{ label: string; value: ConceptoPreset }> = [
  { label: 'Mensualidad', value: 'Mensualidad' },
  { label: 'Inscripcion', value: 'Inscripcion' },
  { label: 'Otros', value: 'Otros' },
]

const formatCurrency = (value?: number | null) =>
  `Q ${Number(value ?? 0).toFixed(2)}`

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const CargosForm = () => {
  const { notify } = useToast()
  const navigate = useNavigate()
  const [conceptoPreset, setConceptoPreset] = useState<ConceptoPreset>('Mensualidad')

  const methods = useForm<CargoFormValues>({
    resolver: zodResolver(cargoCreateSchema),
    defaultValues: {
      tarifaId: '',
      periodoMes: MES[0],
      concepto: 'Mensualidad',
      monto: 0,
      estado: 'PENDIENTE',
    },
  })

  const { mutateAsync: guardarCargo, isPending } = useApiMutation({
    mutationFn: (payload: CargoCreateDTO) => crearCargo(payload),
    onSuccess: () => {
      notify({
        title: 'Cargo creado',
        description: 'El cargo se registro correctamente.',
        variant: 'success',
      })
      navigate('/pagos/cargos')
    },
    onError: (error) => {
      notify({
        title: 'Error al crear cargo',
        description: getErrorMessage(error, 'No fue posible registrar el cargo.'),
        variant: 'error',
      })
    },
  })

  const tarifaIdValue = methods.watch('tarifaId')
  const isTarifaIdValid = UUID_REGEX.test(tarifaIdValue ?? '')

  const {
    data: tarifaDetalle,
    isFetching: isLoadingTarifa,
    error: tarifaError,
  } = useApiQuery({
    queryKey: ['tarifa-curso', tarifaIdValue],
    queryFn: () => obtenerTarifaCurso(tarifaIdValue),
    enabled: isTarifaIdValid,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  })

  useEffect(() => {
    if (!tarifaError) return

    notify({
      title: 'No se pudo obtener la tarifa',
      description: getErrorMessage(
        tarifaError,
        'No fue posible cargar la informacion de la tarifa seleccionada.',
      ),
      variant: 'error',
    })
  }, [tarifaError, notify])

  useEffect(() => {
    if (conceptoPreset === 'Otros') {
      const currentConcept = methods.getValues('concepto')
      if (currentConcept === 'Mensualidad' || currentConcept === 'Inscripcion') {
        methods.setValue('concepto', '', { shouldDirty: true })
      }
      return
    }

    methods.setValue('concepto', conceptoPreset, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }, [conceptoPreset, methods])

  useEffect(() => {
    if (conceptoPreset === 'Otros') return

    const montoReferencia =
      conceptoPreset === 'Mensualidad'
        ? tarifaDetalle?.montoMensualidad
        : tarifaDetalle?.montoInscripcion

    methods.setValue('monto', Number(montoReferencia ?? 0), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }, [conceptoPreset, tarifaDetalle, methods])

  const onSubmit = async (values: CargoFormValues) => {
    await guardarCargo(values as CargoCreateDTO)
  }

  const isMontoEditable = conceptoPreset === 'Otros'

  return (
    <Page title="Nuevo cargo" description="Genera un cargo asociado a una tarifa.">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="grid max-w-3xl gap-6">
          <PanelCard className="px-6 py-6">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-[#1f3c63]">Datos generales</h2>
              <p className="text-sm text-[#667085]">
                Identifica la tarifa objetivo, el periodo y la naturaleza del cargo. El monto se
                calcula automaticamente cuando corresponde.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label="Tarifa (UUID)"
                  placeholder="00000000-0000-0000-0000-000000000000"
                  {...methods.register('tarifaId')}
                  error={methods.formState.errors.tarifaId?.message}
                />
              </div>
              <Select
                label="Mes"
                {...methods.register('periodoMes')}
                error={methods.formState.errors.periodoMes?.message}
                options={MES.map((mes) => ({ label: mes, value: mes }))}
              />
              <Select
                label="Concepto"
                value={conceptoPreset}
                onChange={(event) => setConceptoPreset(event.target.value as ConceptoPreset)}
                options={CONCEPTO_OPTIONS}
              />
            </div>

            {conceptoPreset === 'Otros' && (
              <div className="mt-4">
                <Controller
                  name="concepto"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <Input
                      label="Concepto personalizado"
                      placeholder="Describe el concepto"
                      maxLength={30}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                label="Monto"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...methods.register('monto', {
                  setValueAs: (value: string) => {
                    const parsed = Number.parseFloat(value)
                    return Number.isNaN(parsed) ? 0 : parsed
                  },
                })}
                disabled={!isMontoEditable}
                hint={
                  !isMontoEditable
                    ? isLoadingTarifa
                      ? 'Cargando monto de la tarifa...'
                      : 'El monto se llena automaticamente segun la tarifa seleccionada.'
                    : 'Puedes ajustar el monto porque seleccionaste un concepto personalizado.'
                }
                error={methods.formState.errors.monto?.message}
              />
              <Controller
                name="estado"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <Select
                    label="Estado"
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    error={fieldState.error?.message}
                    options={CARGO_ESTADO.map((estado) => ({ label: estado, value: estado }))}
                  />
                )}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[rgba(0,102,204,0.12)] pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate('/pagos/cargos')}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isPending}>
                Guardar cargo
              </Button>
            </div>
          </PanelCard>

          {isTarifaIdValid && (
            <PanelCard className="px-6 py-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[#1f3c63]">Resumen de la tarifa</h3>
                  <p className="text-xs text-[#667085]">
                    Revisa los montos de referencia antes de confirmar el nuevo cargo.
                  </p>
                </div>
              </div>

              {isLoadingTarifa ? (
                <div className="mt-4 flex items-center gap-3 text-sm text-[#1f3c63]">
                  <Spinner size="sm" />
                  <span>Cargando informacion de la tarifa seleccionada...</span>
                </div>
              ) : tarifaDetalle ? (
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#cfe0f7] bg-white/70 px-4 py-3 text-sm text-[#1f3c63] shadow-[0_16px_32px_-28px_rgba(0,68,140,0.25)]">
                    <dt className="text-xs uppercase tracking-wide text-[#667085]">Descripcion</dt>
                    <dd className="mt-1 font-semibold">
                      {String(tarifaDetalle.descripcion ?? 'Sin Descripcion')}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[#cfe0f7] bg-white/70 px-4 py-3 text-sm text-[#1f3c63] shadow-[0_16px_32px_-28px_rgba(0,68,140,0.25)]">
                    <dt className="text-xs uppercase tracking-wide text-[#667085]">Mensualidad</dt>
                    <dd className="mt-1 font-semibold">
                      {formatCurrency(tarifaDetalle.montoMensualidad)}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[#cfe0f7] bg-white/70 px-4 py-3 text-sm text-[#1f3c63] shadow-[0_16px_32px_-28px_rgba(0,68,140,0.25)]">
                    <dt className="text-xs uppercase tracking-wide text-[#667085]">Inscripcion</dt>
                    <dd className="mt-1 font-semibold">
                      {formatCurrency(tarifaDetalle.montoInscripcion)}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[#cfe0f7] bg-white/70 px-4 py-3 text-sm text-[#1f3c63] shadow-[0_16px_32px_-28px_rgba(0,68,140,0.25)]">
                    <dt className="text-xs uppercase tracking-wide text-[#667085]">Oferta vinculada</dt>
                    <dd className="mt-1 font-semibold">
                      {String(tarifaDetalle.ofertaNombre ?? 'Oferta no especificada')}
                    </dd>
                    {tarifaDetalle.ofertaHorario != null && (
                      <dd className="text-xs text-[#667085]">
                        {String(tarifaDetalle.ofertaHorario)}
                      </dd>
                    )}
                  </div>
                </dl>
              ) : (
                <p className="mt-4 text-sm text-[#b45309]">
                  No fue posible cargar la informacion de la tarifa. Revisa el identificador ingresado.
                </p>
              )}
            </PanelCard>
          )}
        </form>
      </FormProvider>
    </Page>
  )
}

export default CargosForm


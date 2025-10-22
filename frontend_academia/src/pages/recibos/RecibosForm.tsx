import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Input from '../../components/form/Input'
import Select from '../../components/form/Select'
import { useToast } from '../../components/ui/Toast'
import { useApiMutation } from '../../hooks'
import { isApiError } from '../../api/types'
import { RECIBO_ESTADO, type ReciboCreateDTO } from '../../contract/moduleC'
import { registrarRecibo } from '../../services/recibos'
import { reciboCreateSchema } from '../../validation/schemas'
import { useAlumnoOptions } from '../../hooks/useCatalogOptions'
import PanelCard from '@/components/kit/PanelCard'


type ReciboFormValues = z.infer<typeof reciboCreateSchema>

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

  const methods = useForm<ReciboFormValues>({
    resolver: zodResolver(reciboCreateSchema),
    defaultValues: {
      alumnoId: '',
      correlativoRecibo: undefined,
      fecha: undefined,
      total: undefined,
      estado: 'EMITIDO',
    },
  })


  const { mutateAsync: guardarRecibo, isPending } = useApiMutation({
    mutationFn: (payload: ReciboCreateDTO) => registrarRecibo(payload),
    onSuccess: () => {
      notify({
        title: 'Recibo registrado',
        description: 'El recibo se registro correctamente.',
        variant: 'success',
      })
      navigate('/pagos/recibos')
    },
    onError: (error) => {
      notify({
        title: 'Error al registrar recibo',
        description: getErrorMessage(error, 'No fue posible registrar el recibo.'),
        variant: 'error',
      })
    },
  })

  const onSubmit = async (values: ReciboFormValues) => {
    await guardarRecibo(values as ReciboCreateDTO)
  }

  return (
    <Page title="Nuevo recibo" description="Registra un recibo asociado a un alumno.">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="grid max-w-3xl gap-6">
          <PanelCard className="px-6 py-6">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-[#1f3c63]">Datos del recibo</h2>
              <p className="text-sm text-[#667085]">
                Selecciona el alumno, indica la fecha y establece el total antes de guardar.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Controller
                  name="alumnoId"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <Select
                      label="Alumno"
                      placeholder="Buscar alumno por nombre o apellido"
                      value={field.value ?? ''}
                      onChange={(event) => field.onChange(event.target.value)}
                      options={alumnos.map((alumno: { label: string; value: string }) => ({
                        label: alumno.label,
                        value: alumno.value,
                      }))}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>

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
                label="Total (Q)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...methods.register('total', {
                  setValueAs: (value: string) => {
                    if (value === '') {
                      return undefined
                    }
                    const parsed = Number.parseFloat(value)
                    return Number.isNaN(parsed) ? undefined : parsed
                  },
                })}
                error={methods.formState.errors.total?.message}
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
                    options={RECIBO_ESTADO.map((value) => ({ label: value, value }))}
                  />
                )}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[rgba(0,102,204,0.12)] pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate('/pagos/recibos')}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isPending}>
                Guardar recibo
              </Button>
            </div>
          </PanelCard>
        </form>
      </FormProvider>
    </Page>
  )
}
//Coment
export default RecibosForm

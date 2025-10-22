import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { isApiError } from '@/api/types'
import PanelCard from '@/components/kit/PanelCard'
import Input from '@/components/form/Input'
import Page from '@/components/layout/Page'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useApiMutation } from '@/hooks'
import type { DetalleReciboCreateDTO } from '@/contract/moduleC'
import { registrarDetalleRecibo } from '@/services/detalleRecibo'
import { detalleReciboCreateSchema } from '@/validation/schemas'

type DetalleReciboFormValues = z.infer<typeof detalleReciboCreateSchema>

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const DetalleReciboForm = () => {
  const { notify } = useToast()
  const navigate = useNavigate()

  const methods = useForm<DetalleReciboFormValues>({
    resolver: zodResolver(detalleReciboCreateSchema),
    defaultValues: {
      reciboId: '',
      cargoId: '',
      montoAplicado: 0,
    },
  })

  const { mutateAsync: guardarDetalle, isPending } = useApiMutation({
    mutationFn: (payload: DetalleReciboCreateDTO) => registrarDetalleRecibo(payload),
    onSuccess: () => {
      notify({
        title: 'Detalle registrado',
        description: 'El detalle de recibo se registro correctamente.',
        variant: 'success',
      })
      navigate('/pagos/recibos')
    },
    onError: (error) => {
      notify({
        title: 'Error al registrar detalle',
        description: getErrorMessage(error, 'No fue posible registrar el detalle del recibo.'),
        variant: 'error',
      })
    },
  })

  const onSubmit = async (values: DetalleReciboFormValues) => {
    await guardarDetalle(values as DetalleReciboCreateDTO)
  }

  return (
    <Page title="Nuevo detalle de recibo" description="Aplica montos a un recibo existente.">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="grid max-w-2xl gap-6">
          <PanelCard className="px-6 py-6">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-[#1f3c63]">Relaciona recibo y cargo</h2>
              <p className="text-sm text-[#667085]">
                Utiliza los identificadores de recibo y cargo tal como aparecen en el sistema, y define
                el monto aplicado que deseas registrar.
              </p>
            </div>

            <div className="grid gap-4">
              <Input
                label="Recibo (UUID)"
                placeholder="00000000-0000-0000-0000-000000000000"
                {...methods.register('reciboId')}
                error={methods.formState.errors.reciboId?.message}
              />
              <Input
                label="Cargo (UUID)"
                placeholder="00000000-0000-0000-0000-000000000000"
                {...methods.register('cargoId')}
                error={methods.formState.errors.cargoId?.message}
              />
              <Input
                label="Monto aplicado"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...methods.register('montoAplicado', {
                  setValueAs: (value: string) => {
                    const parsed = Number.parseFloat(value)
                    return Number.isNaN(parsed) ? 0 : parsed
                  },
                })}
                error={methods.formState.errors.montoAplicado?.message}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-[rgba(0,102,204,0.12)] pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate('/pagos/recibos')}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isPending}>
                Guardar detalle
              </Button>
            </div>
          </PanelCard>
        </form>
      </FormProvider>
    </Page>
  )
}

export default DetalleReciboForm

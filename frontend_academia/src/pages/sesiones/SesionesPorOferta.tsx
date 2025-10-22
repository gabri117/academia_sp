import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Page from '../../components/layout/Page'
import Button from '../../components/ui/Button'
import Table from '@/components/ui/Table'
import type { TableColumn } from '@/components/ui/Table'
import Spinner from '../../components/ui/Spinner'
import Input from '../../components/form/Input'
import Select from '../../components/form/Select'
import { useApiQuery } from '../../hooks'
import { isApiError } from '../../api/types'
import type { SesionClase, SesionClaseRangeQuery } from '../../contract/moduleC'
import { listSesionesPorOferta, listSesionesPorRango } from '../../services/sesiones'
import { optionalDate, uuidSchema } from '../../validation/schemas'
import { useOfertaOptions } from '../../hooks/useCatalogOptions'

const columns: TableColumn<SesionClase>[] = [
  { key: 'fecha', header: 'Fecha' },
  { key: 'ofertaId', header: 'Oferta' },
  { key: 'sessionId', header: 'Sesion' },
]

const filterSchema = z
  .object({
    ofertaId: uuidSchema('ofertaId'),
    desde: optionalDate('Desde'),
    hasta: optionalDate('Hasta'),
  })
  .refine(
    (data) => {
      if (!data.desde || !data.hasta) {
        return true
      }
      return data.desde <= data.hasta
    },
    { message: 'La fecha inicial debe ser menor o igual que la final', path: ['hasta'] },
  )

type FilterValues = z.infer<typeof filterSchema>

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const SesionesPorOferta = () => {
  const navigate = useNavigate()

  const { data: ofertaOptions = [], isLoading: isLoadingOfertas } = useOfertaOptions()

  const methods = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      ofertaId: '',
      desde: undefined,
      hasta: undefined,
    },
  })

  const [activeOferta, setActiveOferta] = useState<string | null>(null)
  const [activeRange, setActiveRange] = useState<SesionClaseRangeQuery | null>(null)

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useApiQuery<SesionClase[]>({
    queryKey: ['sesiones', activeOferta, activeRange?.desde ?? '', activeRange?.hasta ?? ''],
    queryFn: () => {
      if (!activeOferta) {
        return Promise.resolve<SesionClase[]>([])
      }
      if (activeRange?.desde || activeRange?.hasta) {
        return listSesionesPorRango(activeOferta, activeRange ?? {})
      }
      return listSesionesPorOferta(activeOferta)
    },
    enabled: Boolean(activeOferta),
  })

  const sesiones = useMemo(() => data ?? [], [data])

  const onSubmit = (values: FilterValues) => {
    setActiveOferta(values.ofertaId)
    const range: SesionClaseRangeQuery = {
      desde: values.desde,
      hasta: values.hasta,
    }
    setActiveRange(range.desde || range.hasta ? range : null)
  }

  const handleClear = () => {
    methods.reset({ ofertaId: '', desde: undefined, hasta: undefined })
    setActiveOferta(null)
    setActiveRange(null)
  }

  return (
    <Page
      title="Sesiones por oferta"
      description="Consulta las sesiones generadas para una oferta y filtra por rango de fechas."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => refetch()} disabled={!activeOferta || isFetching}>
            {isFetching ? 'Actualizando…' : 'Recargar'}
          </Button>
          <Button onClick={() => navigate('/sesiones/nueva')}>Nueva sesion</Button>
        </div>
      }
    >
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
         className="grid gap-4 rounded-lg border border-border bg-white p-4 shadow-sm md:grid-cols-4"
       >
          <Select
            label="Oferta"
            placeholder={isLoadingOfertas ? 'Cargando ofertas...' : 'Selecciona una oferta'}
            options={ofertaOptions}
            disabled={isLoadingOfertas}
            {...methods.register('ofertaId')}
            error={methods.formState.errors.ofertaId?.message}
          />
          <Input
            label="Desde (yyyy-MM-dd)"
            type="date"
            {...methods.register('desde', {
              setValueAs: (value: string) => (value?.trim() ? value : undefined),
            })}
            error={methods.formState.errors.desde?.message}
          />
          <Input
            label="Hasta (yyyy-MM-dd)"
            type="date"
            {...methods.register('hasta', {
              setValueAs: (value: string) => (value?.trim() ? value : undefined),
            })}
            error={methods.formState.errors.hasta?.message}
          />
          <div className="flex items-end justify-end gap-2">
            <Button type="submit">Buscar</Button>
            <Button type="button" variant="secondary" onClick={handleClear}>
              Limpiar
            </Button>
          </div>
        </form>
      </FormProvider>

      {error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(error, 'No fue posible cargar las sesiones.')}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table
          className="mt-6"
          data={activeOferta ? sesiones : []}
          columns={columns}
          emptyMessage={
            activeOferta
              ? 'No se encontraron sesiones para los filtros aplicados.'
              : 'Ingresa una oferta para visualizar sus sesiones.'
          }
          getRowKey={(item) => item.sessionId}
        />
      )}
    </Page>
  )
}

export default SesionesPorOferta

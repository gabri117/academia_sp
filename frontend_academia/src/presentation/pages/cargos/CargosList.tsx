import { useMemo, useState } from 'react'

import { isApiError } from '../../../api/types'
import Page from '../../../components/layout/Page'
import Select from '../../../components/form/Select'
import Button from '../../../components/ui/Button'
import Spinner from '../../../components/ui/Spinner'
import Table, { type TableColumn } from '../../../components/ui/Table'
import { useToast } from '../../../components/ui/Toast'
import { useApiQuery } from '../../../hooks'
import { useTarifaOptions } from '../../../hooks/useCatalogOptions'
import type { Cargo } from '../../../contract/moduleC'
import { listarCargosPorTarifa } from '../../../services/cargos'
//Coment
const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

const CargosList = () => {
  const { notify } = useToast()

  const [tarifaInput, setTarifaInput] = useState('')
  const [activeTarifa, setActiveTarifa] = useState<string | null>(null)

  const { data: tarifaOptions = [], isLoading: isLoadingTarifas } = useTarifaOptions()

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useApiQuery<Cargo[]>({
    queryKey: ['cargos', activeTarifa],
    queryFn: () => listarCargosPorTarifa(activeTarifa!),
    enabled: Boolean(activeTarifa),
  })

  const cargos = useMemo(() => data ?? [], [data])

  const columns = useMemo<TableColumn<Cargo>[]>(() => {
    const renderText = (content: string | number) => (
      <span className="block text-center">{String(content)}</span>
    )

    return [
      {
        key: 'periodoMes',
        header: 'Mes',
        render: (item) => renderText(item.periodoMes),
      },
      {
        key: 'concepto',
        header: 'Concepto',
        render: (item) => renderText(item.concepto ?? 'Sin concepto'),
      },
      {
        key: 'monto',
        header: 'Monto',
        render: (item) => renderText(`Q ${item.monto.toFixed(2)}`),
      },
      {
        key: 'estado',
        header: 'Estado',
        render: (item) => renderText(item.estado),
      },
    ]
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const tarifaId = tarifaInput.trim()

    if (!tarifaId) {
      notify({
        title: 'Filtro incompleto',
        description: 'Selecciona una tarifa para consultar los cargos.',
        variant: 'warning',
      })
      return
    }

    setActiveTarifa(tarifaId)
  }

  const handleClear = () => {
    setTarifaInput('')
    setActiveTarifa(null)
  }

  return (
    <Page
      title="Cargos por tarifa"
      description="Consulta los cargos generados para una tarifa específica."
      actions={
        <Button
          variant="secondary"
          onClick={() => refetch()}
          disabled={!activeTarifa || isFetching}
        >
          {isFetching ? 'Actualizando...' : 'Recargar'}
        </Button>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-border bg-white p-4 shadow-sm md:flex-row md:items-end"
      >
        <Select
          label="Tarifa"
          placeholder={isLoadingTarifas ? 'Cargando tarifas...' : 'Selecciona una tarifa'}
          value={tarifaInput}
          onChange={(event) => setTarifaInput(event.target.value)}
          options={tarifaOptions}
          disabled={isLoadingTarifas}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button type="submit">Buscar</Button>
          <Button type="button" variant="secondary" onClick={handleClear}>
            Limpiar
          </Button>
        </div>
      </form>

      {error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(error, 'No fue posible cargar los cargos.')}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <Table
          className="mt-6"
          data={activeTarifa ? cargos : []}
          columns={columns}
          emptyMessage={
            activeTarifa
              ? 'No se encontraron cargos para la tarifa seleccionada.'
              : 'Selecciona una tarifa para visualizar sus cargos.'
          }
          getRowKey={(item) => item.cargoId}
        />
      )}
    </Page>
  )
}

export default CargosList


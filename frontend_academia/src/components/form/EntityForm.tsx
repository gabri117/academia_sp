import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { z } from 'zod'

import Button from '../ui/Button'
import RHFInput from './RHFInput'

export type EntityField = {
  name: string
  label: string
  type?: 'text' | 'email' | 'number' | 'date'
  placeholder?: string
}

export type EntityFormValues = Record<string, string>

export type EntityFormProps = {
  entity: string
  fields?: EntityField[]
  onSubmit?: (values: EntityFormValues) => void
}

const createSchema = (fields: EntityField[]) =>
  z.object(
    fields.reduce<Record<string, z.ZodTypeAny>>((shape, field) => {
      if (field.type === 'email') {
        shape[field.name] = z.string().email('Correo invalido')
      } else {
        shape[field.name] = z.string().min(1, 'Requerido')
      }
      return shape
    }, {}),
  )

const EntityForm = ({ entity, fields = [{ name: 'name', label: `Nombre del ${entity}` }], onSubmit }: EntityFormProps) => {
  const schema = createSchema(fields)
  const methods = useForm<EntityFormValues>({
    defaultValues: fields.reduce<EntityFormValues>((defaults, field) => {
      defaults[field.name] = ''
      return defaults
    }, {}),
    resolver: zodResolver(schema) as Resolver<EntityFormValues>,
    mode: 'onBlur',
  })

  const handleSubmit = methods.handleSubmit((values) => {
    onSubmit?.(values)
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <RHFInput<EntityFormValues>
            key={field.name}
            name={field.name}
            label={field.label}
            placeholder={field.placeholder}
            type={field.type}
          />
        ))}
        <div className="flex justify-end">
          <Button type="submit">Guardar {entity}</Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default EntityForm
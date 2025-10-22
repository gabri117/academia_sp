import { useController, useFormContext } from 'react-hook-form'
import type { FieldValues, Path } from 'react-hook-form'

import Input from './Input'
import type { InputProps } from './Input'

type RHFInputProps<T extends FieldValues> = Omit<InputProps, 'name' | 'error'> & {
  name: Path<T>
}

const RHFInput = <T extends FieldValues>({ name, ...props }: RHFInputProps<T>) => {
  const { control } = useFormContext<T>()
  const {
    field,
    fieldState: { error },
  } = useController({ name, control })

  return <Input {...props} {...field} error={error?.message} />
}

export default RHFInput
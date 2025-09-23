import * as React from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface FormInputProps {
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  error?: string
  icon?: React.ReactNode
  label?: string
  name?: string
  onChange?: (value: number | string) => void
  placeholder?: string
  required?: boolean
  triggerSlot?: React.ReactNode
  type?: 'color' | 'email' | 'group' | 'number' | 'password' | 'select' | 'text'
  value?: number | string
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      children,
      className,
      disabled = false,
      error,
      icon,
      label,
      name,
      onChange,
      placeholder,
      required = false,
      triggerSlot,
      type = 'text',
      value,
      ...props
    },
    ref
  ) => {
    const selectRef = React.useRef<HTMLButtonElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Expose ref based on input type
    React.useImperativeHandle(ref, () => {
      if (type === 'select') {
        return selectRef.current as any
      }
      return inputRef.current as HTMLInputElement
    })

    const handleChange = (newValue: number | string) => {
      onChange?.(newValue)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = type === 'number' ? Number(e.target.value) : e.target.value
      handleChange(newValue)
    }

    const renderInput = () => {
      if (type === 'group') {
        return children
      }

      if (type === 'color') {
        return (
          <div className="relative items-center w-full">
            <input
              className="absolute inset-y-2 rounded w-6 h-6 start-2"
              disabled={disabled}
              onChange={handleInputChange}
              type="color"
              value={value?.toString() || ''}
            />
            <Input
              className="pl-10"
              disabled={disabled}
              name={name}
              onChange={handleInputChange}
              placeholder={placeholder}
              ref={inputRef}
              required={required}
              type="text"
              value={value?.toString() || ''}
              {...props}
            />
          </div>
        )
      }

      if (type === 'select') {
        return (
          <Select
            disabled={disabled}
            onValueChange={handleChange}
            required={required}
            value={value?.toString() || ''}
          >
            <SelectTrigger ref={selectRef}>
              {triggerSlot || <SelectValue placeholder={placeholder} />}
            </SelectTrigger>
            <SelectContent>{children}</SelectContent>
          </Select>
        )
      }

      return (
        <Input
          className={icon ? 'pl-10' : ''}
          disabled={disabled}
          onChange={handleInputChange}
          placeholder={placeholder}
          ref={inputRef}
          required={required}
          type={type}
          value={value?.toString() || ''}
          {...props}
        />
      )
    }

    return (
      <div className={cn('gap-1 grid', className)}>
        <Label className="gap-1 grid">
          {label && <span>{label}</span>}
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none">
                {icon}
              </div>
            )}
            {renderInput()}
          </div>
        </Label>
        {error && <div className="text-red-500 text-sm">{error}.</div>}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'

export { FormInput }
export type { FormInputProps }

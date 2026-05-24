export interface DescriptionsSchema {
  span?: number // Span count.
  field: string // Field name.
  label?: string // Label name.
  mappedField?: string // Field mapping.
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  labelAlign?: 'left' | 'center' | 'right'
  className?: string
  labelClassName?: string
  dateFormat?: string // Supports time formatting.
  dictType?: string // Supports dict data.
}

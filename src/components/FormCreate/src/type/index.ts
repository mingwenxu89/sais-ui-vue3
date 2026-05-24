// Left-side drag button.
export interface MenuItem {
  label: string
  name: string
  icon: string
}

// Left-side drag button category.
export interface Menu {
  title: string
  name: string
  list: MenuItem[]
}

// Common dropdown component prop types.
export interface ApiSelectProps {
  name: string // Component name.
  labelField?: string // Option label.
  valueField?: string // Option value.
  url?: string // URL API.
  isDict?: boolean // Whether this is a dict selector.
}

// Select component rule configuration type.
export interface SelectRuleOption {
  label: string // Label name.
  name: string // Component name.
  icon: string // Component icon.
  props?: any[] // Component rules.
  event?: any[] // Event configuration.
}

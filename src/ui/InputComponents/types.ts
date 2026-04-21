
export interface BaseProps {
    label: string
    value: string
    disabled?: boolean
    required?: boolean
    onChange: (arg0: string) => void
    tooltip?: string
    errorMessage?: string
}

export const classNames = "shadow text-sm appearance-none border rounded w-50 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-neutral-100"

type ChangeEventHandler = React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

export interface BaseProps {
    label: string
    value: number | string
    disabled?: boolean
    required?: boolean
    onChange: ChangeEventHandler
    tooltip?: string
    errorMessage?: string
}

export const classNames = "shadow appearance-none border rounded w-50 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-neutral-100"

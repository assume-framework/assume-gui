interface BaseProps {
    id: string
    label: string
    value: any
    disabled?: boolean
    onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>
}

interface InputProperties extends BaseProps {
    type: string
}

export const Input = ({
    type,
    id,
    value,
    label,
    disabled = false,
    onChange
}: InputProperties) => {
    return (
        <div>
            <label htmlFor={id} className="block text-gray-700 text-sm font-bold mt-2">{label}</label>
            <input
                type={type}
                id={id}
                value={value}
                disabled={disabled}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-neutral-100"
            />
        </div>
    )
}

interface SelectProperties extends BaseProps {
    children: React.ReactNode
}

export const Select = ({
    id,
    value,
    label,
    onChange,
    disabled = false,
    children
}: SelectProperties) => {
    return (
        <div>
            <label htmlFor={id} className="block text-gray-700 text-sm font-bold mt-2">{label}</label>
            <select
                id={id}
                value={value}
                disabled={disabled}
                onChange={onChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-neutral-100"
            >
                {children}
            </select>
        </div>
    )
}

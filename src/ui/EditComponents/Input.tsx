interface BaseProps {
    id: string
    label: string
    value: any
    disabled?: boolean
    required?: boolean
    onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
}

interface InputProperties extends BaseProps {
    type: string
}
const classNames = "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:bg-neutral-100"

export const Input = ({
    type,
    id,
    value,
    label,
    disabled = false,
    required = false,
    onChange
}: InputProperties) => {

    return (
        <div>
            <label htmlFor={id} className="block text-gray-700 text-sm font-bold mt-2">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    id={id}
                    value={value}
                    disabled={disabled}
                    required={required}
                    onChange={onChange}
                    className={classNames}
                />
            ) : (
                <input
                    type={type}
                    id={id}
                    value={value}
                    disabled={disabled}
                    onChange={onChange}
                    className={classNames}
                />
            )}
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
    required = false,
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
                required={required}
                className={classNames}
            >
                <option disabled selected value="">-- select an option --</option>
                {children}
            </select>
        </div>
    )
}

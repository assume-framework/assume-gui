import { classNames, type BaseProps } from "./types"

interface SelectProperties extends BaseProps {
    children: React.ReactNode
}

function Select ({
    id,
    value,
    label,
    onChange,
    disabled = false,
    required = false,
    children
}: SelectProperties) {
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

export default Select

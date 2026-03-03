import { classNames, type BaseProps } from "./types"
import {useId} from "react";

interface SelectProperties extends BaseProps {
    children: React.ReactNode
}

export default function Select ({
    value,
    label,
    onChange,
    errorMessage,
    disabled = false,
    required = false,
    children
}: SelectProperties) {
    const id = useId()
    const color = errorMessage ? "text-red-500" : "text-gray-700"
    return (
        <div>
            <label htmlFor={id} className={`block text-sm font-bold mt-2 ${color}`}>{label}</label>
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
            {errorMessage && <div className="text-red-500">
                {errorMessage}
            </div>}
        </div>
    )
}

import { classNames, type BaseProps } from "./types"

interface InputProperties extends BaseProps {
    type: string
}

function Input ({
    type,
    id,
    value,
    label,
    disabled = false,
    required = false,
    onChange
}: InputProperties) {

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

export default Input;

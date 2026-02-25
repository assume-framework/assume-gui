import {classNames, type BaseProps} from "./types"
import {useId} from "react";
import {HelpOutline} from "@mui/icons-material";

interface InputProperties extends BaseProps {
    type: React.HTMLInputTypeAttribute | "textarea";
}

export default function Input(
    {
        type,
        value,
        label,
        tooltip,
        disabled = false,
        required = false,
        onChange,
        errorMessage,
    }: InputProperties) {
    const id = useId()
    const color = errorMessage ? "text-red-500" : "text-gray-700"
    return (
        <>
            <label htmlFor={id}
                   className={`block text-sm font-bold mt-2 ${color}`}>{label}</label>
            <div className="flex">
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
                        required={required}
                        className={classNames}
                    />
                )}
                {tooltip &&
                  <div title={tooltip}
                       className="py-2 pl-3">
                    <HelpOutline/>
                  </div>
                }
            </div>
            {errorMessage && <div className="text-red-500">
                {errorMessage}
            </div>}
        </>
    )
}

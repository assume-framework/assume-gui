import { useState } from "react"

interface ModalProps {
    name: string
    children: React.ReactNode
}

export default ({ name, children }: ModalProps) => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <h1 className="block text-gray-700 text-lg font-bold mt-2" onClick={() => setOpen(!open)}>
                {name}
                {open ? (
                    <span className="material-icons align-text-bottom">expand_less</span>
                ) : (
                    <span className="material-icons align-text-bottom">expand_more</span>
                )}
            </h1>
            {open && (
                <div className="border-l-3 pl-3 border-gray-300 mb-2">
                    {children}
                </div>
            )}
        </>
    )
}
import {useState} from "react"
import {ExpandLess, ExpandMore} from "@mui/icons-material";

interface ModalProps {
    name: string
    children: React.ReactNode
}

function Modal({name, children}: ModalProps) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <h1 className="block text-gray-700 text-lg font-bold mt-2"
                onClick={() => setOpen(!open)}>
                {open ? <ExpandLess/> : <ExpandMore/>}
                {name}
            </h1>
            {open && (
                <div>
                    {children}
                </div>
            )}
        </>
    )
}

export default Modal;
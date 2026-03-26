import {CheckCircleOutlined, Clear, PublishOutlined, UploadFileOutlined} from "@mui/icons-material";
import {uploadFile} from "../../sendData.ts";
import React, {useId, useState} from "react";


interface UploadButtonProps {
    name: string,
    uploaded: boolean,
    setDocumentID: (value: string | null) => void
}

export default function UploadButton({name, uploaded, setDocumentID}: UploadButtonProps) {
    const id = useId()
    const [file, setFile] = useState<File | null>(null);

    const set = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (e.target.files[0].type == "text/csv") {
            setFile(e.target.files[0])
            return;
        }
        alert("not a csv file")
        setFile(null)
    }

    const upload = async () => {
        if (!file) return;
        try {
            const id = await uploadFile(file)
            setDocumentID(id)
        } catch (e) {
            alert("Error uploading file")
            console.error(e)
        }
    }

    const clearForecast = () => {
        setFile(null)
        setDocumentID(null)
    }

    let color = "bg-green-200";
    if (!uploaded) {
        color = file ? "bg-green-50" : "bg-gray-50";
    }

    return (
        <div className={"px-2 flex flex-grow border rounded-xl " + color}>
            <label className="flex py-2 flex-grow cursor-pointer" htmlFor={id}>
                {uploaded ? <CheckCircleOutlined/> : <UploadFileOutlined/>}
                <div className="pl-3">
                    {name}
                </div>
            </label>
            <input className="hidden" accept="text/csv" id={id} type={"file"}
                   onChange={set}/>
            {uploaded && <>
            </>}
            {!!file && !uploaded &&
              <button type="button" className="ml-auto pr-3 cursor-pointer" onClick={upload}>
                <PublishOutlined/>
              </button>}
            {uploaded &&
              <div className="ml-auto pr-3 py-2">
                <button type="button" className="cursor-pointer" onClick={clearForecast}><Clear/></button>
              </div>}
        </div>
    )
}

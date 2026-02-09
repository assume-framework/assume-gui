import {CheckCircleOutlined, Clear, PublishOutlined, UploadFileOutlined} from "@mui/icons-material";
import {uploadFile} from "../../sendData.ts";
import React, {useState} from "react";
import type {Forecast} from "../SidebarComponents/UploadSidebar.tsx";


interface UploadButtonProps {
    forecastType: keyof Forecast,
    name: string,
    uploaded: boolean,
    updateForecast: (type: keyof Forecast, value: string | null) => void
}

export default function UploadButton({forecastType, name, uploaded, updateForecast}: UploadButtonProps) {
    const [file, setFile] = useState<File | null>(null);

    const addForecast = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (e.target.files[0].type != "text/csv") {
                alert("not a csv file")
                setFile(null)
                return
            }
            setFile(e.target.files[0])
        }
    }

    const uploadForecast = () => {
        if (!file) return;
        if (!forecastType) return;
        uploadFile(file).then((id) => {
            updateForecast(forecastType, id)
        })
    }

    const clearForecast = () => {
        setFile(null)
        updateForecast(forecastType, null)
    }

    let color = "bg-green-500";
    if (!uploaded) {
        color = file ? "bg-green-50" : "bg-gray-50";
    }

    return (
        <div className={"my-4 px-2 flex border rounded-xl " + color}>
            <label className="flex py-2 flex-grow" htmlFor={forecastType + "input"}>
                {uploaded?<CheckCircleOutlined />:<UploadFileOutlined/>}
                <div className="pl-3">
                    {name}
                </div>
            </label>
            <input className="hidden" accept="text/csv" id={forecastType + "input"} type={"file"}
                   onChange={addForecast}/>
            {uploaded && <>
            </>}
            {!!file && !uploaded &&
              <button className="ml-auto pr-3" onClick={uploadForecast}>
                <PublishOutlined/>
              </button>}
            {uploaded &&
              <div className="ml-auto pr-3 py-2">
                <button onClick={clearForecast}><Clear /></button>
              </div>}
        </div>
    )
}

import {useState} from "react";
import {uploadFile} from "../../sendData";
import {PublishOutlined, UploadFileOutlined} from "@mui/icons-material";

export interface ForecastFile {
    id: string
    type: string
}

export type UploadSidebarProps = {
    updateForecast: (id: string, type: string) => void
}

export default function UploadSidebar({updateForecast}: UploadSidebarProps) {
    const [file, setFile] = useState<File | null>(null);
    const [forecastType, setForecastType] = useState<string | null>(null);
    const addFile = (forecast_type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (e.target.files[0].type != "text/csv") {
                alert("not a csv file")
                setFile(null)
                return
            }
            setForecastType(forecast_type)
            setFile(e.target.files[0])
        }
    }

    const uploadForecast = () => {
        if (!file) return;
        if (!forecastType) return;
        uploadFile(file).then((id) => {
            updateForecast(id, forecastType)
        })
    }
    const types: { [key: string]: string } = {
        "price": "Price",
        "residual_load": "Residual load",
    };

    const buttonStyle = "my-4 px-2 flex border rounded-xl "
    return (
        <>
            <div className="px-8 pt-6 pb-8 mb-4">
                <p>Forecasts</p>
                {
                    Object.keys(types).map((k) => {
                        const file_selected = file && forecastType == k;
                        return (
                            <div className={file_selected?buttonStyle+"bg-green-50":buttonStyle+ "bg-gray-50"}>
                                <label className="flex py-2 flex-grow" htmlFor={k + "input"}>
                                    <UploadFileOutlined/>
                                    <div className="pl-3">
                                        {types[k]}
                                    </div>
                                </label>
                                <input className="hidden" id={k + "input"} type={"file"} onChange={addFile(k)}/>
                                {file_selected &&
                                  <button className="pl-auto pr-3" onClick={uploadForecast}>
                                    <PublishOutlined/>
                                  </button>}
                            </div>
                        );
                    })
                }
            </div>
        </>
    )
}

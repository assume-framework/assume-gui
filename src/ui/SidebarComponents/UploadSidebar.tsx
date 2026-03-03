import UploadButton from "../InputComponents/UploadButton.tsx";


export interface Forecast {
    price: string | null
    residual_load: string | null
}

export type UploadSidebarProps = {
    updateForecast: (type: keyof Forecast, value: string | null,) => void,
    forecast: Forecast
}

export default function UploadSidebar({updateForecast, forecast}: UploadSidebarProps) {
    const setDocumentID = (type: keyof Forecast) => (value: string | null) => {
        updateForecast(type, value)
    }

    return (
        <div className="px-8 pt-6 pb-8 mb-4">
            <p>Forecasts</p>
            <UploadButton
                name={"Price"}
                uploaded={!!forecast.price}
                setDocumentID={setDocumentID("price")}/>
            <UploadButton
                name={"Resiudal load"}
                uploaded={!!forecast.residual_load}
                setDocumentID={setDocumentID("residual_load")}/>
        </div>
    )
}

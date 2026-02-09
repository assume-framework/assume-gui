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
    return (
        <div className="px-8 pt-6 pb-8 mb-4">
            <p>Forecasts</p>
            <UploadButton
                forecastType={"price"}
                name={"Price"}
                uploaded={forecast.price != undefined}
                updateForecast={updateForecast}/>
            <UploadButton
                forecastType={"residual_load"}
                name={"Resiudal load"}
                uploaded={!!forecast["residual_load"]}
                updateForecast={updateForecast}/>
        </div>
    )
}

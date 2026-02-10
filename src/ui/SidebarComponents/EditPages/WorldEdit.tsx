import { handleChange } from "../../../utils";
import Input from "../../InputComponents/Input";
import type { EditComponentArgs } from "../NodeEditSidebar";

export  default function WorldEdit({ id, data, updateNodeValue }: EditComponentArgs) {
    const onChange = handleChange(id, data, updateNodeValue);
    return (
        <>
            <Input label="Start Time" type="datetime-local" value={data.start} onChange={onChange("start")}/>
            <Input label="End Time" type="datetime-local" value={data.end} onChange={onChange("end")} />
            <Input label="Save Frequency (hours)" type="number" value={data.save_frequency_hours} onChange={onChange("save_frequency_hours")} />
            <Input label="Simulation ID" type="text" value={data.simulation_id} onChange={onChange("simulation_id")} />
            <Input label="Frequency" type="text" value={data.frequency} onChange={onChange("frequency")} tooltip="Simulation frequency in h"/>
        </>
    )
}

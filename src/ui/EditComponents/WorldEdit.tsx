import { handleChange } from "../../utils";
import type { EditComponentArgs } from "../NodeEditSidebar";
import { Input } from "./Input";

export default ({ id, data, updateNodeValue }: EditComponentArgs) => {
    const onChange = handleChange(id, data, updateNodeValue);
    return (
        <>
            <Input disabled label="Start Time" id="start" type="text" value={data.start} onChange={onChange("start")} />
            <Input disabled label="End Time" id="end" type="text" value={data.end} onChange={onChange("end")} />
            <Input label="Save Frequency (hours)" id="save_frequency_hours" type="number" value={data.save_frequency_hours} onChange={onChange("save_frequency_hours")} />
            <Input label="Simulation ID" id="simulation_id" type="text" value={data.simulation_id} onChange={onChange("simulation_id")} />
            <Input label="Frequency" id="frequency" type="text" value={data.frequency} onChange={onChange("frequency")} />
        </>
    )
}
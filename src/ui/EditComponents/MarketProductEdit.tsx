import { handleChange } from "../../utils";
import type { EditComponentArgs } from "../NodeEditSidebar";
import { Input } from "./Input";




export default ({ id, data, updateNodeValue }: EditComponentArgs) => {
    const onChange = handleChange(id, data, updateNodeValue);

    return (
        <>
            <Input label="Duration (min)" id="duration" type="number" value={data.duration} onChange={onChange("duration")} />
            <Input label="Count" id="count" type="number" value={data.count} onChange={onChange("count")} />
            <Input label="First Delivery (min)" id="first_delivery" type="number" value={data.first_delivery} onChange={onChange("first_delivery")} />
        </>
    )
}

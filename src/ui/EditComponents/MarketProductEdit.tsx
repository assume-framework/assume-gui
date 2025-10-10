import { handleChange } from "../../utils";
import type { EditComponentArgs } from "../NodeEditSidebar";
import { Input } from "./Input";




export default ({ id, data, updateNodeValue }: EditComponentArgs) => {
    const onChange = handleChange(id, data, updateNodeValue);

    return (
        <>
            <Input disabled label="Duration" id="duration" type="text" value={data.duration} onChange={onChange("duration")} />
            <Input label="Count" id="count" type="number" value={data.count} onChange={onChange("count")} />
            <Input disabled label="First Delivery" id="first_delivery" type="text" value={data.first_delivery} onChange={onChange("first_delivery")} />
        </>
    )
}

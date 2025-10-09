import { handleChange } from "../../utils";
import type { EditComponentArgs } from "../NodeEditSidebar";




export default ({ id, data, updateNodeValue }: EditComponentArgs) => {
    const onChange = handleChange(id, data, updateNodeValue);

    return (
        <>
            <label htmlFor="duration">Duration: </label>
            <input type="text" disabled value={data.duration} onChange={onChange("duration")} />
            <br />
            <label htmlFor="count">Count: </label>
            <input type="number" value={data.count} onChange={onChange("count")} />
            <br />
            <label htmlFor="first_delivery">First Delivery: </label>
            <input type="text" disabled value={data.first_delivery} onChange={onChange("first_delivery")} />
        </>
    )
}

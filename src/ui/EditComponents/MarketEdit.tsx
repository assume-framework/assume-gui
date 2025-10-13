import { handleChange } from "../../utils";
import type { EditComponentArgs } from "../NodeEditSidebar";
import { Input, Select } from "./Input";




export default ({ id, data, updateNodeValue }: EditComponentArgs) => {
    const onChange = handleChange(id, data, updateNodeValue);

    return (
        <>
            <Input disabled label="Opening Hours" id="opening_hours" type="text" value="Every hour" onChange={onChange("opening_hours")} />
            <Input label="Opening Duration (min)" id="opening_duration" type="number" value={data.opening_duration} onChange={onChange("opening_duration")} />
            <Select label="Market Mechanism" id="market_mechanism" value={data.market_mechanism} onChange={onChange("market_mechanism")} >
                <option value="pay_as_clear">Pay as clear</option>
                <option value="pay_as_bid">Pay as bid</option>
                <option value="pay_as_bid_contract">Pay as bid (contract)</option>
                <option value="complex_clearing">Complex clearing</option>
                <option value="pay_as_clear_complex_dmas">Pay as clear complex dmas</option>
            </Select>
        </>
    )
}

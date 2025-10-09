import { handleChange } from "../../utils";
import type { EditComponentArgs } from "../NodeEditSidebar";




export default ({ id, data, updateNodeValue }: EditComponentArgs) => {
    const onChange = handleChange(id, data, updateNodeValue);

    return (
        <>
            <label htmlFor="opening_hours">Opening Hours: </label>
            <input type="text" disabled value={data.opening_hours} onChange={onChange("opening_hours")} />
            <br />
            <label htmlFor="opening_duration">Opening Duration: </label>
            <input type="text" disabled value={data.opening_duration} onChange={onChange("opening_duration")} />
            <br />
            <label htmlFor="market_type">Market Type: </label>
            <select onChange={onChange("market_type")} value={data.market_type}>
                <option value="pay_as_cleared">Pay as cleared</option>
                <option value="pay_as_bid">Pay as bid</option>
                <option value="pay_as_bid_contract">Pay as bid (contract)</option>
                <option value="complex_clearing">Complex clearing</option>
                <option value="pay_as_clear_complex_dmas">Pay as clear complex dmas</option>
            </select>
        </>
    )
}

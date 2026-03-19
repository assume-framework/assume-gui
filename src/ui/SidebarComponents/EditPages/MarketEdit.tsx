import {handleChange} from "../../../utils";
import Input from "../../InputComponents/Input";
import Select from "../../InputComponents/Select";
import type {EditComponentArgs} from "../NodeEditSidebar";

function editMarket({id, data, updateNodeValue, getErrorMessage}: EditComponentArgs) {
    const onChange = handleChange(id, data, updateNodeValue);

    return (
        <>
            <Select
                   label="Opening Hours"
                   errorMessage={getErrorMessage('opening_hours')}
                   value={data.opening_hours}
                   onChange={onChange("opening_hours")}>
                <option value="HOURLY">Every Hour</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
            </Select>
            <Input label="Opening Duration (min)"
                   type="number"
                   value={data.opening_duration} 
                   errorMessage={getErrorMessage('opening_duration')}
                   onChange={onChange("opening_duration")}/>
            <Select label="Market Mechanism"
                    errorMessage={getErrorMessage('market_mechanism')}
                    value={data.market_mechanism}
                    onChange={onChange("market_mechanism")}>
                <option value="pay_as_clear">Pay as clear</option>
                <option value="pay_as_bid">Pay as bid</option>
                <option value="pay_as_bid_contract">Pay as bid (contract)</option>
                <option value="complex_clearing">Complex clearing</option>
                <option value="pay_as_clear_complex_dmas">Pay as clear complex dmas</option>
            </Select>
        </>
    )
}

export default editMarket;

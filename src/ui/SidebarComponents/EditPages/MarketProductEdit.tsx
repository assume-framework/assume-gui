import {handleChange} from "../../../utils";
import type {EditComponentArgs} from "../NodeEditSidebar";
import Input from "../../InputComponents/Input";
import Select from "../../InputComponents/Select.tsx";

function editMarketProduct({id, data, updateNodeValue, getErrorMessage}: EditComponentArgs) {
    const onChange = handleChange(id, data, updateNodeValue);

    return (
        <>
            <Input label="Duration (min)"
                   type="number"
                   value={data.duration}
                   tooltip="The duration of one trading interval"
                   onChange={onChange("duration")}
                   errorMessage={getErrorMessage('duration')}/>
            <Input label="Count"
                   type="number"
                   value={data.count}
                   tooltip="How many of the upcoming trading intervals are cleared in one clearing."
                   onChange={onChange("count")}
                   errorMessage={getErrorMessage('count')}/>
            <Input label="First Delivery (min)"
                   type="number"
                   value={data.first_delivery}
                   tooltip="How much time has to pass between the clearing and the first delivery."
                   onChange={onChange("first_delivery")}
                   errorMessage={getErrorMessage('first_delivery')}/>
            <Input label="Only hours"
                   type="text"
                   value={data.only_hours}
                   tooltip="Configuration for peak and off-peak products. Only available if the duration is more than 1 day."
                   onChange={onChange("only_hours")}
                   errorMessage={getErrorMessage('only_hours')}/>
            <Select label="Eligible Lambda Function"
                    value={data.eligible_lambda_function}
                    tooltip="Filter function to limit the allowed bidders to a given technology or property."
                    onChange={onChange("eligible_lambda_function")}>
                <option selected
                        value="none">None
                </option>
                <option value="only_renewables">Only Renewables</option>
                <option value="only_co2emissionless">Only CO2 Emissionless</option>
                <option value="power_plant_not_negative">Power plant not negative</option>
            </Select>
        </>
    )
}

export default editMarketProduct;

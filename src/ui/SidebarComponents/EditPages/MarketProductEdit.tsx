import { handleChange } from "../../../utils";
import type { EditComponentArgs } from "../NodeEditSidebar";
import Input from "../../InputComponents/Input";
import Select from "../../InputComponents/Select.tsx";

function editMarketProduct ({ id, data, updateNodeValue }: EditComponentArgs) {
    const onChange = handleChange(id, data, updateNodeValue);

    return (
        <>
            <Input label="Duration (min)" id="duration" type="number" value={data.duration} onChange={onChange("duration")} />
            <Input label="Count" id="count" type="number" value={data.count} onChange={onChange("count")} />
            <Input label="First Delivery (min)" id="first_delivery" type="number" value={data.first_delivery} onChange={onChange("first_delivery")} />
            <Input label="Only hours" id="only_hours" type="text" value={data.only_hours} onChange={onChange("only_hours")} />
            <Select label="Eligible Lambda Function" id="eligible_lambda_function" value={data.eligible_lambda_function} onChange={onChange("eligible_lambda_function")}>
                <option selected value="none">None</option>
                <option value="only_renewables">Only Renewables</option>
                <option value="only_co2emissionless">Only CO2 Emissionless</option>
                <option value="power_plant_not_negative">Power plant not negative</option>
            </Select>
        </>
    )
}

export default editMarketProduct;

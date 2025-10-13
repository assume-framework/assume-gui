import { handleChange } from "../../utils";
import type { EditComponentArgs } from "../NodeEditSidebar";
import { Input } from "./Input";

export default ({ id, data, updateNodeValue }: EditComponentArgs) => {
    const onChange = handleChange(id, data, updateNodeValue);
    return (
        <>
            <Input label="Strategy" id="strategy" type="text" value={data.strategy} onChange={onChange("strategy")} />
            <Input label="Strategy Args" id="strategy_args" type="textarea" value={data.strategy_args} onChange={onChange("strategy_args")} />
        </>
    );
}

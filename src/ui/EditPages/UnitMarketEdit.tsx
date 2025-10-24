import { handleChange } from "../../utils";
import Select from "../InputComponents/Select";
import type { EditComponentArgs } from "../NodeEditSidebar";

function UnitMarketEdit ({ id, data, updateNodeValue }: EditComponentArgs) {
    const onChange = handleChange(id, data, updateNodeValue);
    return (
        <>
            <Select label="Strategy" id="strategy" value={data.strategy} onChange={onChange("strategy")}>
                <option value="naive_eom">Naive EOM</option>
                <option value="naive_dam">Naive DAM</option>
                <option value="naive_pos_reserve">Naive Pos Reserve</option>
                <option value="naive_neg_reserve">Naive Neg Reserve</option>
                <option value="naive_exchange">Naive Exchange</option>
                <option value="elastic_demand">Elastic Demand</option>
                <option value="otc_strategy">OTC Strategy</option>
                <option value="flexable_eom">Flexable EOM</option>
                <option value="flexable_eom_block">Flexable EOM Block</option>
                <option value="flexable_eom_linked">Flexable EOM Linked</option>
                <option value="flexable_neg_crm">Flexable Neg CRM</option>
                <option value="flexable_pos_crm">Flexable Pos CRM</option>
                <option value="flexable_eom_storage">Flexable EOM Storage</option>
                <option value="flexable_neg_crm_storage">Flexable Neg CRM Storage</option>
                <option value="flexable_pos_crm_storage">Flexable Pos CRM Storage</option>
                <option value="pos_crm_dsm">Pos CRM DSM</option>
                <option value="neg_crm_dsm">Neg CRM DSM</option>
                <option value="naive_redispatch">Naive Redispatch</option>
                <option value="naive_da_dsm">Naive DA DSM</option>
                <option value="naive_redispatch_dsm">Naive Redispatch DSM</option>
                <option value="manual_strategy">Manual Strategy</option>
                <option value="dmas_powerplant">DMAS Powerplant</option>
                <option value="dmas_storage">DMAS Storage</option>
                <option value="cournot_portfolio">Cournot Portfolio</option>
                <option value="default_portfolio">Default Portfolio</option>
            </Select>
        </>
    );
}

export default UnitMarketEdit;

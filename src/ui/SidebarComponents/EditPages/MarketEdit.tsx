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
                   tooltip="How often the market opens. This models the market schedule."
                   onChange={onChange("opening_hours")}>
                <option value="HOURLY">Every Hour</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
            </Select>
            <Input label="Opening Duration (min)"
                   type="number"
                   value={data.opening_duration}
                   errorMessage={getErrorMessage('opening_duration')}
                   tooltip="How long the market stays open after opening and before clearing the market. In this interval, bids can be sent to the market."
                   onChange={onChange("opening_duration")}/>
            <Select label="Market Mechanism"
                    errorMessage={getErrorMessage('market_mechanism')}
                    value={data.market_mechanism}
                    tooltip="Clearing function used by the market for every clearing - see ASSUME docs for more information."
                    onChange={onChange("market_mechanism")}>
                <option value="pay_as_clear">Pay as clear</option>
                <option value="pay_as_bid">Pay as bid</option>
                <option value="pay_as_bid_contract">Pay as bid (contract)</option>
                <option value="complex_clearing">Complex clearing</option>
                <option value="pay_as_clear_complex_dmas">Pay as clear complex dmas</option>
            </Select>
            <Input label="Product type"
                   type="text"
                   errorMessage={getErrorMessage('product_type')}
                   value={data.product_type ?? 'energy'}
                   onChange={onChange("product_type")}
                   tooltip="Defines the type of product this market clears (ASSUME semantics)."/>
            <Input label="Maximum bid volume"
                   type="number"
                   errorMessage={getErrorMessage('maximum_bid_volume')}
                   value={data.maximum_bid_volume ?? 2000.0}
                   onChange={onChange("maximum_bid_volume")}
                   tooltip="Optional cap for bid volume. Clear the field to set it to `None`."/>
            <Input label="Maximum bid price"
                   type="number"
                   errorMessage={getErrorMessage('maximum_bid_price')}
                   value={data.maximum_bid_price ?? 3000.0}
                   onChange={onChange("maximum_bid_price")}
                   tooltip="Optional cap for bid price. Clear the field to set it to `None`."/>
            <Input label="Minimum bid price"
                   type="number"
                   errorMessage={getErrorMessage('minimum_bid_price')}
                   value={data.minimum_bid_price ?? -500.0}
                   onChange={onChange("minimum_bid_price")}
                   tooltip="Lower bound for bid price."/>
            <Input label="Additional fields (comma-separated)"
                   type="text"
                   errorMessage={getErrorMessage('additional_fields')}
                   value={data.additional_fields}
                   onChange={onChange("additional_fields")}
                   tooltip="Optional list of additional market fields. Comma-separated."/>
            <Input label="Volume unit"
                   type="text"
                   value={data.volume_unit ?? 'MW'}
                   onChange={onChange("volume_unit")}
                   tooltip="Unit used for volume values (e.g. MW). Label only"/>
            <Input label="Volume tick"
                   type="number"
                   value={data.volume_tick ?? ''}
                   onChange={onChange("volume_tick")}
                   tooltip="Optional step size for volume adjustments. Clear to set `None`."/>
            <Input label="Price unit"
                   type="text"
                   value={data.price_unit ?? '€/MWh'}
                   onChange={onChange("price_unit")}
                   tooltip="Unit used for price values (e.g. €/MWh). Label only"/>
            <Input label="Price tick"
                   type="number"
                   value={data.price_tick ?? ''}
                   onChange={onChange("price_tick")}
                   tooltip="Optional step size for price adjustments. Clear to set `None`."/>
        </>
    )
}

export default editMarket;

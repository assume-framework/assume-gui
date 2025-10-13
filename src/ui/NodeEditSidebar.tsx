import { Input } from "./EditComponents/Input";
import MarketEdit from "./EditComponents/MarketEdit";
import MarketProductEdit from "./EditComponents/MarketProductEdit";
import UnitEdit from "./EditComponents/UnitEdit";
import UnitMarketEdit from "./EditComponents/UnitMarketEdit";
import WorldEdit from "./EditComponents/WorldEdit";

export interface EditSidebarData {
    // properties that shall be editable in the sidebar
    name: string;
    [key: string]: string;
}

export type EditComponentArgs = {
    id: string;
    data: EditSidebarData,
    updateNodeValue: (id: string, data: EditSidebarData) => void
}


export type EditSidebarProps = {
    id: string;
    data: EditSidebarData;
    type?: string;
    isEdge?: boolean;
};

type updateFunction = { updateNodeValue: (id: string, data: EditSidebarData) => void; }


export default ({ id, type, data, updateNodeValue }: EditSidebarProps & updateFunction) => {
    // const [internalData, setInternalData] = useState<EditSidebarData>(data);
    const onChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const d = { ...data }
        d[key] = e.target.value
        updateNodeValue(id, d);
    }
    return (
        <aside className="w-full h-full max-w-xs">
            <form className="px-8 pt-6 pb-8 mb-4" id="NodeEditForm" onSubmit={e => e.preventDefault()}>
                <Input label="Name" type="text" id="name" value={data.name} onChange={onChange("name")} />
                {type === "unit" && <UnitEdit id={id} data={data} updateNodeValue={updateNodeValue} />}
                {type === "market" && <MarketEdit id={id} data={data} updateNodeValue={updateNodeValue} />}
                {type === "marketProduct" && <MarketProductEdit id={id} data={data} updateNodeValue={updateNodeValue} />}
                {type === "world" && <WorldEdit id={id} data={data} updateNodeValue={updateNodeValue} />}
                {type === "unit-market" && <UnitMarketEdit id={id} data={data} updateNodeValue={updateNodeValue} />}
            </form>
        </aside>
    )
}

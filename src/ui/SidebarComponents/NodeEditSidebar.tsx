import Input from "../InputComponents/Input";
import MarketEdit from "./EditPages/MarketEdit";
import MarketProductEdit from "./EditPages/MarketProductEdit";
import UnitEdit from "./EditPages/UnitEdit";
import UnitMarketEdit from "./EditPages/UnitMarketEdit";
import WorldEdit from "./EditPages/WorldEdit";

export interface EditSidebarData {
    // properties that shall be editable in the sidebar
    name: string;
    errorField: string;
    errorMessage: string;

    [key: string]: string | number;
}

export type EditComponentArgs = {
    id: string,
    data: EditSidebarData,
    updateNodeValue: (id: string, data: EditSidebarData, isEdge: boolean) => void,
    getErrorMessage: (field: string) => (string | undefined)
}

export type EditSidebarProps = {
    id: string;
    data: EditSidebarData;
    type?: string;
    isEdge?: boolean;
};

type updateFunction = { updateNodeValue: (id: string, data: EditSidebarData, isEdge: boolean) => void; }

export default function EditSidebar({id, type, data, updateNodeValue}: EditSidebarProps & updateFunction) {
    const onChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const d = {...data}
        d[key] = e.target.value
        updateNodeValue(id, d, false);
    }

    const getErrorMessage = (field: string): string | undefined => {
        if (data.errorField && data.errorField == field) {
            return data.errorMessage
        }
        return undefined
    }
    return (
        <form className="px-8 pt-6 pb-8 mb-4"
              id="NodeEditForm"
              onSubmit={e => e.preventDefault()}>
            <Input label="Name"
                   type="text"
                   value={data.name}
                   onChange={onChange("name")}
                   errorMessage={getErrorMessage("name")}
                   tooltip="Hier könnten Ihre Tooltips stehen!"/>
            {type === "unit" &&
              <UnitEdit
                id={id}
                data={data}
                getErrorMessage={getErrorMessage}
                updateNodeValue={updateNodeValue}/>}
            {type === "market" &&
              <MarketEdit
                id={id}
                data={data}
                getErrorMessage={getErrorMessage}
                updateNodeValue={updateNodeValue}/>}
            {type === "marketProduct" &&
              <MarketProductEdit
                id={id}
                data={data}
                getErrorMessage={getErrorMessage}
                updateNodeValue={updateNodeValue}/>}
            {type === "world" &&
              <WorldEdit
                id={id}
                data={data}
                getErrorMessage={getErrorMessage}
                updateNodeValue={updateNodeValue}/>}
            {type === "unit-market" &&
              <UnitMarketEdit
                id={id}
                data={data}
                getErrorMessage={getErrorMessage}
                updateNodeValue={updateNodeValue}/>}
        </form>
    )
}

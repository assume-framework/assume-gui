import UnitEdit from "./EditComponents/UnitEdit";

export interface EditSidebarData {
    // properties that shall be editable in the sidebar
    name: string;
    [key: string]: string;
}


export type EditSidebarProps = {
    data: EditSidebarData;
    type: string;
    updateNodeValue: (data: EditSidebarData) => void;
};



export default ({ type, data, updateNodeValue }: EditSidebarProps) => {

    return (
        <aside>
            <h1>Edit Sidebar</h1>
            <input type="text" value={data.name} onChange={e => updateNodeValue({...data, name: e.target.value })} />
            {type === "unit" && <UnitEdit updateNodeValue={updateNodeValue} />}
        </aside>
    )
}

import UnitEdit from "./EditComponents/UnitEdit";

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
        <aside>
            <h1>Edit Sidebar</h1>
            <form onSubmit={e => { e.preventDefault(); updateNodeValue(id, data); }}>
                <label htmlFor="name">Name: </label>
                <input type="text" value={data.name} onChange={onChange("name")} />
                <br />
                {type === "unit" && <UnitEdit id={id} data={data} updateNodeValue={updateNodeValue} />}
                <br />
                <button type="submit">Save</button>
            </form>
        </aside>
    )
}

import type {EditSidebarData} from "./ui/SidebarComponents/NodeEditSidebar.tsx";

export function handleChange(id: string, data: EditSidebarData, updateNodeValue: (id: string, data: EditSidebarData, isEdge: boolean) => void, isEdge: boolean = false) {
    return (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const d = { ...data }
        d[key] = e.target.value
        updateNodeValue(id, d, isEdge);
    }
}

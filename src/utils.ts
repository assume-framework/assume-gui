export function handleChange(id: string, data: any, updateNodeValue: (id: string, data: any) => void) {
    return (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const d = { ...data }
        d[key] = e.target.value
        updateNodeValue(id, d);
    }
}


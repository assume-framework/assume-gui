import type {EditSidebarData} from "./ui/SidebarComponents/NodeEditSidebar.tsx";

/** Parse world `datetime-local` strings as local wall time. */
export function parseWorldDatetimeLocal(value: unknown): Date | null {
    if (typeof value !== 'string') return null;
    const s = value.trim();
    if (!s) return null;
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (dateOnly) {
        const d = new Date(
            Number(dateOnly[1]),
            Number(dateOnly[2]) - 1,
            Number(dateOnly[3]),
            0,
            0,
            0,
            0
        );
        return Number.isNaN(d.getTime()) ? null : d;
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{1,2}):(\d{2})/.exec(s);
    if (!m) return null;
    const d = new Date(
        Number(m[1]),
        Number(m[2]) - 1,
        Number(m[3]),
        Number(m[4]),
        Number(m[5]),
        0,
        0
    );
    return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * `/grafana` proxy URL with `from` / `to` as UTC ISO strings (Grafana-style), from world start/end.
 * Falls back to `/grafana` if either value is missing or invalid.
 */
export function buildGrafanaResultsHref(start: unknown, end: unknown): string {
    const fromDate = parseWorldDatetimeLocal(start);
    const toDate = parseWorldDatetimeLocal(end);
    if (!fromDate || !toDate) return '/grafana';
    const params = new URLSearchParams({
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
    });
    return `/grafana/?${params.toString()}`;
}

export function handleChange(id: string, data: EditSidebarData, updateNodeValue: (id: string, data: EditSidebarData, isEdge: boolean) => void, isEdge: boolean = false) {
    return (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const d = { ...data }
        d[key] = e.target.value
        updateNodeValue(id, d, isEdge);
    }
}

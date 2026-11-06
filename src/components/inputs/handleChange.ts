import type { ConfigData } from '../../scenario/types';

export function handleChange(
  id: string,
  data: ConfigData,
  updateNodeValue: (id: string, data: ConfigData, isEdge: boolean) => void,
  isEdge: boolean = false
) {
  return (key: string) => (value: string) => {
    const d = { ...data };
    d[key] = value;
    updateNodeValue(id, d, isEdge);
  };
}

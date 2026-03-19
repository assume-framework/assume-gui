import {
    FileDownloadOutlined,
    FileUploadOutlined,
    ReplayOutlined,
    SaveOutlined,
    SendOutlined
} from '@mui/icons-material';
import {type ComponentType, type MouseEventHandler} from "react";

type Args = {
    reset: () => void,
    setFlowByJson: (data: string) => void,
    submit?: () => void,
    submitDisabled?: boolean,
    save?: () => void,
    download?: () => void
}

export default function Cockpit({reset, setFlowByJson, submit, submitDisabled, save, download}: Args) {
    const handleFileUpload = (e: React.InputEvent<HTMLInputElement>) => {
        const inputElement = e.target as HTMLInputElement
        if (!inputElement.files || inputElement.files.length == 0) {
            console.warn("No input provided!")
            return;
        }

        const reader: FileReader = new FileReader();
        reader.readAsText(inputElement.files[0], `UTF-8`);
        reader.onload = (event) => {
            const data = event.target?.result
            setFlowByJson(data as string)
        }
    }

    return <>
        <CockpitElement name={"Submit"}
                        Icon={SendOutlined}
                        disabled={submitDisabled}
                        onClick={submit}/>
        <CockpitElement name={"Save"}
                        Icon={SaveOutlined}
                        onClick={save}/>
        <CockpitElement name={"Reset"}
                        Icon={ReplayOutlined}
                        onClick={reset}/>
        <CockpitElement name={"Download"}
                        onClick={download}
                        Icon={FileDownloadOutlined}/>
        <label htmlFor="file_upload" className={"cursor-pointer"}>
            <CockpitElement name={"Upload"} Icon={FileUploadOutlined}/>
        </label>
        <input
            id="file_upload"
            type="file"
            accept=".json"
            className="hidden"
            onInput={handleFileUpload}
        />
    </>
}

interface ElementArgs {
    name: string,
    onClick?: MouseEventHandler<HTMLDivElement>,
    disabled?: boolean,
    Icon: ComponentType
}

function CockpitElement({onClick, name, Icon, disabled = false}: ElementArgs) {
    return (
        <div
            className={`bg-white border rounded w-full my-2 py-1 px-3 flex ${
                disabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-neutral-100 active:bg-neutral-300"
            }`}
            onClick={disabled ? undefined : onClick}
        >
            <Icon/>
            <div className="px-3">{name}</div>
        </div>
    )
}

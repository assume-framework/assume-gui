import {CircularProgress} from '@mui/material';
import {useEffect, useMemo, useRef, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ChatRole = 'user' | 'assistant' | 'system';
type ChatMessage = { role: ChatRole; content: string };
type OpenAIModel = { id: string };

const OPENAI_MODEL_KEY = 'openai_model';
/** Build-time default; must use the `VITE_` prefix so Vite exposes it to the client. */
const GLOBAL_OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL?.trim() ?? '';
const HAS_GLOBAL_OPENAI_MODEL = GLOBAL_OPENAI_MODEL.length > 0;

export default function DiscussSimulationChat({
    open,
    worldJson,
    onClose,
}: {
    open: boolean;
    worldJson: string;
    onClose: () => void;
}) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content:
                'Ask questions about your simulation. I will use the current world JSON as context.',
        },
    ]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string>('');
    const [models, setModels] = useState<OpenAIModel[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>(
        HAS_GLOBAL_OPENAI_MODEL ? GLOBAL_OPENAI_MODEL : localStorage.getItem(OPENAI_MODEL_KEY) ?? '',
    );
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const endRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const history = useMemo(() => messages.filter((m) => m.role !== 'system'), [messages]);

    useEffect(() => {
        if (!isAtBottom) return;
        endRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages, isSending, isAtBottom]);

    const onScroll = () => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        // When we're very close to the bottom, keep auto-scrolling.
        setIsAtBottom(distanceFromBottom < 24);
    };

    const fetchModels = async () => {
        setIsLoadingModels(true);
        setError('');
        try {
            const resp = await fetch(`/openai/v1/models`);
            if (!resp.ok) {
                throw new Error(`Request failed (${resp.status})`);
            }
            const body = (await resp.json()) as { data?: OpenAIModel[] };
            const loadedModels = body.data ?? [];
            setModels(loadedModels);

            if (!selectedModel && loadedModels.length > 0) {
                const model = loadedModels[0].id;
                setSelectedModel(model);
                localStorage.setItem(OPENAI_MODEL_KEY, model);
            }
        } catch (e) {
            console.error(e);
            setError('Could not load OpenAI models. Check the API proxy and credentials.');
        } finally {
            setIsLoadingModels(false);
        }
    };

    useEffect(() => {
        if (!HAS_GLOBAL_OPENAI_MODEL) {
            fetchModels();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const send = async () => {
        const trimmed = input.trim();
        if (!trimmed || isSending) return;
        if (!selectedModel) {
            setError('Please select an OpenAI model first.');
            return;
        }

        setError('');
        setIsSending(true);

        const userMessage: ChatMessage = {role: 'user', content: trimmed};
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setMessages((prev) => [...prev, {role: 'assistant', content: ''}]);

        const messagesPayload = [
            {
                role: 'system',
                content: [
                    'You are a helpful assistant that helps the user with simulating energy markets using the ASSUME-GUI.',
                    'The simulation has a market operator, which can have multiple markets. And Unit operators - which manage multiple units.',
                    'The market design is configurable. If there are multiple markets, help the user structure the order of the markets.',
                    'Use the following world JSON as authoritative context.',
                    'Remember that the user does not know about the JSON and sees the graph visualized instead. Do not quote position fields or JSON; they are irrelevant.',
                    '',
                    'WORLD_JSON:',
                    worldJson,
                ].join('\n'),
            },
            ...history,
            {role: 'user', content: trimmed},
        ];
        try {
            const resp = await fetch(`/openai/v1/chat/completions`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    model: selectedModel,
                    messages: messagesPayload,
                    stream: true,
                }),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(text || `Request failed (${resp.status})`);
            }

            if (!resp.body) {
                throw new Error('Missing response body stream.');
            }

            const body = await resp.text()
            const response = JSON.parse(body) as {
                choices: Array<{ message?: { content?: string } }>;
            };

            const reply = response?.choices[0].message?.content;
            if (!reply) {
                throw new Error('Missing response body content.');
            }
            setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = {role: 'assistant', content: reply};
                return next;
            });
        } catch (e) {
            console.error(e);
            setMessages((prev) => prev.slice(0, -1));
            setError('Failed to connect to OpenAI. Check the proxy and API credentials.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div
            className={`fixed right-4 top-16 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[60vh] max-h-[calc(100vh-4rem)] bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col overflow-hidden select-text ${
                open ? '' : 'hidden'
            }`}
            aria-hidden={!open}
        >
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="font-bold">Discuss Simulation</div>
                <button
                    type="button"
                    className="px-2 py-1 rounded hover:bg-gray-100"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>

            <div className="p-3 border-b border-gray-200 space-y-2">
                <div className="flex gap-2">
                    {!HAS_GLOBAL_OPENAI_MODEL && (
                        <button
                            type="button"
                            className="px-2 py-1 rounded border text-xs hover:bg-gray-50"
                            onClick={fetchModels}
                            disabled={isLoadingModels || isSending}
                        >
                            {isLoadingModels ? 'Loading...' : 'Refresh Models'}
                        </button>
                    )}
                </div>
                {!HAS_GLOBAL_OPENAI_MODEL && (
                    <select
                        value={selectedModel}
                        onChange={(e) => {
                            setSelectedModel(e.target.value);
                            localStorage.setItem(OPENAI_MODEL_KEY, e.target.value);
                        }}
                        className="w-full border rounded px-2 py-1 text-xs"
                        disabled={isLoadingModels || isSending}
                    >
                        <option value=""
                                disabled>
                            -- select model --
                        </option>
                        {models.map((m) => (
                            <option key={m.id}
                                    value={m.id}>{m.id}</option>
                        ))}
                    </select>
                )}
                {HAS_GLOBAL_OPENAI_MODEL && (
                    <div className="text-xs text-gray-600">
                        Using model: <span className="font-semibold">{GLOBAL_OPENAI_MODEL}</span>
                    </div>
                )}
            </div>

            <div
                className="flex-1 overflow-y-auto p-3 space-y-2"
                ref={scrollContainerRef}
                onScroll={onScroll}
            >
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={`rounded-md px-3 py-2 border ${
                            m.role === 'user'
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-gray-200 bg-gray-50'
                        }`}
                    >
                        <div className="text-xs font-bold text-gray-600 mb-1">{m.role}</div>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code(props: { inline?: boolean; children?: React.ReactNode; className?: string }) {
                                    const {inline, children, className} = props;
                                    if (inline) {
                                        return (
                                            <code
                                                className={`bg-gray-100 rounded px-1 py-0.5 ${className ?? ''}`}
                                            >
                                                {children}
                                            </code>
                                        );
                                    }
                                    return (
                                        <pre className="bg-gray-900 text-gray-100 rounded-sm p-1 overflow-x-auto">
                                            <code className={className ?? ''}>
                                                {children}
                                            </code>
                                        </pre>
                                    );
                                }
                            }}
                        >
                            {m.content}
                        </ReactMarkdown>
                    </div>
                ))}
                {isSending && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CircularProgress
                            size={16}
                            thickness={5}
                            color="success"/>
                        Waiting for OpenAI...
                    </div>
                )}
                {error && (
                    <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-2">
                        {error}
                    </div>
                )}
                <div ref={endRef}/>
            </div>

            <div className="p-3 border-t border-gray-200 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isSending) send();
                    }}
                    placeholder="Ask about the simulation..."
                    className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <button
                    type="button"
                    onClick={send}
                    disabled={isSending}
                    className={`px-3 py-2 rounded text-sm font-bold ${
                        isSending ? 'bg-gray-200 text-gray-500' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

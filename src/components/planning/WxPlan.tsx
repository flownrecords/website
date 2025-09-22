import { useState } from "react";
import api, { ENDPOINTS } from "../../lib/api";
import Button from "../general/Button";
import { Loader, Search } from "lucide-react";

export default function WxPlan({ updatePlan }: { updatePlan: (val: any) => void }) {
    const [query, setQuery] = useState("");
    const [tafOptions, setTafOptions] = useState<string[]>([]);
    const [selectedTaf, setSelectedTaf] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function fetchTAF(code: string) {
        setLoading(true);
        try {
            const res = await api.get(ENDPOINTS.WX.AD, { params: { icao: code } });
                if (res.meta.status !== 200) {
                setTafOptions([]);
                setSelectedTaf("Not found");
                return;
            }

            const tafs = [res.rawTaf];

            if (!tafs.length || tafs.length === 0) {
                setTafOptions([]);
                setSelectedTaf("Not found");
                return;
            }

            setTafOptions(tafs);
            setSelectedTaf(null);
        } catch (err) {
            setTafOptions([]);
            setSelectedTaf(null);
            updatePlan((prev: any) => ({ ...prev, weather: code }));
        } finally {
            setLoading(false);
        }
    }

    function handleSelectTaf(taf: string) {
        setSelectedTaf(taf);
        updatePlan((prev: any) => ({ ...prev, weather: taf }));
        setTafOptions([]);
    }

    return (
        <div className="relative grid grid-cols-4 gap-4">
            <input
                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 col-span-3"
                type="text"
                maxLength={1536}
                placeholder="Search for TAF by ICAO code or enter manually"
                value={query}
                onChange={(e) => {
                    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9 ]/g, "");
                    val = val.replace(/\s{2,}/g, " ");
                    val = val.trimStart();

                    setQuery(val);
                    updatePlan((prev: any) => ({ ...prev, weather: val }));
                    setTafOptions([]); // reset dropdown
                    setSelectedTaf(null);
                }}
                onKeyDown={(e) => {
                if (e.key === "Enter" && query.length === 4) {
                    fetchTAF(query);
                }
                }}
            />
            <Button
                text={
                    loading ? <>
                        <Loader className="animate-spin h-4 w-4 inline-block md:mr-2" strokeWidth={2} />
                        <span className="hidden md:inline-block">Loading...</span>
                    </> : <>
                        <Search className="h-4 w-4 inline-block md:mr-2" strokeWidth={2} />
                        <span className="hidden md:inline-block">Fetch TAF</span>
                    </>
                }
                onClick={() => {
                    if (query.length === 4) fetchTAF(query);
                }}
                disabled={loading || query.length !== 4}
            />

            {tafOptions.length > 0 && (
                <div className="bg-secondary ring-2 ring-white/25 rounded-lg col-span-4 p-2">
                    <h1 className="text-sm text-white/75 mb-1">
                        Select a TAF ({tafOptions.length} option{tafOptions.length > 1 ? "s" : ""})
                    </h1>
                    {tafOptions.map((taf, idx) => (
                        <div
                            key={idx}
                            className={`px-4 py-2 bg-primary hover:opacity-75 transition-all duration-300 cursor-pointer rounded-lg ${idx !== tafOptions.length - 1 ? "mb-2" : ""}`}
                            onClick={() => handleSelectTaf(taf)}
                        >
                        {taf}
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 text-white/75 col-span-4">
                { selectedTaf ? selectedTaf : query ? query : "No weather information" }
            </div>
        </div>
    );
}
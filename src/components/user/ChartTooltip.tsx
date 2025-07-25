import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { parseTime } from "./ChartCarousel";

export const ChartTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="bg-secondary text-white text-sm p-2 rounded shadow text-shadow-white">
            <p className="font-semibold mb-1">{label}</p>
            {payload.map((entry, index) => (
                <div key={index} className="flex justify-between gap-2">
                    <span style={{ color: entry.color }}>{entry.name}:</span>
                    <span>
                        {/* @ts-ignore */}
                        {entry?.name?.includes("Time")
                            ? parseTime(entry.value as any)
                            : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

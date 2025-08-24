import { useEffect, useState } from "react";

export function captalize(str?: string | null) {
    if (!str) return undefined;
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
}

export function applyUTC(dateLocalValue: string): Date {
    const [datePart, timePart] = dateLocalValue.split("T");

    if (!datePart || !timePart) throw new Error("Invalid datetime format");

    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // Constructs a UTC date based on the exact input
    return new Date(Date.UTC(year, month - 1, day, hour, minute));
}

export function timeDifference(start: Date, end: Date): number {
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / 3600000; // 1000 ms * 60 s * 60 min
    return diffHours;
}

export function parseDuration(time?: string | number | null) {
    if (!time) return "0:00";
    const total = typeof time === "string" ? parseFloat(time) : time;
    if (isNaN(total)) return "0:00";
    if (total < 0) return "0:00";
    if (total === 0) return "0:00";
    if (total < 1) {
        const minutes = Math.round(total * 60);
        return `0:${minutes < 10 ? "0" + minutes : minutes}`;
    }

    const hours = Math.floor(total);
    const minutes = Math.round((total % 1) * 60);
    return `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
}

export function parseDate(date?: string | Date | null, cut = false) {
    return new Date(date as any)
        .toLocaleDateString("en-GB", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
        })
        .slice(0, cut ? 5 : undefined);
}

export function truncateString(str: string, maxLength: number): string {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
}

export function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);

    return isMobile;
}

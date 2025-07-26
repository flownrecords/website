export default function Skeleton(props: {
    type: "p" | "h1" | "h3" | "button" | "span",
    className?: string
}) {
    const { type, className = "" } = props;

    const baseClass = "bg-secondary rounded animate-pulse";
    
    if (type === "span") {
        return (
            <span className={`${baseClass} inline-block h-4 align-middle ${className}`} style={{ width: '6ch' }} />
        );
    }

    return (
        <div className="space-y-4">
            {type === "h1" && <div className={`h-6 ${baseClass} w-1/2 ${className}`} />}
            {type === "h3" && <div className={`h-4 ${baseClass} w-1/3 ${className}`} />}
            {type === "p" && (
                <div className="space-y-2">
                    <div className={`h-4 ${baseClass} w-full ${className}`} />
                    <div className={`h-4 ${baseClass} w-11/12 ${className}`} />
                    <div className={`h-4 ${baseClass} w-10/12 ${className}`} />
                </div>
            )}
            {type === "button" && (
                <div className={`h-8 ${baseClass} w-24 mt-4 ${className}`} />
            )}
        </div>
    );
}

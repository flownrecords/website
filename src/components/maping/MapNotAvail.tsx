type ComponentProps = {
    dimensions?: {
        width?: string;
        height?: string;
    };
};

export default function MapNotAvailable({ dimensions }: ComponentProps) {
    return (
        <div
            className="w-full overflow-hidden relative flex items-center justify-center"
            style={{ height: dimensions?.height ?? "400px" }}
        >
            <h1 className="font-bold text-3xl text-white/15">Map not available</h1>
        </div>
    );
}

import { Polyline } from "react-leaflet";

const colors = {
    accent: "#313ED8",
    base: "#666666",
};

export default function RecordingPlot({ recording }: { recording: any; }) {
    const coords: [number, number][] = recording.coords.map((coord: any) => [
        coord.latitude,
        coord.longitude
    ]);

    return (
        <div className="recording-plot">
            {coords.length > 1 && (
                <Polyline
                    positions={coords}
                    pathOptions={{ color: colors.accent, weight: 1.5 }}
                />
            )}
        </div>
    );
}
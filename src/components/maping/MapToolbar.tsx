import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import ReactDOM from "react-dom/client";
import { Maximize, Minus, Plus } from "lucide-react";

export function MapToolbar() {
    const map = useMap();

    const style = `w-8 h-8 
    bg-gradient-to-t from-neutral-900 to-neutral-800 hover:opacity-75 transition duration-150
    ring-2 ring-white/25 rounded-lg 
    cursor-pointer 
    flex items-center justify-center`;

    useEffect(() => {
        const controlDiv = L.DomUtil.create("div");

        const customControl = new L.Control({ position: "topleft" });
        customControl.onAdd = () => controlDiv;
        customControl.addTo(map);

        const root = ReactDOM.createRoot(controlDiv);

        root.render(
            <div className="space-y-2 flex flex-col items-center justify-center ">
                <button title="Zoom In" onClick={() => map.zoomIn()} className={style}>
                    <Plus className="w-4 h-4" />
                </button>
                <button title="Zoom Out" onClick={() => map.zoomOut()} className={style}>
                    <Minus className="w-4 h-4" />
                </button>
                <button
                    title="Fullscreen"
                    onClick={() => {
                        const container = map.getContainer();

                        if (!document.fullscreenElement) {
                            container.requestFullscreen?.();
                        } else {
                            document.exitFullscreen?.();
                        }
                    }}
                    className={style}
                >
                    <Maximize className="w-4 h-4" />
                </button>
            </div>,
        );

        return () => {
            root.unmount();
            map.removeControl(customControl);
        };
    }, [map]);

    return null;
}

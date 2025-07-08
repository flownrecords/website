import { CircleMarker, Popup } from "react-leaflet";
import type { Aerodrome, User, Waypoint } from "../../lib/types";

export const WaypointsLayer = (

    { 
        options: { 
            
        },
        navdata,
        user
    }: 

    { 
        options: {
            
        }
        navdata: Waypoint[] 
        user: User
    }

) => {

    const colors = {
        accent: "#313ED8",
        base: "#666666",
    };
    
    return (
        <>
            { navdata.map((wpt) => {
               
                return (
                    <>
                    { wpt.coords?.lat && wpt.coords?.long ? (
                        <CircleMarker
                        key={wpt.id}
                        center={[ wpt.coords.lat, wpt.coords.long ]}
                        radius={1}
                        fillColor={colors.base}
                        fillOpacity={0.25}
                        weight={0}
                        stroke={false}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <strong>{wpt.id}</strong>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ) : null }
                    </>
                );
            })}
        </>
    );
}
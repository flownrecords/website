import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/AuthContext";
import Splash from "../../components/general/Splash";
import { captalize } from "../../lib/utils";
import api, { ENDPOINTS } from "../../lib/api";
import type { FIR } from "../../lib/types";

export default function Reports() {
    const { user}  = useAuth();
    const URL = import.meta.env.VITE_API_URL;

    const [aerodromes, updateAerodromes] = useState<any[]>([]);

    useEffect(() => {
        api.get(ENDPOINTS.NAVDATA.AD).then((res) => {
            const ads = res.flatMap((i: FIR) => i.ad);
            updateAerodromes(ads);
            console.log(ads)
        });
    }, []);

    function totalFlightTime() {
        if (!user?.logbookEntries || user.logbookEntries.length === 0) {
            return "0h00";
        }

        const total = user.logbookEntries
            .map((entry) => {
                if (!entry.includeInFt) return 0;
                return Number(
                    typeof entry.total === "number" && entry.total > 0
                        ? entry.total
                        : entry.simTime,
                );
            })
            .reduce((acc, entry) => acc + entry, 0);

        const hours = Math.floor(total);
        const minutes = Math.round((total % 1) * 60);
        return `${hours}h${minutes < 10 ? "0" + minutes : minutes}`;
    }

    function mostVisitedAirport() {
        if (!user?.logbookEntries || user.logbookEntries.length === 0) {
            return "None";
        }

        return user?.logbookEntries
            .map((entry: any) => entry.depAd)
            .reduce((acc: any, icao: string) => {
                acc[icao] = (acc[icao] || 0) + 1;
                return acc;
            }, {})
            ? Object.entries(
                  user?.logbookEntries
                      .map((entry: any) => entry.arrAd)
                      .reduce((acc: any, icao: string) => {
                          acc[icao] = (acc[icao] || 0) + 1;
                          return acc;
                      }, {}),
              ).reduce((a: any, b: any) => (a[1] > b[1] ? a : b))[0]
            : "None";
    }

    const mostVisitedAd = aerodromes.find((ad) => ad.icao === mostVisitedAirport())?.name || mostVisitedAirport() || "None";

    function mostFlownAcft() {
        if (!user?.logbookEntries || user.logbookEntries.length === 0) {
            return "None";
        }
        const aircraftCount = user.logbookEntries.reduce((acc: any, entry: any) => {
            acc[entry.aircraftRegistration] = (acc[entry.aircraftRegistration] || 0) + 1;
            return acc;
        }, {});

        const mostFlownAcft = Object.keys(aircraftCount).reduce((a, b) =>
            aircraftCount[a] > aircraftCount[b] ? a : b,
        );

        return mostFlownAcft || "None";
    }

    return <>
        <Splash
            uppertext={
                <>
                    {user ? (
                        `${captalize(user?.firstName) ?? `@${user?.username}`}'s`
                    ) : (
                        <span className="h-8 w-0.5 inline-block"></span>
                    )}
                </>
            }
            title="Reports"
        />

        <div className="container mx-auto max-w-6xl p-4 xl:px-0">
            <div className="grid grid-cols-4 gap-4">
                <div className="ring-2 ring-white/25 rounded-lg overflow-hidden">
                    <img src={URL + `/report?hours=${totalFlightTime()}&flights=${user?.logbookEntries.length}&aircraft=${mostFlownAcft()}&airport=${mostVisitedAd}`} className=""/>
                </div>

            </div>
        </div>
    </>;
}
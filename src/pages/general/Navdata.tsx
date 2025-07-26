import axios from "axios";
import { useEffect, useState } from "react";
import Splash from "../../components/general/Splash";
import type { Aerodrome, FIR, Navaid, Waypoint } from "../../lib/types";
import { Antenna, ChevronDown, TowerControl, Triangle } from "lucide-react";
import Footer from "../../components/general/Footer";

type FIRWarning = { fir: string; error: number; navId?: string };
// 1: No coordinates, 2: Duplicate ID

export default function Data() {
    const API = import.meta.env.VITE_API_URL;

    const [data, setData] = useState<FIR[]>([]);
    const [selectedFIRs, setSelectedFIRs] = useState<number[]>([]);
    const [dropdownStates, setDropdownStates] = useState<Record<number, boolean>>({});

    const [firWarnings, setFirWarnings] = useState<FIRWarning[]>([]);

    useEffect(() => {
        axios
            .get(API + "/navdata")
            .then((response) => {
                setData(response.data);
                console.log("Data fetched successfully:", response.data);

                // Warn when a fir has duplicated waypoints, navaids or aerodromes or if one of them doesnt have a coordinate attributed
                const warnings: FIRWarning[] = [];

                response.data.forEach((fir: FIR) => {
                    const waypointIds = new Set();
                    const navaidIds = new Set();
                    const aerodromeIds = new Set();

                    // Check waypoints
                    fir.waypoints.vfr?.forEach((wp: Waypoint) => {
                        if (!wp.coords || !wp.id) {
                            warnings.push({ fir: fir.fir, error: 1, navId: wp.id || undefined });
                        } else if (waypointIds.has(wp.id)) {
                            warnings.push({ fir: fir.fir, error: 2, navId: wp.id });
                        } else {
                            waypointIds.add(wp.id);
                        }
                    });

                    fir.waypoints.ifr?.forEach((wp: Waypoint) => {
                        if (!wp.coords || !wp.id) {
                            warnings.push({ fir: fir.fir, error: 1, navId: wp.id || undefined });
                        } else if (waypointIds.has(wp.id)) {
                            warnings.push({ fir: fir.fir, error: 2, navId: wp.id });
                        } else {
                            waypointIds.add(wp.id);
                        }
                    });

                    // Check navaids
                    fir.navaid?.forEach((navaid: Navaid) => {
                        if (!navaid.coords || !navaid.icao) {
                            warnings.push({
                                fir: fir.fir,
                                error: 1,
                                navId: navaid.icao || undefined,
                            });
                        } else if (navaidIds.has(navaid.icao)) {
                            warnings.push({ fir: fir.fir, error: 2, navId: navaid.icao });
                        } else {
                            navaidIds.add(navaid.icao);
                        }
                    });

                    // Check aerodromes
                    fir.ad?.forEach((ad: Aerodrome) => {
                        if (!ad.coords || !ad.icao) {
                            warnings.push({ fir: fir.fir, error: 1, navId: ad.icao || undefined });
                        } else if (aerodromeIds.has(ad.icao)) {
                            warnings.push({ fir: fir.fir, error: 2, navId: ad.icao });
                        } else {
                            aerodromeIds.add(ad.icao);
                        }
                    });

                    setFirWarnings(warnings);
                });
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, []);

    function truncateStr(str?: string, length?: number) {
        if (!str) return "";
        if (!length || str.length <= length) return str;
        return str.substring(0, length) + "...";
    }

    return (
        <>
            <Splash uppertext="Available" title="Navdata" />
            <div className="container mx-auto max-w-6x p-4 lg:px-0">
                <div className="p-4 rounded-lg ring-2 ring-white/25 grid lg:grid-cols-4 gap-2">
                    {data?.map((fir, i) => {
                        return (
                            <div
                                key={i}
                                className={`bg-secondary rounded-lg p-2 cursor-pointer hover:opacity-75 transition-all duration-300 ${selectedFIRs.includes(i) || selectedFIRs.length === 0 ? "opacity-100" : "opacity-50"}`}
                                onClick={() => {
                                    if (selectedFIRs.includes(i)) {
                                        setSelectedFIRs(selectedFIRs.filter((id) => id !== i));
                                    } else {
                                        setSelectedFIRs([...selectedFIRs, i]);
                                    }
                                }}
                            >
                                <h3 className="font-semibold">
                                    {fir.fir} - {fir.info.name}
                                </h3>
                                <div className="text-sm text-white/50 flex gap-1">
                                    <span>{fir.ad?.length} Aerodromes</span>{" "}
                                    <span>
                                        {(fir.waypoints?.vfr?.length || 0) +
                                            (fir.waypoints?.ifr?.length || 0)}{" "}
                                        Waypoints
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {selectedFIRs.length > 0 && (
                    <div className="mt-4 p-4 rounded-lg ring-2 ring-white/25">
                        <h3 className="font-semibold mb-2">{`${selectedFIRs.length} Selected FIRs`}</h3>

                        <div className="grid gap-4">
                            {selectedFIRs.length > 0
                                ? selectedFIRs.map((id) => {
                                      return (
                                          <div key={id} className="p-4 bg-secondary rounded-lg">
                                              <div className="flex justify-between items-center">
                                                  <h4 className="font-semibold">
                                                      {data[id].fir} - {data[id].info.name}
                                                  </h4>
                                                  <button
                                                      onClick={() => {
                                                          setDropdownStates((prev) => ({
                                                              ...prev,
                                                              [id]: !prev[id],
                                                          }));
                                                      }}
                                                      className="cursor-pointer hover:opacity-75 transition-all duration-150"
                                                  >
                                                      <ChevronDown
                                                          className={`transform transition-transform duration-500 ${
                                                              dropdownStates[id]
                                                                  ? "rotate-180"
                                                                  : "rotate-0"
                                                          }`}
                                                      />
                                                  </button>
                                              </div>
                                              <div
                                                  className={`mt-2 ${dropdownStates[id] ? "block" : "hidden"}`}
                                              >
                                                  <p className="text-sm text-white/50">
                                                      {data[id].info.country} -{" "}
                                                      {data[id].info.region}
                                                  </p>

                                                  {firWarnings.filter((w) => w.fir === data[id].fir)
                                                      .length > 0 && (
                                                      <div className="mt-2 bg-amber-500/25 p-2 rounded-lg">
                                                          {firWarnings.filter(
                                                              (w) =>
                                                                  w.fir === data[id].fir &&
                                                                  w.error === 2,
                                                          ).length > 0 && (
                                                              <div className="text-sm text-yellow-500">
                                                                  Warning: Duplicate waypoints,
                                                                  navaids or aerodromes found in
                                                                  this FIR. <br />
                                                                  <p className="mt-2">
                                                                      {firWarnings
                                                                          .filter(
                                                                              (w) =>
                                                                                  w.fir ===
                                                                                      data[id]
                                                                                          .fir &&
                                                                                  w.error === 2,
                                                                          )
                                                                          .map((w) => w.navId)
                                                                          .join(", ")}
                                                                  </p>
                                                              </div>
                                                          )}
                                                          {firWarnings.filter(
                                                              (w) =>
                                                                  w.fir === data[id].fir &&
                                                                  w.error === 1,
                                                          ).length > 0 && (
                                                              <div className="text-sm text-yellow-500 mt-2">
                                                                  Warning: No position coordinates
                                                                  were attributed to the following:{" "}
                                                                  <br />
                                                                  <p className="mt-2">
                                                                      {firWarnings
                                                                          .filter(
                                                                              (w) =>
                                                                                  w.fir ===
                                                                                      data[id]
                                                                                          .fir &&
                                                                                  w.error === 1,
                                                                          )
                                                                          .map((w) => w.navId)
                                                                          .join(", ")}
                                                                  </p>
                                                              </div>
                                                          )}
                                                      </div>
                                                  )}

                                                  <div className="mt-4">
                                                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                          <TowerControl
                                                              strokeWidth={1.25}
                                                              className="inline-block h-6 w-6 opacity-50"
                                                          />{" "}
                                                          Aerodromes
                                                      </h3>
                                                      <div className="grid grid-cols-1 lg:grid-cols-4 text-sm gap-2">
                                                          {data[id].ad?.map((ad) => (
                                                              <div
                                                                  key={ad.icao}
                                                                  className="bg-primary rounded-lg p-2"
                                                              >
                                                                  <span>{ad.icao}</span>{" "}
                                                                  <span className="text-white/75">
                                                                      {truncateStr(ad.name, 20)}
                                                                  </span>
                                                              </div>
                                                          )) || (
                                                              <span>No aerodromes available</span>
                                                          )}
                                                      </div>
                                                  </div>

                                                  <div className="mt-4">
                                                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                          <Antenna
                                                              strokeWidth={1.25}
                                                              className="inline-block h-6 w-6 opacity-50"
                                                          />{" "}
                                                          Navaids
                                                      </h3>
                                                      <div className="grid grid-cols-1 lg:grid-cols-4 text-sm gap-2">
                                                          {data[id].navaid?.map((navaid) => (
                                                              <div
                                                                  key={navaid.icao}
                                                                  className="bg-primary rounded-lg p-2"
                                                              >
                                                                  <span>{navaid.icao}</span>{" "}
                                                                  <span className="text-white/75">
                                                                      {truncateStr(navaid.name, 20)}
                                                                  </span>
                                                              </div>
                                                          )) || <span>No navaids available</span>}
                                                      </div>
                                                  </div>

                                                  <div className="mt-4">
                                                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                          <Triangle
                                                              strokeWidth={1.25}
                                                              className="inline-block h-6 w-6 opacity-50"
                                                          />{" "}
                                                          Waypoints
                                                      </h3>
                                                      <div className="grid grid-cols-1 lg:grid-cols-4 text-sm gap-2">
                                                          {[
                                                              ...(data[id].waypoints?.vfr || []),
                                                              ...(data[id].waypoints?.ifr || []),
                                                          ]
                                                              .sort((a, b) =>
                                                                  a.id.localeCompare(b.id),
                                                              )
                                                              .map((wp) => (
                                                                  <div
                                                                      key={wp.id}
                                                                      className="bg-primary rounded-lg p-2"
                                                                  >
                                                                      <span>{wp.id}</span>{" "}
                                                                      <span className="text-white/75">
                                                                          {truncateStr(wp.name, 20)}
                                                                      </span>
                                                                      <div>
                                                                          <span className="text-white/25">
                                                                              (
                                                                              {wp.coords.lat.toFixed(
                                                                                  2,
                                                                              )}
                                                                              ,{" "}
                                                                              {wp.coords.long.toFixed(
                                                                                  2,
                                                                              )}
                                                                              )
                                                                          </span>
                                                                      </div>
                                                                  </div>
                                                              ))}
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })
                                : null}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}

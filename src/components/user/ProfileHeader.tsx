import { AtSign, Globe, GlobeLock, MapPin } from "lucide-react";
import type { User } from "../../lib/types";
import { Link } from "react-router-dom";
import Skeleton from "../general/Skeleton";
import { roles } from "../../lib/roles";

import Icon from "../../assets/images/icon.png";

export default function ProfileHeader(props: { user: User | null }) {
    const { user } = props;

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

    return (
        <>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 ring-2 ring-white/25 rounded-lg">
                <div className="flex flex-row items-center space-x-4 lg:col-span-3 ">
                    <div className="rounded-full ring-2 ring-white/25">
                        {user ? (
                            <img
                                className="h-18 w-18 md:h-28 md:w-28 rounded-full object-cover"
                                draggable="false"
                                src={user?.profilePictureUrl ?? Icon}
                                alt="User profile icon"
                            />
                        ) : (
                            <img
                                className="h-18 w-18 md:h-28 md:w-28 rounded-full object-cover animate-[pulse_2s_cubic-bezier(0.01,0.02,0.01,0.02)_infinite]"
                                draggable="false"
                                src={Icon}
                                alt="User profile icon"
                            />
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold capitalize">
                            {user ? (
                                (user?.firstName
                                    ? `${user?.firstName} ${user?.lastName}`
                                    : `@${user?.username}`
                                ).substring(0, 20)
                            ) : (
                                <Skeleton type="h1" />
                            )}
                        </h1>
                        <div>
                            {user ? (
                                <div className="font-semibold text-lg">
                                    {user?.organizationRole && (
                                        <span className="text-white/50">
                                            {roles.find(
                                                (role) => role.id === user?.organizationRole,
                                            )?.label || user?.organizationRole}
                                        </span>
                                    )}

                                    {user?.organizationId && user?.organizationRole && (
                                        <span className="text-white/25 px-2"> @ </span>
                                    )}

                                    {user?.organizationId && (
                                        <Link
                                            to={`/org/${user.organizationId}`}
                                            className="text-white/50 capitalize"
                                        >
                                            {user?.organization?.name ?? user?.organizationId}
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <Skeleton type="span" />
                            )}
                        </div>

                        <div className="mt-1 space-x-2 space-y-2 md:block hidden">
                            <span className="text-sm text-white/75 ring-white/25 ring-2 rounded-md px-4 py-0.5 inline-block">
                                <AtSign className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/15 opacity-50" />
                                {user ? user?.username : <Skeleton type="span" />}
                            </span>
                            <span className="text-sm text-white/75 ring-white/25 ring-2 rounded-md px-4 py-0.5 inline-block">
                                <MapPin className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/10 opacity-50" />
                                {user ? user?.location?.substring(0, 24) : <Skeleton type="span" />}
                            </span>
                            <span className="text-sm text-white/75 ring-white/25 ring-2 rounded-md px-4 py-0.5 hidden lg:inline-block relative">
                                {user?.publicProfile || !user ? (
                                    <Globe className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/10 opacity-50" />
                                ) : (
                                    <GlobeLock className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/10 opacity-50" />
                                )}

                                {user ? (
                                    user?.publicProfile ? (
                                        "Public"
                                    ) : (
                                        "Private"
                                    )
                                ) : (
                                    <Skeleton type="span" />
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="md:hidden flex items-center space-x-2">
                    <span className="ring-2 ring-white/25 rounded-md px-2 py-0.5 inline-flex items-center text-sm min-w-0">
                        <AtSign className="h-4 w-4 mr-1 opacity-25 shrink-0" />
                        <span className="text-white/75 truncate">
                            {user ? user.username : <Skeleton type="span" className="my-0.5" />}
                        </span>
                    </span>
                    <span className="ring-2 ring-white/25 rounded-md px-2 py-0.5 inline-flex items-center text-sm min-w-0">
                        {!user || (user.location || "").length > 0 ? (
                            <MapPin className="h-4 w-4 mr-1 opacity-25 shrink-0" />
                        ) : null}
                        {user ? (
                            user &&
                            user.location &&
                            user.location.length > 0 && (
                                <span className="text-white/75 truncate">
                                    {user.location.split(",")[0]}
                                </span>
                            )
                        ) : (
                            <Skeleton type="span" className="my-0.5" />
                        )}
                    </span>
                    <span className="ring-2 ring-white/25 rounded-md px-2 py-0.5 inline-flex items-center text-sm">
                        {!user || user.publicProfile ? (
                            <Globe className="h-4 w-4 inline-block my-0.5 opacity-25" />
                        ) : (
                            <GlobeLock className="h-4 w-4 inline-block my-0.5 opacity-25" />
                        )}
                    </span>
                </div>

                <div className="lg:ml-2 lg:pl-4 text-md ">
                    <div className="space-y-1 p-4 bg-secondary rounded-lg ring-2 ring-white/25">
                        <div className="flex justify-between">
                            <span className="text-white/50">Flight Time</span>
                            <span className="text-white/75 font-semibold">{totalFlightTime()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50">Flown</span>
                            <span className="text-white/75 font-semibold">
                                {`${user?.logbookEntries?.length || 0} flights`}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50">Most flown aircraft</span>
                            <span className="text-white/75 font-semibold">{mostFlownAcft()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50">Most visited airport</span>
                            <span className="text-white/75 font-semibold">
                                {mostVisitedAirport()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

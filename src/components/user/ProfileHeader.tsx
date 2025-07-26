import { AtSign, Globe, GlobeLock, MapPin } from "lucide-react";
import type { User } from "../../lib/types"
import { Link } from "react-router-dom";
import Skeleton from "../general/Skeleton";

const roles = [
        { id: "GUEST", label: "Guest" },
        { id: "STUDENT", label: "Student Pilot" },
        { id: "PILOT", label: "Pilot" },
        { id: "CFI", label: "Chief Flight Instructor" },
        { id: "CTKI", label: "Chief Theoretical Knowledge Instructor" },
        { id: "SM", label: "Safety Manager" },
        { id: "OPS", label: "Operations" },
        { id: "FI", label: "Flight Instructor" },
        { id: "TKI", label: "Theoretical Knowledge Instructor" },
        { id: "MAIN", label: "Maintenance" },
        { id: "OFFICE", label: "Office" },
        { id: "SUPERVISOR", label: "Supervisor" },
        { id: "ADMIN", label: "Administrator" },
        { id: "MANAGER", label: "Manager" },
        { id: "OTHER", label: "Other" },
    ];

export default function ProfileHeader(
    props: {
        user: User | null
    }
) {
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
    };

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
    };

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
    };

    return (
        <>
            <div className="px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-4 ring-2 ring-white/25 rounded-lg">
                <div className="flex flex-row items-center space-x-4 lg:col-span-3">
                    <img
                        className="h-18 w-18 md:h-28 md:w-28 rounded-full ring-2 ring-white/25 object-cover"
                        draggable="false" 
                        src={
                            user?.profilePictureUrl ??
                            `https://placehold.co/512/09090B/313ED8?font=roboto&text=${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`
                        }
                        alt="User profile icon"
                    />

                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold capitalize">
                            { user ? (user?.firstName
                                ? `${user?.firstName} ${user?.lastName}`
                                : `@${user?.username}`
                            ).substring(0, 20) : <Skeleton type="h1"/>}
                        </h1>
                        <div>
                            {
                                user ? (
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
                                ) : <Skeleton type="span" />
                            }
                        </div>

                        <div className="mt-1 space-x-2 space-y-2 md:block hidden">
                            <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block">
                                <AtSign className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/15 opacity-50" />
                                {user ? user?.username : <Skeleton type="span" />}
                            </span>
                            <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block">
                                <MapPin className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/10 opacity-50" />
                                { user ? user?.location?.substring(0, 24) : <Skeleton type="span" /> }
                            </span>
                            <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 hidden lg:inline-block relative">
                                {user?.publicProfile ? (
                                    <Globe className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/10 opacity-50" />
                                ) : (
                                    <GlobeLock className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/10 opacity-50" />
                                )}

                                {user?.publicProfile ? "Public" : "Private"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-x-2 space-y-2 block md:hidden">
                    <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block">
                        @{user?.username}
                    </span>
                    { user?.location && (
                        <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block">
                            {user?.location?.substring(0, 24)}
                        </span>
                    ) }
                    { !user?.location && (
                        <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block">
                            {user?.publicProfile ? "Public" : "Private"}
                        </span>
                    ) }
                </div>
                
                <div className="lg:ml-2 lg:pl-4 space-y-1 text-md">
                    <div className="flex justify-between">
                        <span className="text-white/50">Flight Time</span>
                        <span className="text-white/75 font-semibold">
                            { totalFlightTime() }
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/50">Flown</span>
                        <span className="text-white/75 font-semibold">
                            {`${user?.logbookEntries?.length || 0} flights`}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/50">Most flown aircraft</span>
                        <span className="text-white/75 font-semibold">
                            { mostFlownAcft() }
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/50">Most visited airport</span>
                        <span className="text-white/75 font-semibold">
                            { mostVisitedAirport() }
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}
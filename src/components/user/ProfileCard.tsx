import { AtSign, Globe, GlobeLock, MapPin } from "lucide-react";
import Skeleton from "../general/Skeleton";
import type { Organization } from "../../lib/types";
import { roles } from "../../lib/roles";

type ProfileCardData = {
    profilePictureUrl?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    location?: string | null;
    publicProfile?: boolean | null;
    bio?: string | null;

    organizationId?: string | null;
    organizationRole?: string | null;
    organization?:
        | Organization
        | {
              id?: string;
              name?: string;
              logo?: string;
          }
        | null;
};

export default function ProfileCard(props: {
    data: ProfileCardData;
    organizations?: { id: string; name: string }[];
}) {
    const { data } = props;

    return (
        <>
            <div className="bg-secondary rounded-lg p-4 min-w-[300px]">
                <div className="flex flex-row items-center space-x-4">
                    <img
                        className="h-9 w-9 md:h-14 md:w-14 rounded-full ring-2 ring-white/25 object-cover"
                        draggable="false"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        src={
                            data?.profilePictureUrl ??
                            `https://placehold.co/512/09090B/313ED8?font=roboto&text=${data?.firstName?.charAt(0) || ""}${data?.lastName?.charAt(0) || ""}`
                        }
                        alt="User profile icon"
                    />
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold capitalize">
                            {data?.firstName || data.lastName || data.username ? (
                                (data?.firstName
                                    ? `${data?.firstName} ${data?.lastName ?? ""}`
                                    : `@${data?.username}`
                                ).substring(0, 20)
                            ) : (
                                <Skeleton type="h1" />
                            )}
                        </h1>
                        <div className="font-medium text-base">
                            {data.organizationId || data.organizationRole ? (
                                <div className="font-medium text-base">
                                    {data?.organizationRole && (
                                        <span className="text-white/50">
                                            {roles.find(
                                                (role) => role.id === data?.organizationRole,
                                            )?.label || data?.organizationRole}
                                        </span>
                                    )}

                                    {data?.organizationId &&
                                        data.organizationId !== "none" &&
                                        data?.organizationRole && (
                                            <span className="text-white/25 px-2"> @ </span>
                                        )}

                                    {data?.organizationId && data.organizationId !== "none" && (
                                        <span className="text-white/50 capitalize">
                                            {data?.organization?.name ?? data?.organizationId}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <Skeleton type="span" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-x-2 space-y-2 block">
                    <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-2 py-0.5 inline-block">
                        <AtSign className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/15 opacity-50" />
                        {data.username ? data?.username : <Skeleton type="span" />}
                    </span>
                    {data?.location && (
                        <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-2 py-0.5 inline-block">
                            <MapPin className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/10 opacity-50" />
                            {data.location.substring(0, 24)}
                        </span>
                    )}
                    <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-2 py-0.5 hidden lg:inline-block relative">
                        {data.publicProfile ? (
                            <Globe className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/10 opacity-50" />
                        ) : (
                            <GlobeLock className="h-4 w-4 inline-block mr-1 top-1/2 transform -translate-y-1/10 opacity-50" />
                        )}

                        {data.publicProfile ? "Public" : "Private"}
                    </span>
                </div>

                <div className="mt-2 bg-primary text-sm p-2 rounded-lg">
                    <label className="inline-block font-medium mb-1">Biography</label>
                    <div className="text-white/75 break-words whitespace-pre-wrap">
                        {data?.bio || "This user has not set a biography yet."}
                    </div>
                </div>
            </div>
        </>
    );
}

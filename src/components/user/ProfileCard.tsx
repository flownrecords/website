import { AtSign, Globe, GlobeLock, MapPin } from "lucide-react";
import Skeleton from "../general/Skeleton";
import type { Organization } from "../../lib/types";
import { roles } from "../../lib/roles";

import Icon from "../../assets/images/icon.png";
import { useEffect, useState } from "react";
import api, { ENDPOINTS } from "../../lib/api";

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

    hide?: {
        bio?: boolean;
        visibility?: boolean;
    };
};

export default function ProfileCard(props: {
    data: ProfileCardData;
    organizations?: { id: string; name: string }[];
}) {
    const { data } = props;

    const [organizations, setOrganizations] = (
        useState<{ id: string; name: string }[]>(props.organizations ?? [])
    );

    useEffect(() => {
        api.get(ENDPOINTS.ORGS.LIST)
            .then((res) => {
                if (Array.isArray(res)) {
                    setOrganizations(res);
                }
            })
            .catch(() => { });
    }, []);

    return (
        <>
            <div className="bg-secondary rounded-lg p-4 min-w-[350px]">
                <div className="flex flex-row items-center space-x-4">
                    {data.profilePictureUrl ? (
                        <img
                            className="h-9 w-9 md:h-14 md:w-14 rounded-full ring-2 ring-white/25 object-cover"
                            draggable="false"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            src={data.profilePictureUrl}
                            alt="User profile icon"
                        />
                    ) : (
                        <img
                            className="h-9 w-9 md:h-14 md:w-14 rounded-full ring-2 ring-white/25 object-cover animate-[pulse_2s_cubic-bezier(0.01,0.02,0.01,0.02)_infinite]"
                            draggable="false"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            src={Icon}
                            alt="User profile icon"
                        />
                    )}
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold capitalize">
                            {data?.firstName || data.lastName || data.username ? (
                                (data?.firstName
                                    ? `${data?.firstName} ${data?.lastName ?? ""}`
                                    : `@${data?.username}`
                                ).substring(0, 20)
                            ) : (
                                <Skeleton type="span" />
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
                                            {data?.organization?.name ?? organizations.find((o) => o.id === data?.organizationId)?.name ?? data?.organizationId}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <Skeleton type="span" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                    <span className="ring-2 ring-white/25 rounded-md px-2 py-0.5 inline-flex items-center text-sm min-w-0">
                        <AtSign className="h-4 w-4 mr-1 opacity-25 shrink-0" />
                        <span className="text-white/75 truncate">
                            {data.username ? (
                                data.username
                            ) : (
                                <Skeleton type="span" className="my-0.5" color="secondary" />
                            )}
                        </span>
                    </span>
                    
                    { data &&
                        data.location &&
                        data.location.length > 0 && (
                            <span className="ring-2 ring-white/25 rounded-md px-2 py-0.5 inline-flex items-center text-sm min-w-0">
                                <MapPin className="h-4 w-4 opacity-25 shrink-0" />
                                <span className="text-white/75 truncate ml-1">
                                    {data.location.split(",")[0]}
                                </span>
                            </span>
                        ) }
                    <span className="ring-2 ring-white/25 rounded-md px-2 py-0.5 inline-flex items-center text-sm">
                        {!data || data.publicProfile ? (
                            <Globe className="h-4 w-4 inline-block my-0.5 opacity-25" />
                        ) : (
                            <GlobeLock className="h-4 w-4 inline-block my-0.5 opacity-25" />
                        )}
                        {data ? (
                            <span className="">
                                {data ? (
                                    <span className="ml-1 hidden md:inline text-white/75">
                                        {data?.publicProfile ? "Public" : "Private"}
                                    </span>
                                ) : (
                                    <Skeleton type="span" />
                                )}
                            </span>
                        ) : null}
                    </span>
                </div>

                {!data.hide?.bio && (
                    <div className="mt-2 bg-primary text-sm p-2 rounded-lg">
                        <label className="inline-block font-medium mb-1">Biography</label>
                        <div className="text-white/75 break-words whitespace-pre-wrap">
                            {data?.bio || "This user has not set a biography yet."}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

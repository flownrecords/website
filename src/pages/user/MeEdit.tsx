import { useEffect, useState } from "react";
import Splash from "../../components/general/Splash";
import Button from "../../components/general/Button";
import ProfileCard from "../../components/user/ProfileCard";
import { useNavigate } from "react-router-dom";
import useAlert from "../../components/alert/useAlert";
import { roles } from "../../lib/roles";
import { Save, Undo2 } from "lucide-react";

import api, { ENDPOINTS } from "../../lib/api";
import type { User } from "../../lib/types";

type Organization = {
    id: string;
    name: string;
    logo?: string;
};

export default function MeEdit() {
    const navigate = useNavigate();
    const alert = useAlert();

    const [user, setUser] = useState<User>(null);

    const [name, setName] = useState(user?.firstName ?? "");
    const [location, setLocation] = useState(user?.location ?? "");
    const [bio, setBio] = useState(user?.bio ?? "");
    const [homeAirport, setHomeAirport] = useState(user?.homeAirport ?? "");
    const [organizationId, setOrganizationId] = useState(user?.organization?.id ?? "none");
    const [organizationRole, setOrganizationRole] = useState(user?.organizationRole ?? "");
    const [visibility, setVisibility] = useState(user?.publicProfile);
    const [base64Image, setBase64Image] = useState<string | null>(null);

    const [organizations, setOrganizations] = useState<Organization[]>([
        { id: "none", name: "None" },
    ]);

    function handleSave() {
        api.post(
            ENDPOINTS.USER.ME,
            {
                firstName: name.split(" ")[0],
                lastName:
                    name.split(" ").length > 1 ? name.split(" ")[name.split(" ").length - 1] : "",
                location,
                bio,
                publicProfile: visibility,
                organizationId: organizationId === "none" ? null : organizationId,
                organizationRole,
                profilePictureUrl: base64Image,
                homeAirport,
            },
            {
                requireAuth: true,
                navigate,
            },
        )
            .then((res) => {
                if (res.meta.status === 200) {
                    alert("Success", "Profile updated successfully!");
                    setUser(res.data as User);
                    navigate("/me");
                } else {
                    alert("Error", "Failed to update profile. Please try again.");
                }
            })
            .catch((e) => console.error("Error updating user data:", e));
        return false; // Prevent default form submission
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            alert("Error", "File too big! Max 4MB.");
            //@ts-ignore
            e.target.value = null; // reset input
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setBase64Image(reader.result as string);
        };
        reader.readAsDataURL(file);
    }

    useEffect(() => {
        api.get(ENDPOINTS.ORGS.LIST).then((res) => {
            setOrganizations([{ id: "none", name: "None" }, ...res]);
        });

        api.get(ENDPOINTS.USER.ME, {
            requireAuth: true,
            navigate,
        })
            .then((res) => {
                setUser(res as User);

                setOrganizationId(res?.organizationId ?? "none");
                setOrganizationRole(res?.organizationRole ?? "");
                setName(`${res.firstName ?? ""} ${res.lastName ?? ""}`.trim());
                setLocation(res.location ?? "");
                setBio(res.bio ?? "");
                setVisibility(res.publicProfile ?? true);
                setBase64Image(res.profilePictureUrl ?? null);
                setHomeAirport(res.homeAirport ?? "");
            })
            .catch((e) => console.error("Error fetching user data:", e));
    }, []);

    return (
        <>
            <Splash uppertext="" title="Edit Profile" />
            <div className="container mx-auto max-w-6xl p-4 xl:px-0">
                <div className="rounded-lg ring-2 ring-white/25 p-4">
                    <form
                        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                        autoComplete="off"
                        spellCheck="false"
                        autoCorrect="off"
                        autoCapitalize="off"
                        onSubmit={handleSave}
                    >
                        <div className="order-1">
                            <label className="inline-block text-sm text-white/75 mb-1">name</label>
                            <input
                                autoComplete="new-name"
                                onChange={(e) => setName(e.target.value)}
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                                type="text"
                                defaultValue={name}
                                required
                            />
                        </div>

                        <div className="order-2">
                            <label className="inline-block text-sm text-white/75 mb-1">
                                location
                            </label>
                            <input
                                autoComplete="new-location"
                                onChange={(e) => setLocation(e.target.value)}
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                                type="text"
                                defaultValue={location ?? ""}
                                required
                            />
                        </div>

                        <div className="order-4">
                            <label className="inline-block text-sm text-white/75 mb-1">
                                organization
                            </label>
                            <select
                                value={organizationId}
                                onChange={(e) => setOrganizationId(e.target.value)}
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                                required
                            >
                                {organizations.map((org) => (
                                    <option key={org.id} value={org.id}>
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="order-5">
                            <label className="inline-block text-sm text-white/75 mb-1">role</label>
                            <select
                                value={organizationRole}
                                onChange={(e) => setOrganizationRole(e.target.value)}
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                                required
                            >
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="order-6 col-span-1 lg:col-span-2">
                            <label className="inline-block text-sm text-white/75 mb-1">
                                biography
                            </label>
                            <input
                                autoComplete="new-bio"
                                onChange={(e) => setBio(e.target.value)}
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                                type="text"
                                defaultValue={user?.bio ?? ""}
                                required
                                maxLength={96}
                            />
                        </div>

                        <div className="order-7">
                            <label className="inline-block text-sm text-white/75 mb-1">
                                profile visibility
                            </label>
                            <select
                                value={visibility ? "true" : "false"}
                                onChange={(e) => setVisibility(e.target.value === "true")}
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                                required
                            >
                                <option value="true">Public</option>
                                <option value="false">Private</option>
                            </select>
                        </div>

                        <div className="order-8">
                            <label className="inline-block text-sm text-white/75 mb-1">
                                profile picture
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full text-white"
                            />
                        </div>

                        <div className="order-9">
                            <label className="inline-block text-sm text-white/75 mb-1">
                                home airport (icao)
                            </label>
                            <input
                                autoComplete="new-home-airport"
                                onChange={(e) => {
                                    e.target.value = e.target.value.toUpperCase();
                                    setHomeAirport(e.target.value);
                                }}
                                className="bg-secondary ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full"
                                type="text"
                                defaultValue={user?.homeAirport ?? ""}
                                required
                                minLength={4}
                                maxLength={4}
                            />
                        </div>

                        <div className="mt-6 row-span-4 order-0 lg:order-3">
                            <ProfileCard
                                data={{
                                    firstName: name.split(" ")[0],
                                    lastName:
                                        name.split(" ").length > 1 &&
                                        name.split(" ")[name.split(" ").length - 1]
                                            ? name.split(" ")[name.split(" ").length - 1]
                                            : undefined,
                                    username: user?.username,
                                    location,
                                    publicProfile: visibility,
                                    profilePictureUrl: base64Image,
                                    bio,
                                    organizationId,
                                    organizationRole,
                                    organization: organizations.find(
                                        (org) => org.id === organizationId,
                                    ) || { id: "none", name: "None" },
                                }}
                                organizations={organizations}
                            />
                        </div>
                    </form>
                </div>

                <div className="mt-4 rounded-lg ring-2 ring-white/25 p-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button
                            text={
                                <>
                                    <Undo2 className="h-4 w-4 inline-block" strokeWidth={2} />
                                    <span className="ml-2">Go Back</span>
                                </>
                            }
                            to="/me"
                        />
                        <Button
                            text={
                                <>
                                    <Save className="h-4 w-4 inline-block" strokeWidth={2} />
                                    <span className="ml-2">Save Changes</span>
                                </>
                            }
                            onClick={handleSave}
                        />
                    </div>
                    <div></div>
                </div>
            </div>
        </>
    );
}

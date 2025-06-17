import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/general/Button";

import type { User } from "../../lib/types";
import LogbookChartsCarousel from "../../components/user/ChartsCarousel";
import Map from "../../components/user/FlownRoutesMap";

export default function Me() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(null);
  const [localWeather, setLocalWeather] = useState<{
    metar?: string,
    taf?: string,
  }>({});

  useEffect(() => {
    if(!localStorage.getItem("accessToken")) {
      navigate("/login");
    }

    axios.get('http://localhost:7700/users/me', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    })
    .then(response => {
      if(response.status === 200) {
        fetchLocalWeather(response.data?.homeAirport)
        return setUser(response.data);
      }
    })
    .catch(error => {
      console.error("Error fetching user data:", error);
      if(error.response?.status === 401) {
        console.log("Unauthorized access, redirecting to login.");
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    });

    
  }, []);

  const fetchLocalWeather = async (homeAirport?: string) => {
    if(!homeAirport) return;

    const response = (await axios.get('http://localhost:7700/gen/wx/' + homeAirport)).data
    setLocalWeather({
      metar: response.data.rawOb,
      taf: response.data.rawTaf,
    });
    return response;
  }

  const totalFlightTime = () => {
		if (!user?.logbookEntries || user.logbookEntries.length === 0) {
			return "-";
		}

		const total = user.logbookEntries
		.map((entry: any) => entry.includeInFt ? Number(entry.total) : 0)
		.reduce((acc: number, entry: any) => acc + entry, 0);

		const hours = total.toFixed(0);
		const minutes = Math.round((total % 1) * 60);
		return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
	};

  const mostVisitedAirport = () => {
		if(!user?.logbookEntries || user.logbookEntries.length === 0) {
			return "-";
		}

		return user?.logbookEntries
		.map((entry: any) => entry.depAd)
		.reduce(
			(acc: any, icao: string) => {
				acc[icao] = (acc[icao] || 0) + 1;
				return acc;
			},
			{}
		)
		? Object.entries(
			user?.logbookEntries
				.map((entry: any) => entry.arrAd)
				.reduce(
					(acc: any, icao: string) => {
						acc[icao] = (acc[icao] || 0) + 1;
						return acc;
					},
					{}
				)
		).reduce((a: any, b: any) => (a[1] > b[1] ? a : b))[0]
		: "-"
	}

  const mostFlownAcft = () => {
		if (!user?.logbookEntries || user.logbookEntries.length === 0) {
			return "-";
		}
		const aircraftCount = user.logbookEntries.reduce((acc: any, entry: any) => {
			acc[entry.aircraftRegistration] = (acc[entry.aircraftRegistration] || 0) + 1;
			return acc;
		}, {});

		const mostFlownAcft = Object.keys(aircraftCount).reduce((a, b) =>
			aircraftCount[a] > aircraftCount[b] ? a : b,
		);

		return mostFlownAcft || "-";
	};

  return (
    
  
    <div className="container mx-auto max-w-6xl p-4">
      
      <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 ring-2 ring-white/25 rounded-lg">
        <div className="flex flex-row items-center space-x-4 lg:col-span-3">

          <img className="h-18 w-18 md:h-28 md:w-28 rounded-full ring-2 ring-white/25" draggable="false" src={user?.profilePictureUrl ?? 'https://placehold.co/512x512'} alt="" />

          <div>
            <h1 className="text-3xl md:text-4xl font-bold capitalize">
              { (user?.firstName ?? `@${user?.username}`)?.substring(0,9) }
            </h1>
            <div>
              <div className="font-semibold text-lg">
                { user?.organizationRole && 
                  <span className="text-white/75">
                    { user.organizationRole }
                  </span>
                }

                { (user?.organizationId && user?.organizationRole) && <span className="text-white/25 px-2"> @ </span> }

                { user?.organizationId && 
                  <Link to={`/org/${user.organizationId}`} className="text-white/75 transtion-all duration-150 hover:text-white/50 capitalize">
                    { user?.organizationId }
                  </Link>
                }
              </div>
            </div>

            <div className="mt-1 space-x-2 space-y-2 md:block hidden">
              <span
                className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block"
              >
                @{ user?.username }
              </span>
              {user?.location && 
                <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block">
                  { user?.location?.substring(0, 24) }
                </span>
              }
              <span
                className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 hidden lg:inline-block"
              >
                { user?.publicProfile  ? 'Public' : 'Private' }
              </span>
            </div>
          </div>
        </div>

        <div className="space-x-2 space-y-2 block md:hidden">
          <span
            className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block"
          >
            @{ user?.username }
          </span>
          {user?.location && 
            <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block">
              { user?.location?.substring(0, 24) }
            </span>
          }
          {!user?.location && <span
            className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block"
          >
            { user?.publicProfile  ? 'Public' : 'Private' }
          </span>}
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
              { `${user?.logbookEntries?.length || 0} flights` }
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

      <div className="mt-4 ring-2 ring-white/25 rounded-lg p-4 block lg:hidden">
          <div className="flex flex-col space-y-4">
            <Button text="Edit Profile" to="/me/edit"/>
            <Button text="Logbook" to="/me/logbook"/>
            <Button text="Share" onClick={() => {}} type="button"/>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
        <div className="col-span-1 lg:col-span-3">
          <div className="ring-2 ring-white/25 rounded-lg w-full overflow-hidden">

            <Map/>
            
          </div>
        </div>

        <div className="col-span-1 ring-2 ring-white/25 rounded-lg p-4 hidden lg:block">
          <div className="flex flex-col space-y-4">
            <Button text="Edit Profile" to="/me/edit"/>
            <Button text="Logbook" to="/me/logbook"/>
            <Button text="Share" onClick={() => {}} type="button"/>
          </div>
        </div>

        <div className="col-span-3 ring-2 ring-white/25 rounded-lg p-4">
          <Link to="/me/logbook" className="inline-flex items-center hover:opacity-50 transition-all duration-150">
            <h1
						className="font-semibold text-white/75 "
						>
							Logbook
						</h1>

						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6 text-white/50 ml-2"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7m0-14l7 7-7 7"
							/>
						</svg>
          </Link>

          <div className="mt-2">
            <div className="grid grid-cols-4 text-sm text-white/50 pb-2">
              <span>Flight</span>
              <span>Aircraft</span>
              <span className="hidden md:inline-block">Type</span>
              <span>Date</span>
            </div>
            <div className="overflow-y-scroll custom-scrollbar h-[300px] pr-2">
              {
                user?.logbookEntries.map((entry, index) => (
                  <Link to={`/me/logbook/${entry.id}`} 
                  key={index} 
                  className={
                    `${index % 2 === 0 ? 'bg-gradient-to-br to-neutral-900 from-neutral-800' : ''}

                    grid grid-cols-4 hover:opacity-75 transition-all duration-150 rounded-lg py-2 pl-2`}>
                    <span className="text-sm text-white/50">{ entry.rmks?.split('/')[1] }</span>
                    <span className="text-sm text-white/50">{ entry.aircraftRegistration || "-" }</span>
                    <span className="text-sm text-white/50 hidden md:inline-block">{ entry.aircraftType || "-" }</span>
                    <span className="text-sm text-white/50">{
                      new Date(entry.date as any).toLocaleDateString("en-GB", {
                        month: "numeric",
                        day: "numeric",
                        year: "numeric",
                        })
							      }
                    </span>
                  </Link>
                )) 
              }
            </div>
          </div>
        </div>

        <div className="col-span-1 ring-2 ring-white/25 rounded-lg p-4 hidden lg:block">
          <div className="flex justify-between mb-2">
            <h1 className="font-semibold text-white/75">Logbook</h1> <span>LPPR</span>
          </div>
          <div className="text-sm">
            <span className="text-white/50"> Metar  </span><br/>
            <span> { localWeather.metar?.slice(4) || "Not found"} </span>
          </div>

          <div className="text-sm mt-4">
            <span className="text-white/50"> TAF  </span><br/>
            <span> { localWeather.taf?.slice(8) || "Not found"} </span>
          </div>
        </div>
      </div>
    </div>
  );
}

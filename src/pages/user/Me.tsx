import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/general/Button";

import type { User } from "../../lib/types";
import ChartCarousel from "../../components/user/ChartCarousel";
import Footer from "../../components/general/Footer";
import { Book, FileText, Forward, PencilLine } from "lucide-react";
import useAlert from "../../components/alert/useAlert";
import RouteMap from "../../components/maping/RouteMap";

export default function Me() {
  const API = import.meta.env.VITE_API_URL;

  const alert = useAlert();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(null);
  const [localWeather, setLocalWeather] = useState<{
    metar?: string,
    taf?: string,
  }>({});

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
  ]

  useEffect(() => {
    if(!localStorage.getItem("accessToken")) {
      navigate("/login");
    }

    axios.get(API + '/users/me', {
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

    const response = (await axios.get(`${API}/wx/ad?icao=${homeAirport}`))
    setLocalWeather({
      metar: response.data.rawOb,
      taf: response.data.rawTaf,
    });
    return response;
  }

  const totalFlightTime = () => {
		if (!user?.logbookEntries || user.logbookEntries.length === 0) {
			return "0h00";
		}


    
		const total = user.logbookEntries
		.map((entry) => {
      return entry.includeInFt ? Number(typeof entry.total === 'number' && entry.total > 0 ? entry.total : entry.simTime) : 0;
    })
		.reduce((acc, entry) => acc + entry, 0);

		const hours = total.toFixed(0);
		const minutes = Math.round((total % 1) * 60);
		return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
	};

  const mostVisitedAirport = () => {
		if(!user?.logbookEntries || user.logbookEntries.length === 0) {
			return "None";
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
		: "None"
	}

  const mostFlownAcft = () => {
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

  function share() {
    navigator.share({
      title: `Flight Records - ${user?.firstName || `@${user?.username}`}`,
      text: `Check out my flight records on Flight Records!`,
      url: `${import.meta.env.VITE_WEBSITE_URL}/u/${user?.username}`,
    })
    .catch(()=> {
      return alert("Not supported", "Sharing is not supported in this browser.");
    })
  }

  return (
    
  
    <>
      <div className="container mx-auto max-w-6xl p-4">
        <div className="px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-4 ring-2 ring-white/25 rounded-lg">
          <div className="flex flex-row items-center space-x-4 lg:col-span-3">

            <img className="h-18 w-18 md:h-28 md:w-28 rounded-full ring-2 ring-white/25" draggable="false" src={user?.profilePictureUrl ?? 'https://placehold.co/512x512'} alt="User profile icon"/>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold capitalize">
                { (user?.firstName ?? `@${user?.username}`)?.substring(0,9) }
              </h1>
              <div>
                <div className="font-semibold text-lg">
                  { user?.organizationRole && 
                    <span className="text-white/50">
                      { roles.find(role => role.id === user?.organizationRole)?.label || user?.organizationRole }
                    </span>
                  }

                  { (user?.organizationId && user?.organizationRole) && <span className="text-white/25 px-2"> @ </span> }

                  { user?.organizationId && 
                    <Link to={`/org/${user.organizationId}`} className="text-white/50 capitalize">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">

          <div className="col-span-1 p-4 ring-2 ring-white/25 rounded-lg block lg:hidden">
            <div className="grid grid-cols-4 gap-4">
              <Link to="/me/edit" 
              className="cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800 ring-2 ring-white/25 
              hover:opacity-75 transition duration-150 text-white p-2 rounded-lg text-center flex justify-center items-center">
                <PencilLine strokeWidth={1.25} className="h-6 w-6"/>
              </Link>

              <Link to="/me/logbook"
              className="cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800 ring-2 ring-white/25 
              hover:opacity-75 transition duration-150 text-white p-2 rounded-lg text-center flex justify-center items-center">
                <Book strokeWidth={1.25} className="h-6 w-6"/>
              </Link>

              <button onClick={() => {
                alert("Coming soon", "This feature is not yet implemented.");
              }}
              className="cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800 ring-2 ring-white/25 
              hover:opacity-75 transition duration-150 text-white p-2 rounded-lg text-center flex justify-center items-center">
                <FileText strokeWidth={1.25} className="h-6 w-6"/>
              </button>

              <button onClick={share}
              className="cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800 ring-2 ring-white/25 
              hover:opacity-75 transition duration-150 text-white p-2 rounded-lg text-center flex justify-center items-center">
                <Forward strokeWidth={1.25} className="h-6 w-6"/>
              </button>

            </div>
          </div>

          <div className="col-span-1 lg:col-span-3 ring-2 ring-white/25 rounded-lg overflow-hidden">
            <RouteMap type="OVERVIEW" user={user} dimensions={{ height: "400px" }}/>
          </div>

          <div className="col-span-1 p-4 ring-2 ring-white/25 rounded-lg hidden lg:block">
            <div className="flex flex-col space-y-4">
              <Button text="Edit Profile" to="/me/edit"/>
              
              <hr className="bg-transparent border-b-2 border-white/25 rounded-lg"/>
              <Button text="Logbook" to="/me/logbook"/>

              <Button text="Generate Report" onClick={() => {
                alert("Coming soon", "This feature is not yet implemented.");
              }}/>
              
              <Button text="Share" onClick={share} type="button"/>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-3 p-4 ring-2 ring-white/25 rounded-lg ">
            {user?.logbookEntries && user?.logbookEntries.length > 0 ? 
            <ChartCarousel logbook={user?.logbookEntries}/> : (
              <div className="text-center text-white/50">
                <h1 className="font-semibold text-white/75">No logbook entries found.</h1>
                <p className="text-sm">Start logging your flights to see your charts here.</p>
              </div>
            )}
          </div>

          <div className="col-span-1 p-4 ring-2 ring-white/25 rounded-lg hidden lg:block">
            <div className="flex justify-between mb-2">
              <h1 className="font-semibold text-white/75">Local Weather</h1> <span title="Home Airport">{ user?.homeAirport }</span>
            </div>
            <div className="space-y-2">
              
              <div className="text-sm">
                <span className="font-semibold">METAR</span>
                { localWeather.metar ? (
                  <p className="text-sm text-white/75">{localWeather.metar?.replace(/[A-Z]{4}/, '')}</p>
                ) : (
                  <p className="text-sm text-white/75">No METAR available</p>
                ) }
              </div>
              
              <div className="text-sm">
                <span className="font-semibold">TAF</span>
                { localWeather.taf ? (
                  <p className="text-sm text-white/75">{localWeather.taf?.replace(/TAF [A-Z]{4}/, '')}</p>
                ) : (
                  <p className="text-sm text-white/75">No TAF available</p>
                ) }
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <Footer/>
    </>
  );
}

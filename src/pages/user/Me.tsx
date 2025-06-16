import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/general/Button";

import type { User } from "../../lib/types";

export default function Me() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(null);

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

  });

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
            <span className="text-white/75 font-semibold">65 hrs</span>
					</div>
          <div className="flex justify-between">
						<span className="text-white/50">Flown</span>
            <span className="text-white/75 font-semibold">0 flights</span>
					</div>
          <div className="flex justify-between">
						<span className="text-white/50">Most flown aircraft</span>
            <span className="text-white/75 font-semibold">CS-EDS</span>
					</div>
          <div className="flex justify-between">
						<span className="text-white/50">Most visited airport</span>
            <span className="text-white/75 font-semibold">LPPR</span>
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
          <div className="ring-2 ring-white/25 rounded-lg p-4">

            <h1 className="text-2xl font-bold text-white mb-4">My Profile</h1>
            <p className="text-white/75 mb-4">Manage your account settings and preferences.</p>
            
          </div>
        </div>
        <div className="col-span-1 ring-2 ring-white/25 rounded-lg p-4 hidden lg:block">
          <div className="flex flex-col space-y-4">
            <Button text="Edit Profile" to="/me/edit"/>
            <Button text="Logbook" to="/me/logbook"/>
            <Button text="Share" onClick={() => {}} type="button"/>
          </div>
        </div>
      </div>
    </div>
  );
}

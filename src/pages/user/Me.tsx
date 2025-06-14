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
    
  
    <div className="container mx-auto max-w-6xl p-4 lg:px-0">
      
      <div className="grid grid-cols-4 mt-24 gap-4">
			  <div className="flex items-center justify-center">
          <img className="h-40 w-40 rounded-full ring-2 ring-white/25" draggable="false" src={user?.profilePictureUrl ?? 'https://placehold.co/512x512'} alt="" />
        </div>

        <div className="col-span-3 lg:col-span-2 overflow-hidden px-2">
          
          <h1 className="text-8xl font-bold capitalize">{ (user?.firstName ?? user?.username)?.substring(0,9) }</h1>

          <div>
              <div className="font-semibold text-lg mt-1">
                { user?.organizationRole && 
                  <span className="text-white/75">
                    { user.organizationRole }
                  </span>
                }

                { (user?.organizationId && user?.organizationRole) && <span className="text-white/25 px-2"> @ </span> }

                { user?.organizationId && 
                  <Link to={`/org/${user.organizationId}`} className="text-white/75 transtion-all duration-150 hover:text-white/50">
                    { user?.organizationId }
                  </Link>
                }
              </div>

              <div className="mt-1 space-x-2">
                <span
                  className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block"
                >
                  @{ user?.username }
                </span>
                <span
                  className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block"
                >
                  { user?.publicProfile  ? 'Public' : 'Private' }
                </span>
                {user?.location && 
                  <span className="text-sm text-white/75 ring-white/25 ring-1 rounded-md px-4 py-0.5 inline-block">
                    { user?.location?.substring(0, 24) }
                  </span>
                }
              </div>
            </div>
        </div>

        <div className="block lg:hidden"></div>

        <div className="col-span-3 lg:col-span-1 flex flex-row lg:flex-col lg:justify-center space-x-4 lg:space-x-0 lg:space-y-2">
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

          <div className="ring-2 ring-white/25 rounded-lg p-4 mt-4">

            <h1 className="text-2xl font-bold text-white mb-4">My Profile</h1>
            <p className="text-white/75 mb-4">Manage your account settings and preferences.</p>
            {/* Add more profile management components here */}

          </div>
        </div>
        <div className="col-span-1 lg:col-span-1 ring-2 ring-white/25 rounded-lg p-4">

        </div>
      </div>
    </div>
  );
}

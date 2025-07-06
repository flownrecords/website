import { useState } from "react";

import Button from "../../../components/general/Button";
import Splash from "../../../components/general/Splash";

export default function Planner() {

  const [ showExtra, extraToggle]  = useState(false);
  const flightPlans = [];

  const [legs, editLegs ] = useState<any[]>([]);

  return (
    <>
      <Splash uppertext="Flown Records" title="Flight Planner"/>
      <div className="container mx-auto max-w-6xl p-4">

        <div className="ring-2 ring-white/25 rounded-lg p-4">
          <div className="grid grid-cols-4 gap-4">
            <input
                className="bg-secondary/25 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                type="text"
                placeholder="Callsign or Flight ID"
                maxLength={7}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.toUpperCase();
                }}
            />
            <input
                className="bg-secondary/25 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                type="text"
                placeholder="Departure (ICAO)"
                maxLength={4}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.toUpperCase();
                }}
            />
            <input
                className="bg-secondary/25 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                type="text"
                placeholder="Destination (ICAO)"
                maxLength={4}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.toUpperCase();
                }}
            />
            <Button text="Create" type="submit" onClick={() => extraToggle(!showExtra) }/>
          </div>
        </div>

        { showExtra && (
          <div className="mt-4 ring-2 ring-white/25 rounded-lg p-4">
            <h2 className="mb-2 font-semibold text-white/75">
              Extra Information
            </h2>
            <div>
              <div className="grid grid-cols-4 gap-4">

                <div className="flex flex-col">
                  <label className="text-sm text-white/75 mb-1">Aircraft Type</label>
                  <input
                    className="bg-secondary/25 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                    type="text"
                    maxLength={4}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.toUpperCase();
                    }}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-white/75 mb-1">Cruise Speed</label>
                  <div className="relative">
                    <span className="absolute left-0 h-full px-4 rounded-l-lg border-r-2 border-white/25 flex items-center justify-center">
                      N
                    </span>
                    
                    <input
                      className="bg-secondary/25 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full text-right"
                      type="text"
                      maxLength={4}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-white/75 mb-1">Cruise Altitude</label>
                  <div className="relative">
                    <span className="absolute left-0 h-full px-4 rounded-l-lg border-r-2 border-white/25 flex items-center justify-center">
                      A
                    </span>
                    
                    <input
                      className="bg-secondary/25 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full text-right"
                      type="text"
                      maxLength={3}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-white/75 mb-1">Alternate (ICAO)</label>
                  <input
                    className="bg-secondary/25 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                    type="text"
                    maxLength={4}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.toUpperCase();
                    }}
                  />
                </div>

              </div>

              <div className="flex flex-col mt-4">
                <label className="text-sm text-white/75 mb-1">Route</label>
                <input
                  className="bg-secondary/25 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                  type="text"
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.toUpperCase();

                    let r = e.currentTarget.value.split(' ').filter(token => /^[A-Z0-9]{2,5}$/.test(token) && token !== 'DCT');
                    
                    if (r.length > 0) {
                      editLegs(r.map((id, index) => ({ id, index })));
                    } else {
                      editLegs([]);
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="flex flex-col">
                  <label className="text-sm text-white/75 mb-1">ETD</label>
                  <input
                    className="bg-secondary/25 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                    type="datetime-local"
                    style={{
                      colorScheme: "dark",
                    }}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm text-white/75 mb-1">ETA</label>
                  <input
                    className="bg-secondary/25 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 accent-accent"
                    type="datetime-local"
                    style={{
                      colorScheme: "dark",
                    }}
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="my-2 grid grid-cols-9 gap-x-4 px-2 text-white/25 font-semibold text-sm">
                    <span>
                      Waypoint
                    </span>
                    <span>
                      Altitude
                    </span>
                    <span>
                      Track
                    </span>
                    <span>
                      Wind
                    </span>
                    <span>
                      Heading
                    </span>
                    <span>
                      Fuel
                    </span>
                    <span>
                      Dist
                    </span>
                    <span>
                      GS
                    </span>
                    <span>
                      Time
                    </span>
                </div>

                { legs.map((leg, index) => (
                    <div
                    key={index}
                    className={`
                    grid grid-cols-9 gap-x-4
                    py-4 px-2 rounded-lg items-center
                    text-sm
                    ${index % 2 === 0 ? 'bg-gradient-to-br to-neutral-900 from-neutral-800' : 'bg-primary'} 
                    `}
                    >
                      <div>
                        { leg.id }
                      </div>

                      <div>
                        A020
                      </div>

                      <div>
                        351
                      </div>

                      <div className="flex flex-col">
                        <span>350  /</span>
                        <span>3</span>
                      </div>

                      <div>
                        350
                      </div>

                      <div className="flex flex-col">
                        <span>0.5</span>
                        <span>2.5</span>
                      </div>

                      <div>
                        10 NM
                      </div>

                      <div>
                        95 
                      </div>

                      <div>
                        00:15 | 00:30
                      </div>
                    </div>
                  )) 
                }
              </div>
              
            </div>
          </div>
        ) }

        { !showExtra && (
            <div className="mt-4 ring-2 ring-white/25 rounded-lg p-4">
              <h2 className="mb-2 font-semibold text-white/75">
                Existing Flight Plans
              </h2>
              
            </div>
        ) }

      </div>
    </>
  );
}
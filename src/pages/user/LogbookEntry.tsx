import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import axios from 'axios';
import LogbookEntryMap from '../../components/Logbook/LogbookEntryMap';
import type  { LogbookEntry,  User } from '../../lib/types';
import Button from '../../components/general/Button';
import Footer from '../../components/general/Footer';



export default function LogbookEntry() {
    const [user, setUser] = useState<User>(null);
    const [entry, setEntry] = useState<LogbookEntry | null>(null);
    const navigate = useNavigate();

    const { entryId } = useParams();

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
                setUser(response.data);
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

        axios.get('http://localhost:7700/users/logbook', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`
            }
        })
        .then(response => {
            if(response.status === 200) {
                let e = response.data?.find((entry: LogbookEntry) => entry.id === Number(entryId));
                setEntry(e);
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

    function parseDate(date?: string | Date | null, cut = false) {
        return new Date(date as any).toLocaleDateString("en-GB", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        }).slice(0, cut ? 5 : undefined);
    }

    function parseDuration(time?: string | number | null) {
        if(!time) return "0:00";
        const total = typeof time === 'string' ? parseFloat(time) : time;
        if(isNaN(total)) return "0:00";
        if(total < 0) return "0:00";
        if(total === 0) return "0:00";
        if(total < 1) {
        const minutes = Math.round(total * 60);
        return `0:${minutes < 10 ? '0' + minutes : minutes}`;
        }

        const hours = total.toFixed(0);
		const minutes = Math.round((total % 1) * 60);
		return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    }

    function parseTime(rawDate: Date | null): string {
        if(!rawDate) return 'N/A';
        const date = new Date(rawDate);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    return (
        <>
            <div className="container mx-auto max-w-6xl p-4">
                <div className='ring-2 ring-white/25 rounded-lg overflow-hidden'>
                    {
                        entry &&
                        <LogbookEntryMap user={user} entry={entry}/>
                    }
                </div>
                
                <div className='mt-4 ring-2 ring-white/25 rounded-lg p-4'>
                    <div className='space-x-4'>
                        <Button text='Assign Crew' styleType='small'/>
                        <Button text='Link Flight Recording' styleType='small'/>
                        <Button text='Link Flight Plan' styleType='small'/>
                    </div>
                </div>

                <div className='mt-4 ring-2 ring-white/25 rounded-lg p-4'>
                    <h1 className='text-lg text-white/50 font-semibold mb-2'>
                        Logbook Entry Details
                    </h1>
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                        <div>
                            <h1 className='mb-1'>Date</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry ? parseDate(entry.offBlock) : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <h1 className='mb-1'>Departure</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry ? entry.depAd : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <h1 className='mb-1'>Arrival</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry ? entry.arrAd : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <h1 className='mb-1'>Uploaded on</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry ? new Date(entry.createdAt).toLocaleString() : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <h1 className='mb-1'>Registration</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry ? entry.aircraftRegistration : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <h1 className='mb-1'>Off Block</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry ? parseTime(entry.offBlock) : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <h1 className='mb-1'>On Block</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry ? parseTime(entry.onBlock) : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <h1 className='mb-1'>Flight Time</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry ? parseDuration(entry.total) : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <h1 className='mb-1'>Crew</h1>
                            <div className='rounded-lg bg-secondary p-2 space-y-2'>
                                {
                                    entry && entry.crewId && entry.crewId.length > 0 ? (
                                        entry.crewId.map((member, index) => (
                                            <div key={index} className={`${index % 2 ? '' : 'border-b border-b-white/25 pb-2'}`}>
                                                <img src="https://placehold.co/128x128" className='h-8 w-8 rounded-full inline-block ring-2 ring-white/25' /> <span className='ml-2 font-semibold'>@{member}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span>No crew members assigned.</span>
                                    )
                                }
                            </div>
                        </div>

                        <div>
                            <h1 className='mb-1'>Landings</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry ? (entry.landDay??0)+(entry.landNight??0) : 'N/A'}
                            </div>
                        </div>

                        <div className='col-span-2'>
                            <h1 className='mb-1'>Remarks</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry ? entry.rmks : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-4 ring-2 ring-white/25 rounded-lg p-4'>
                    <h1 className='text-lg text-white/50 font-semibold mb-2'>
                        Flight Plan
                    </h1>
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                        <div className=''>
                            <h1 className='mb-1'>Departure</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry && entry.plan ? entry.plan.depAd : 'N/A'}
                            </div>
                        </div>

                        <div className=''>
                            <h1 className='mb-1'>ETD</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry && entry.plan ? parseTime(entry.plan.etd) : 'N/A'}
                            </div>
                        </div>

                        <div className=''>
                            <h1 className='mb-1'>ETE</h1> {/* Estimated Time Enroute eta - etd */}
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry && entry.plan && entry.plan.eta && entry.plan.etd ? (
                                    parseDuration(
                                        (new Date(entry.plan.eta).getTime() - new Date(entry.plan.etd).getTime()) / 1000 / 60 / 60
                                    )
                                ) : 'N/A'}
                            </div>
                        </div>

                        <div className=''>
                            <h1 className='mb-1'>Estimated Fuel</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry && entry.plan && entry.plan.fuelPlan ? Number(entry.plan.fuelPlan) : 'N/A'}l
                            </div>
                        </div>

                        <div className='col-span-4'>
                            <h1 className='mb-1'>Route</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry && entry.plan?.route ? entry.plan.route : 'N/A'}
                            </div>
                        </div>

                        <div className=''>
                            <h1 className='mb-1'>Arrival</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry && entry.plan ? entry.plan.depAd : 'N/A'}
                            </div>
                        </div>

                        <div className=''>
                            <h1 className='mb-1'>ETA</h1>
                            <div className='rounded-lg bg-secondary p-2'>
                                {entry && entry.plan ? parseTime(entry.plan.eta) : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer/>
        </>
    )
}
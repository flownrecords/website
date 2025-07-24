import type { LogbookEntry } from "../../lib/types";
import { useKeenSlider } from "keen-slider/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  Legend,
  Line,
  PieChart,
  Cell,
  Pie,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  logbook?: LogbookEntry[];
};

export function parseTime(time?: string | number | null) {
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

export default function ChartCarousel({ logbook = [] }: Props) {
  function useIsMobile(breakpoint = 768) {
	  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

	  useEffect(() => {
		  const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);

    return isMobile;
  }  

  const isMobile = useIsMobile(768);
  const chartMargin = isMobile
  ? { top: 0, right: 0, left: 0, bottom: 0 }
  : { top: 0, right: 45, left: 45, bottom: 0 };

  const chartHeight = isMobile ? 350 : 400;

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: false,
    mode: "snap",
    slides: {
      perView: 1,
      spacing: 16,
    },
  });

  // Group by month: { "Jan 2024": { time: 5.3, flights: 4 } }
  const monthlyData = logbook.reduce((acc, entry) => {
    const key = new Date(entry.date as any).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (!acc[key]) acc[key] = { time: 0, flights: 0 };
    acc[key].time += (entry.includeInFt ? Number(typeof entry.total === 'number' && entry.total > 0 ? entry.total : entry.simTime) : 0) || 0;
    acc[key].flights += 1;
    return acc;
  }, {} as Record<string, { time: number; flights: number }>);

  const chartDataONE = Object.entries(monthlyData)
  .sort(([a], [b]) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  })
  .slice(isMobile ? -4 : -6)
  .map(([month, values]) => ({
    name: month,
    time: values.time,
    flights: values.flights,
  }));

  const chartDataTWO = logbook.reduce((acc, entry) => {
    const aircraft = entry.aircraftRegistration || "Unknown";
    if (!acc[aircraft]) acc[aircraft] = { name: aircraft, flights: 0 };
    acc[aircraft].flights += 1;
    return acc;
  }
  , {} as Record<string, { name: string; flights: number }>);
  Object.values(chartDataTWO).sort((a, b) => b.flights - a.flights);

  const sortedAircraft = Object.values(chartDataTWO).sort((a, b) => b.flights - a.flights).slice(0, isMobile ? 5 : 9);

  const vfrIfrData = [
    {
      name: "VFR",
      value: logbook.reduce((sum, e) => sum + ((Number(e.sepVfr) || 0) + (Number(e.meVfr) || 0)), 0),
    },
    {
      name: "IFR",
      value: logbook.reduce((sum, e) => sum + ((Number(e.sepIfr) || 0) + (Number(e.meIfr) || 0)), 0),
    },
  ];

  const dayNightData = [
    {
      name: "Day",
      value: logbook.reduce((sum, e) => sum + (Number(e.dayTime) || 0), 0),
    },
    {
      name: "Night",
      value: logbook.reduce((sum, e) => sum + (Number(e.nightTime) || 0), 0),
    },
  ];

  const sixMonths = new Date();
  sixMonths.setMonth(sixMonths.getMonth() - 5);

  const landingData = logbook.filter(e => e.date && new Date(e.date) >= sixMonths).reduce((acc, entry) => {
    const date = new Date(entry.date as any);
    const key = date.toLocaleString("default", { month: "short", year: "numeric" });
    if (!acc[key]) acc[key] = { name: key, landings: 0 };
    acc[key].landings += (entry.landDay || 0) + (entry.landNight || 0);
    return acc;
  }, {} as Record<string, { name: string; landings: number }>);

  const landingChartData = Object.values(landingData).sort((a, b) => {
    const dateA = new Date(a.name)
    const dateB = new Date(b.name)
    return dateA.getTime() - dateB.getTime()
  }).slice(isMobile ? -4 : -6);

  return (
    <div className="relative">
      <div ref={sliderRef} className="keen-slider">
        <div className="keen-slider__slide">
          <h2 className="text-white mb-2 text-sm font-semibold text-center">Monthly Hours & Flights</h2>
          <ResponsiveContainer width="100%" height={chartHeight}>
            
            <LineChart data={chartDataONE} margin={{
              right: 5,
            }}>
              <CartesianGrid stroke="#1E1E1E" strokeLinecap="round" opacity={0.25}/>
              <XAxis dataKey="name" stroke="#ccc" fontSize={isMobile ? 10 : 14} />

              <YAxis
                stroke="#ccc"
                tick={{ fontSize: isMobile ? 10 : 14, fill: "#ccc" }}
                
                label={{
                  value: "Flight Time (h)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: isMobile ? 12 : 14,
                  offset: isMobile ? 8 : 10,
                  style: { fill: "#ccc" },
                  margin: isMobile ? 0 : 10,
                }}
              />

              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === "Flight Time") return [parseTime(value), name];
                  return [value, name];
                }}

                 content={<ChartTooltip/>}
              />

              <Legend/>

              <Line      
                type="monotone"
                dataKey="time"
                stroke="#313ED8"
                name="Flight Time"
              />

              <Line 
                type="monotone"
                dataKey="flights"
                stroke="#DD3434"
                name="Flights"
               
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="keen-slider__slide">
          <h2 className="text-white mb-2 text-sm font-semibold text-center">Most Flown Aircraft</h2>

          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={Object.values(sortedAircraft)} margin={{
              left: -30,
            }}>
              <CartesianGrid stroke="#1E1E1E" strokeLinecap="round" opacity={0.25}/>

              <XAxis dataKey="name" stroke="#fff" label={''} angle={isMobile ? -45 : 0} fontSize={isMobile ? 8 : 12} textAnchor={isMobile ? "end" : "middle"} padding={{ left: 0, right: 0 }}/>
              <YAxis style={{padding: 0}} fontSize={isMobile ? 10 : 12}/>

              <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.01)" }} content={<ChartTooltip/>}/>
              <Legend/>

              <Bar dataKey="flights" name="Aircraft Flights" fill="#E6AF2E" radius={[5, 5, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

         <div className="keen-slider__slide">
          <h2 className="text-white text-center">VFR vs IFR Time</h2>

          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart margin={chartMargin}>
              
              <Legend />
              <Tooltip formatter={(value: any) => parseTime(value)} content={<ChartTooltip/>}/>

              <Pie 
              data={vfrIfrData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={isMobile ? 64 : 128} 
              label={(entry) => `${entry.name}: ${parseTime(entry.value)}`} 
              strokeWidth={0}>
                {vfrIfrData.map((entry, index) => (
                  <Cell key={`cell-${index}-${entry.name}`} fill={index % 2 ? '#DD3434' : '#313ED8'} />
                ))}
              </Pie>
            </PieChart>
            
          </ResponsiveContainer>
        </div>

        <div className="keen-slider__slide">
          <h2 className="text-white text-center">Day vs Night Time</h2>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart margin={chartMargin}>

              <Legend/>
              <Tooltip formatter={(value: any) => parseTime(value)} content={<ChartTooltip/>}/>

              <Pie 
              data={dayNightData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={isMobile ? 64 : 128} 
              label={(entry) => `${entry.name}: ${parseTime(entry.value)}`} 
              strokeWidth={0}>
                {dayNightData.map((entry, index) => (
                  <Cell key={`cell-day-${index}-${entry.name}`} fill={index % 2 ? '#DD3434' : '#313ED8'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="keen-slider__slide">
          <h2 className="text-white text-center">Monthly Landings</h2>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={landingChartData} margin={{
              left: -30,
            }}>
              <CartesianGrid stroke="#1E1E1E" strokeLinecap="round" opacity={0.25}/>
              <XAxis dataKey="name" fontSize={isMobile ? 12 : 14}/>
              <YAxis fontSize={isMobile ? 10 : 12}/>
              <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.01)" }}  content={<ChartTooltip/>}/>
              <Bar dataKey="landings" name="Landings" fill="#62BF58" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      
        
      </div>

      <div className="w-3/4 flex mx-auto gap-4 mt-4">
        <button onClick={() => {
          slider.current?.prev()
        }} className="inline-flex w-full text-center hover:opacity-75
          cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800  
          transition duration-150 text-white py-1 px-4 md:px-6 rounded-lg ring-2 ring-white/25 justify-center">
          <ChevronLeft/>
        </button>

        <button onClick={() => slider.current?.next()} 
        className="inline-flex w-full text-center hover:opacity-75
          cursor-pointer bg-gradient-to-t from-neutral-900 to-neutral-800  
          transition duration-150 text-white py-1 px-4 md:px-6 rounded-lg ring-2 ring-white/25 justify-center">
          <ChevronRight/>
        </button>
      </div>
    </div>
  );
}

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
    acc[key].time += Number(entry.total) || 0;
    acc[key].flights += 1;
    return acc;
  }, {} as Record<string, { time: number; flights: number }>);

  const chartDataONE = Object.entries(monthlyData)
  .sort(([a], [b]) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  }).map(([month, values]) => ({
    name: month,
    time: parseFloat(values.time.toFixed(1)),
    flights: values.flights,
  }));

  // Calculate most flown aircraft and get the 10 most flown
  const chartDataTWO = logbook.reduce((acc, entry) => {
    const aircraft = entry.aircraftRegistration || "Unknown";
    if (!acc[aircraft]) acc[aircraft] = { name: aircraft, flights: 0 };
    acc[aircraft].flights += 1;
    return acc;
  }
  , {} as Record<string, { name: string; flights: number }>);
  Object.values(chartDataTWO).sort((a, b) => b.flights - a.flights);

  const sortedAircraft = Object.values(chartDataTWO).sort((a, b) => b.flights - a.flights).slice(0, 9);

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

  const landingChartData = Object.values(landingData);

  return (
    <div className="relative">
      <div ref={sliderRef} className="keen-slider">
        <div className="keen-slider__slide">
          <h2 className="text-white mb-2 text-sm font-semibold text-center">Monthly Hours & Flights</h2>
          <ResponsiveContainer width="100%" height={400}>
            
            <LineChart data={chartDataONE} margin={{ top: 0, right: 45, left: 45, bottom: 0 }}>
              <CartesianGrid stroke="#1E1E1E" strokeLinecap="round" opacity={0.25}/>
              <XAxis dataKey="name" stroke="#ccc" />

              <YAxis
                stroke="#ccc"
                label={{
                  value: "Flight Time (h)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: { fill: "#ccc" },
                }}
              />

              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === "Flight Time") return [parseTime(value), name];
                  return [value, name];
                }}

                 content={<ChartTooltip/>}
              />
              <Legend />
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
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={Object.values(sortedAircraft)} margin={{ top: 0, right: 45, left: 45, bottom: 0 }}>
              <CartesianGrid stroke="#1E1E1E" strokeLinecap="round" opacity={0.25}/>
              <XAxis dataKey="name" stroke="#fff" label={''}/>
              <YAxis />
              <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.01)" }} content={<ChartTooltip/>}/>
              <Legend/>
              <Bar dataKey="flights" name="Aircraft Flights" fill="#E6AF2E" radius={[5, 5, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

         <div className="keen-slider__slide">
          <h2 className="text-white text-center">VFR vs IFR Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 0, right: 45, left: 45, bottom: 0 }}>
              
              <Legend />
              <Tooltip formatter={(value: any) => parseTime(value)} content={<ChartTooltip/>}/>

              <Pie 
              data={vfrIfrData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={128} 
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
          <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 0, right: 45, left: 45, bottom: 0 }}>

              <Legend/>
              <Tooltip formatter={(value: any) => parseTime(value)} content={<ChartTooltip/>}/>

              <Pie 
              data={dayNightData} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={128} 
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
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={landingChartData} margin={{ top: 0, right: 45, left: 45, bottom: 0 }}>
              <CartesianGrid stroke="#1E1E1E" strokeLinecap="round" opacity={0.25}/>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.01)" }}  content={<ChartTooltip/>}/>
              <Bar dataKey="landings" name="Landings" fill="#62BF58" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      
        
      </div>

      <button
        onClick={() => slider.current?.prev()}
        className="absolute top-1/2 left-1 -translate-y-1/2 bg-secondary/25 hover:bg-secondary/50 text-white rounded-full h-8 w-8 p-1 cursor-pointer"
      >
        ←
      </button>
      <button
        onClick={() => slider.current?.next()}
        className="absolute top-1/2 right-1 -translate-y-1/2 bg-secondary/25 hover:bg-secondary/50 text-white rounded-full h-8 w-8 p-1 cursor-pointer"
      >
        →
      </button>
    </div>
  );
}

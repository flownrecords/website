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
} from "recharts";

type Props = {
  logbook?: LogbookEntry[];
};

export default function ChartCarousel({ logbook = [] }: Props) {
  function parseTime(time?: string | number | null) {
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

  const chartDataONE = Object.entries(monthlyData).map(([month, values]) => ({
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

  return (
    <div className="relative">
      <div ref={sliderRef} className="keen-slider">
        <div className="keen-slider__slide">
          <h2 className="text-white mb-2 text-sm font-semibold text-center">Monthly Hours & Flights</h2>
          <ResponsiveContainer width="100%" height={400}>
            
            <LineChart data={chartDataONE} margin={{ top: 15, right: 45, left: 45, bottom: 0 }}>
              <CartesianGrid stroke="#1E1E1E" strokeLinecap="round" opacity={0.25}/>
              <XAxis dataKey="name" stroke="#ccc" />

              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === "Flight Time") return [parseTime(value), name];
                  return [value, name];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="time"
                stroke="#313ED8"
                name="Flight Time"
              />

              <Line
                yAxisId="right"
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
              <Tooltip cursor={{ fill: "rgba(255, 255, 255, 0.01)" }}/>
              <Legend/>
              <Bar dataKey="flights" name="Aircraft Flights" fill="#2e2e2e" radius={[5, 5, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="keen-slider__slide">
          <h2 className="text-white mb-2 text-sm font-semibold text-center">Y</h2>
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

import { MapContainer, CircleMarker, Popup, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { User } from '../../lib/types';

type MapProps = {
  user: User
}

const visitedAerodromes = [
  {icao: 'LPPR', name: 'Porto Airport', coords: [41.248, -8.681]},
  {icao: 'LPPT', name: 'Lisbon Airport', coords: [38.781, -9.135]},
  {icao: 'LPPS', name: 'Porto Santo Airport', coords: [33.070, -16.350]},
]

const flownRoutes = [
  {dep: 'LPPR', arr: 'LPPT', coords: [[41.248, -8.681], [38.781, -9.135]]},
  {dep: 'LPPR', arr: 'LPPS', coords: [[41.248, -8.681], [33.070, -16.350]]},
]

const colors = {
  'accent': '#313ED8',
  'second-accent': '#DD3434',
}

const allCoords = flownRoutes.flatMap(route => route.coords);
const bounds = allCoords as [number, number][];

const Map: React.FC<MapProps> = ({
  user
}) => {
  return (
    <div className='w-full overflow-hidden'>
        <MapContainer
        bounds={bounds}
        boundsOptions={{padding: [25, 25]}}
        zoom={13}
        maxZoom={10}
        minZoom={2}
        className='h-72 w-full'
        >
        <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap & CARTO'
        />
        
        


        {/* Add a line connecting the route */}
        {flownRoutes.map((route, index) => (
          <Polyline key={index} positions={route.coords as any} color={'grey'} weight={2}/>
        ))}

        {visitedAerodromes.map((ad) => (
          <CircleMarker key={ad.icao} center={ad.coords as any} radius={2} color={colors['accent']} fillColor={colors['accent']} fillOpacity={0.5}>
            <Popup>
              {ad.name} ({ad.icao})
            </Popup>
          </CircleMarker>
        ))}

        </MapContainer>
    </div>
  );
};

export default Map;
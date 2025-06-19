import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = () => {
  return (
    <div className='w-full overflow-hidden'>
        <MapContainer
        center={[41.14961, -8.61099]} // Porto 😎
        zoom={13}
        className='h-64 w-full'
        >
        <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap & CARTO'
        />
        
        </MapContainer>
    </div>
  );
};

export default Map;
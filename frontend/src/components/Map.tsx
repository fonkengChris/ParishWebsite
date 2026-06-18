import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
}

// Parish location coordinates: 4°03'19"N 9°13'41"E (Limbe, Cameroon)
export const PARISH_COORDINATES: [number, number] = [4.055278, 9.228056];
export const PARISH_NAME = 'St. John of God Parish';
export const PARISH_DIOCESE = 'Buea Diocese';
export const PARISH_LOCATION = {
  name: PARISH_NAME,
  diocese: PARISH_DIOCESE,
  city: 'Limbe',
  region: 'Southwest Region',
  country: 'Cameroon',
  coordinates: PARISH_COORDINATES,
};

export default function Map({ 
  center = PARISH_COORDINATES,
  zoom = 13,
  height = '256px' 
}: MapProps) {

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>
            <strong>{PARISH_NAME}</strong><br />
            {PARISH_DIOCESE}<br />
            Limbe, Cameroon
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}


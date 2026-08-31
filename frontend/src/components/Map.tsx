import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useParish } from '../contexts/ParishContext';

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

export default function Map({
  center,
  zoom = 13,
  height = '256px'
}: MapProps) {
  const { parish } = useParish();
  const position: [number, number] = center ?? [parish.coordinates.lat, parish.coordinates.lng];

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden">
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <strong>{parish.name}</strong><br />
            {parish.diocese}<br />
            {parish.city}, {parish.country}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}


'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix Leaflet default icon issue in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = () => {
    const [objects, setObjects] = useState<any[]>([]);

    useEffect(() => {
        fetch('http://localhost:8000/objects')
            .then(res => res.json())
            .then(data => {
                // Filter for objects with Lat/Long properties
                // This is a naive check. In a real app, we'd use the Ontology metadata.
                const geoObjects = data.filter((obj: any) => {
                    const props = obj.properties || [];
                    const lat = props.find((p: any) => p.value && !isNaN(parseFloat(p.value)) && (parseFloat(p.value) >= -90 && parseFloat(p.value) <= 90));
                    const long = props.find((p: any) => p.value && !isNaN(parseFloat(p.value)) && (parseFloat(p.value) >= -180 && parseFloat(p.value) <= 180));
                    // We assume if it has 2 numeric properties, it might be geo for this MVP
                    // Ideally we look up Property Type names "Latitude" and "Longitude"
                    return lat && long;
                });
                setObjects(geoObjects);
            });
    }, []);

    return (
        <MapContainer center={[37.7749, -122.4194]} zoom={13} style={{ height: '100%', width: '100%', background: '#10161a' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {objects.map(obj => {
                // Extract lat/long again for rendering
                const props = obj.properties;
                // Very naive extraction: take first two numbers found
                const nums = props.map((p: any) => parseFloat(p.value)).filter((n: number) => !isNaN(n));
                if (nums.length < 2) return null;

                return (
                    <Marker key={obj.id} position={[nums[0], nums[1]]}>
                        <Popup>
                            <strong>{obj.title}</strong><br />
                            ID: {obj.id.substring(0, 8)}
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default Map;

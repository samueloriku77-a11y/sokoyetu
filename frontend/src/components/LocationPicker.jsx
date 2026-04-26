import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PREDEFINED_LOCATIONS = [
  { id: 'uon-main', name: 'UoN Main Campus', lat: -1.2798, lng: 36.8166 },
  { id: 'jkuat-juja', name: 'JKUAT Juja', lat: -1.0967, lng: 37.0144 },
  { id: 'ku-main', name: 'KU Main Campus', lat: -1.1804, lng: 36.9317 },
  { id: 'strathmore', name: 'Strathmore University', lat: -1.3094, lng: 36.8123 },
  { id: 'usiu', name: 'USIU Africa', lat: -1.2185, lng: 36.8804 },
];

function LocationMarker({ position, setPosition, setAddress }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setAddress(`Pinned Location: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function LocationPicker({ onChange }) {
  const [method, setMethod] = useState('dropdown'); // dropdown, gps, map
  const [position, setPosition] = useState(null); // {lat, lng}
  const [address, setAddress] = useState('');

  // Call parent onChange whenever position/address changes
  useEffect(() => {
    if (position && onChange) {
      onChange({ address, lat: position.lat, lng: position.lng });
    }
  }, [position, address, onChange]);

  const handleDropdownChange = (e) => {
    const locId = e.target.value;
    if (!locId) {
      setPosition(null);
      setAddress('');
      return;
    }
    const loc = PREDEFINED_LOCATIONS.find(l => l.id === locId);
    if (loc) {
      setPosition({ lat: loc.lat, lng: loc.lng });
      setAddress(loc.name);
    }
  };

  const getGPSLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAddress('Current GPS Location');
          toast.success('Location captured!');
        },
        () => toast.error('Enable location services')
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  return (
    <div style={{ background: 'var(--navy-3)', padding: '16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Delivery Location</p>
      
      {/* Method Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button 
          type="button"
          className={`btn btn-sm ${method === 'dropdown' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setMethod('dropdown')}
        >
          Saved Places
        </button>
        <button 
          type="button"
          className={`btn btn-sm ${method === 'gps' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setMethod('gps'); getGPSLocation(); }}
        >
          Current Location
        </button>
        <button 
          type="button"
          className={`btn btn-sm ${method === 'map' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setMethod('map'); if(!position) setPosition({ lat: -1.2921, lng: 36.8219 }); }}
        >
          Map Pin
        </button>
      </div>

      {method === 'dropdown' && (
        <div className="form-group">
          <label>Select an integrated location</label>
          <select onChange={handleDropdownChange} defaultValue="">
            <option value="">-- Choose integrated campus/location --</option>
            {PREDEFINED_LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      )}

      {method === 'gps' && (
        <div style={{ padding: '12px', background: 'rgba(74,222,128,0.1)', borderRadius: '8px', border: '1px solid rgba(74,222,128,0.2)' }}>
          {position ? (
            <span style={{ fontSize: 13, color: 'var(--green-dk)' }}>GPS Captured ({position.lat.toFixed(4)}, {position.lng.toFixed(4)})</span>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={getGPSLocation}>Fetch GPS Again</button>
          )}
        </div>
      )}

      {method === 'map' && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Click on the map to pin your exact location.</p>
          <div style={{ height: '250px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-2)' }}>
            <MapContainer center={position || [-1.2921, 36.8219]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&amp;copy <a href="https://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
            </MapContainer>
          </div>
        </div>
      )}

      {/* Manual Override Option */}
      <div className="form-group" style={{ marginTop: 16 }}>
        <label>Address Details (Room No, Specific Stall, etc)</label>
        <input 
          placeholder="e.g. Stall 42 or Hall C Room 14" 
          value={address} 
          onChange={e => {
            setAddress(e.target.value);
            if (onChange && position) onChange({ address: e.target.value, lat: position.lat, lng: position.lng });
          }} 
        />
      </div>
    </div>
  );
}

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import './App.css';

// Haritanın varsayılan merkezi (İstanbul)
const istanbulCenter = [41.0082, 28.9784];

// Şimdilik sahte veriler (Backend gelene kadar)
const mockEvents = [
  { id: 1, title: "React JS ile Frontend'e Giriş", position: [41.0422, 29.0060] }, // Beşiktaş
  { id: 2, title: "Fintech Hackathon 2026", position: [41.1069, 29.0229] }, // Maslak
  { id: 3, title: "Yapay Zeka ve Veri Bilimi Stajı", position: [40.9904, 29.0256] }  // Kadıköy
];

function App() {
  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      
      {/* 🚀 TECHYAKA YAKINDA OVERLAY 🚀 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px 40px',
        borderRadius: '12px',
        zIndex: 1000, // Haritanın üstünde durması için kritik!
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)'
      }}>
        <h1 style={{ margin: '0', fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '2px' }}>
          TECHYAKA
        </h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.2rem', color: '#00d8ff' }}>
          YAKINDA...
        </p>
      </div>

      {/* Harita Bileşeni */}
      <MapContainer 
        center={istanbulCenter} 
        zoom={11} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        {/* OpenStreetMap Katmanı */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Sahte etkinlikleri haritaya pinleme */}
        {mockEvents.map((event) => (
          <Marker key={event.id} position={event.position}>
            <Popup>
              <strong>{event.title}</strong>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
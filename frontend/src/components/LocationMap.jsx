import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";

const TYPE_LABELS = { avm: "AVM", otopark: "Otopark" };

// Leaflet'in varsayılan pin görselleri Vite ile doğrudan çalışmadığından
// (asset path sorunu), koyu temaya uygun basit bir divIcon üretiyoruz.
function createLocationIcon(isAvailable) {
  const color = isAvailable ? "#A3E635" : "#6B7280";
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid #0B0B0C;box-shadow:0 0 6px ${color}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:#3B82F6;border:2px solid white;box-shadow:0 0 6px #3B82F6"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Haritanın görünür alanını, tüm pin'ler (ve varsa kullanıcı konumu) ekrana
// sığacak şekilde otomatik ayarlar. Sabit bir zoom kullanılsaydı, arama
// yarıçapı geniş olduğunda uzak lokasyonlar görünür alanın dışında kalırdı.
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [32, 32], maxZoom: 14 });
  }, [points, map]);

  return null;
}

// Yakındaki lokasyonları OpenStreetMap üzerinde pin olarak gösteren harita bileşeni.
export default function LocationMap({ locations, userPosition, availabilityByLocation }) {
  const navigate = useNavigate();
  const fallbackCenter = [41.0082, 28.9784];
  const points = [
    ...(userPosition ? [[userPosition.lat, userPosition.lng]] : []),
    ...locations.map((l) => [l.lat, l.lng]),
  ];

  return (
    <MapContainer
      center={points[0] ?? fallbackCenter}
      zoom={12}
      scrollWheelZoom={true}
      className="h-[60vh] w-full rounded-2xl border border-border"
    >
      <FitBounds points={points} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
          <Popup>Buradasın</Popup>
        </Marker>
      )}

      {locations.map((location) => {
        const availability = availabilityByLocation[location.id];
        const isAvailable = !availability || availability.available_devices > 0;
        return (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={createLocationIcon(isAvailable)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{location.name}</p>
                <p className="text-muted">{TYPE_LABELS[location.type] ?? location.type}</p>
                <p>{location.address}</p>
                {availability && (
                  <p>
                    {availability.available_devices}/{availability.total_devices} cihaz müsait
                  </p>
                )}
                <p>{location.distance_km} km uzaklıkta</p>
                <button
                  onClick={() => navigate(`/lokasyon/${location.id}`)}
                  className="mt-2 font-semibold text-lime-dark underline"
                >
                  Detayları Gör
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

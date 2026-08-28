// Backend API ile konuşan basit fetch sarmalayıcısı.
// Tüm istekler için ortak base URL ve hata yönetimi burada toplanır.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `İstek başarısız oldu (${response.status})`);
  }

  return response.json();
}

// Kullanıcının konumuna yakın lokasyonları getirir
export function getNearbyLocations({ lat, lng, radiusKm = 15 }) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius_km: String(radiusKm),
  });
  return request(`/locations/nearby?${params.toString()}`);
}

// Tek bir lokasyonun detayını getirir
export function getLocationById(locationId) {
  return request(`/locations/${locationId}`);
}

// Bir lokasyondaki cihaz müsaitlik özetini getirir
export function getLocationAvailability(locationId) {
  return request(`/locations/${locationId}/availability`);
}

// Bir lokasyondaki tüm cihazları (durumlarıyla birlikte) getirir
export function getLocationDevices(locationId) {
  return request(`/locations/${locationId}/devices`);
}

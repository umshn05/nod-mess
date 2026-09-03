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

// Kullanıcının konumuna yakın lokasyonları getirir.
// Demo verisi Türkiye geneline yayıldığı için varsayılan yarıçap, ülkenin
// tamamını kapsayacak kadar büyük tutuldu (aksi halde sadece en yakın
// şehirdeki lokasyonlar dönerdi).
export function getNearbyLocations({ lat, lng, radiusKm = 2000 }) {
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

// Yeni bir rezervasyon oluşturur (DRAFT -> RESERVED)
export function createReservation({ userId, locationId, deviceId, startAt, endAt }) {
  return request("/reservations", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      location_id: locationId,
      device_id: deviceId,
      time_window: { start_at: startAt, end_at: endAt },
    }),
  });
}

// Bir rezervasyonun güncel durumunu getirir
export function getReservation(reservationId) {
  return request(`/reservations/${reservationId}`);
}

// Bir kullanıcının tüm rezervasyon geçmişini getirir
export function listReservations(userId) {
  return request(`/reservations?user_id=${encodeURIComponent(userId)}`);
}

// Henüz check-in yapılmamış bir rezervasyonu iptal eder
export function cancelReservation(reservationId) {
  return request(`/reservations/${reservationId}/cancel`, { method: "POST" });
}

// Rezervasyona bağlı kiralama kaydını getirir (check-in yapıldıysa mevcuttur)
export function getReservationRental(reservationId) {
  return request(`/reservations/${reservationId}/rental`);
}

// MOCK: kart tahsilatını simüle eder, rezervasyonu check-in için hazırlar
export function confirmPayment(reservationId) {
  return request(`/reservations/${reservationId}/confirm-payment`, { method: "POST" });
}

// MOCK: QR kodun taranmasını simüle eder, rezervasyonu ACTIVE'e taşır ve kiralama başlatır
export function validateCheckin(checkinToken) {
  return request("/checkin/validate", {
    method: "POST",
    body: JSON.stringify({ checkin_token: checkinToken }),
  });
}

// Aktif bir kiralamanın canlı süre/ücret durumunu getirir
export function getRentalStatus(rentalId) {
  return request(`/rentals/${rentalId}/status`);
}

// Cihazı iade eder, nihai ücreti hesaplar ve makbuz döner
export function returnRental(rentalId) {
  return request(`/rentals/${rentalId}/return`, { method: "POST" });
}

import { create } from "zustand";
import { getNearbyLocations } from "../lib/api";

// İstanbul merkez - konum izni verilmediğinde kullanılan varsayılan nokta
const FALLBACK_POSITION = { lat: 41.0082, lng: 28.9784 };

// Ana sayfadaki "yakındaki lokasyonlar" akışının durumunu tutan store.
// Konum, yükleniyor/hata durumları ve lokasyon listesi burada saklanır.
export const useNearbyStore = create((set, get) => ({
  userPosition: null,
  usingFallback: false,
  locations: [],
  status: "idle", // idle | loading | success | error
  errorMessage: null,

  async requestUserLocation() {
    set({ status: "loading", errorMessage: null });

    if (!navigator.geolocation) {
      set({ userPosition: FALLBACK_POSITION, usingFallback: true });
      await get().fetchNearby(FALLBACK_POSITION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        set({ userPosition: coords, usingFallback: false });
        await get().fetchNearby(coords);
      },
      async () => {
        // Kullanıcı izni reddetti veya konum alınamadı: varsayılan konuma düş
        set({ userPosition: FALLBACK_POSITION, usingFallback: true });
        await get().fetchNearby(FALLBACK_POSITION);
      },
      { timeout: 8000 }
    );
  },

  async fetchNearby(position) {
    set({ status: "loading", errorMessage: null });
    try {
      const locations = await getNearbyLocations({ lat: position.lat, lng: position.lng });
      set({ locations, status: "success" });
    } catch (err) {
      set({ status: "error", errorMessage: err.message });
    }
  },
}));

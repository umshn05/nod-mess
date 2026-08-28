import { useEffect, useState } from "react";
import { useNearbyStore } from "../store/useNearbyStore";
import LoadingState from "../components/LoadingState";
import LocationCard from "../components/LocationCard";
import LocationMap from "../components/LocationMap";

const TYPE_FILTERS = [
  { value: "all", label: "Tümü" },
  { value: "avm", label: "AVM" },
  { value: "otopark", label: "Otopark" },
];

export default function MapList() {
  const {
    status,
    locations,
    userPosition,
    availabilityByLocation,
    errorMessage,
    requestUserLocation,
  } = useNearbyStore();

  const [view, setView] = useState("map"); // "map" | "list"
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    // Ana Sayfa'dan farklı bir sekmede doğrudan bu ekrana gelinmiş olabilir,
    // lokasyonlar henüz yüklenmediyse burada da isteği başlat.
    if (status === "idle") {
      requestUserLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLocations =
    typeFilter === "all" ? locations : locations.filter((loc) => loc.type === typeFilter);

  return (
    <div className="px-4 pb-24 pt-4">
      <h2 className="text-xl font-bold text-white">Harita &amp; Liste</h2>
      <p className="mt-1 text-sm text-muted">Yakındaki lokasyonları haritada veya listede incele.</p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setView("map")}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
            view === "map" ? "bg-lime text-black" : "bg-surface text-muted border border-border"
          }`}
        >
          Harita
        </button>
        <button
          onClick={() => setView("list")}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
            view === "list" ? "bg-lime text-black" : "bg-surface text-muted border border-border"
          }`}
        >
          Liste
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setTypeFilter(filter.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              typeFilter === filter.value
                ? "border-lime bg-lime-muted text-lime"
                : "border-border text-muted"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {status === "loading" && <LoadingState text="Lokasyonlar getiriliyor..." />}

        {status === "error" && (
          <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
            Lokasyonlar yüklenirken bir sorun oluştu: {errorMessage}
          </div>
        )}

        {status === "success" && filteredLocations.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-4 text-center text-sm text-muted">
            Bu filtreye uyan lokasyon bulunamadı.
          </div>
        )}

        {status === "success" && filteredLocations.length > 0 && view === "map" && (
          <LocationMap
            locations={filteredLocations}
            userPosition={userPosition}
            availabilityByLocation={availabilityByLocation}
          />
        )}

        {status === "success" && filteredLocations.length > 0 && view === "list" && (
          <div className="flex flex-col gap-3">
            {filteredLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                availability={availabilityByLocation[location.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

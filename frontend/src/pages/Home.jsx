import { useEffect } from "react";
import { useNearbyStore } from "../store/useNearbyStore";
import LoadingState from "../components/LoadingState";
import LocationCard from "../components/LocationCard";
import Button from "../components/Button";

export default function Home() {
  const { status, locations, usingFallback, errorMessage, requestUserLocation, availabilityByLocation } =
    useNearbyStore();

  useEffect(() => {
    requestUserLocation();
    // Sayfa ilk açıldığında konum izni istenir; store fonksiyonu referans olarak sabit olduğundan
    // sadece mount anında bir kez çalışması yeterli.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-4 pb-24 pt-4">
      <h2 className="text-xl font-bold text-white">Yakındaki Şarj Noktaları</h2>
      <p className="mt-1 text-sm text-muted">
        AVM ve otoparklardaki taşınabilir şarj cihazlarını keşfet.
      </p>

      {usingFallback && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          <span>Konum izni alınamadı, İstanbul merkezli sonuçlar gösteriliyor.</span>
          <button onClick={requestUserLocation} className="shrink-0 font-semibold text-lime">
            Tekrar Dene
          </button>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {status === "loading" && <LoadingState text="Yakındaki lokasyonlar getiriliyor..." />}

        {status === "error" && (
          <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
            <p>Lokasyonlar yüklenirken bir sorun oluştu: {errorMessage}</p>
            <Button variant="secondary" className="mt-3" onClick={requestUserLocation}>
              Tekrar Dene
            </Button>
          </div>
        )}

        {status === "success" && locations.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-4 text-center text-sm text-muted">
            Yakınında müsait bir lokasyon bulunamadı.
          </div>
        )}

        {status === "success" &&
          locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              availability={availabilityByLocation[location.id]}
            />
          ))}
      </div>
    </div>
  );
}

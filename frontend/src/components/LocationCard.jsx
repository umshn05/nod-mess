import { useNavigate } from "react-router-dom";
import Card from "./Card";

const TYPE_LABELS = {
  avm: "AVM",
  otopark: "Otopark",
};

// Ana sayfa ve Harita/Liste ekranındaki lokasyon listesinde bir satırı temsil eder.
// `availability` verilirse (total_devices/available_devices) müsaitlik rozeti de gösterilir.
// Karta tıklanınca lokasyonun detay sayfasına yönlendirir.
export default function LocationCard({ location, availability }) {
  const navigate = useNavigate();

  return (
    <Card onClick={() => navigate(`/lokasyon/${location.id}`)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{location.name}</p>
          <p className="mt-0.5 text-sm text-muted">{location.address}</p>
        </div>
        <span className="shrink-0 rounded-full bg-lime-muted px-2 py-1 text-xs font-medium text-lime">
          {TYPE_LABELS[location.type] ?? location.type}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>{location.working_hours}</span>
        <span className="flex items-center gap-2">
          {availability && (
            <span
              className={
                availability.available_devices > 0
                  ? "font-medium text-lime"
                  : "font-medium text-muted"
              }
            >
              {availability.available_devices}/{availability.total_devices} müsait
            </span>
          )}
          <span className="font-medium text-white">{location.distance_km} km</span>
        </span>
      </div>
    </Card>
  );
}

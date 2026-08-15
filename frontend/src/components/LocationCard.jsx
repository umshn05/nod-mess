import Card from "./Card";

const TYPE_LABELS = {
  avm: "AVM",
  otopark: "Otopark",
};

// Ana sayfadaki lokasyon listesinde bir satırı temsil eder.
export default function LocationCard({ location }) {
  return (
    <Card>
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
        <span className="font-medium text-white">{location.distance_km} km</span>
      </div>
    </Card>
  );
}

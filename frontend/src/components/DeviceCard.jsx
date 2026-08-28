import Card from "./Card";

const STATUS_LABELS = {
  available: { text: "Müsait", className: "bg-lime-muted text-lime" },
  reserved: { text: "Rezerve", className: "bg-surface-alt text-muted" },
  checked_out: { text: "Kirada", className: "bg-surface-alt text-muted" },
  maintenance: { text: "Bakımda", className: "bg-surface-alt text-muted" },
};

// Lokasyon detay sayfasında seçilebilir bir cihaz kartı.
// Sadece "available" durumundaki cihazlar seçilebilir; diğerleri soluk gösterilir.
export default function DeviceCard({ device, selected, onSelect }) {
  const isSelectable = device.status === "available";
  const statusInfo = STATUS_LABELS[device.status] ?? { text: device.status, className: "bg-surface-alt text-muted" };

  return (
    <Card
      onClick={isSelectable ? onSelect : undefined}
      className={`${selected ? "border-lime" : ""} ${!isSelectable ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{device.model}</p>
          <p className="mt-0.5 text-sm text-muted">
            {device.power_class} &middot; {device.connector_type}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${statusInfo.className}`}>
          {statusInfo.text}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted">Saatlik</p>
          <p className="font-semibold text-white">{device.hourly_fee}₺</p>
        </div>
        <div>
          <p className="text-muted">Günlük</p>
          <p className="font-semibold text-white">{device.daily_fee}₺</p>
        </div>
        <div>
          <p className="text-muted">Depozito</p>
          <p className="font-semibold text-white">{device.deposit}₺</p>
        </div>
      </div>
    </Card>
  );
}

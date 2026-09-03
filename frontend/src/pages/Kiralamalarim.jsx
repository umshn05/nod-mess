import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listReservations,
  getLocationById,
  getLocationDevices,
  cancelReservation,
  getReservationRental,
} from "../lib/api";
import { getUserId } from "../lib/user";
import LoadingState from "../components/LoadingState";
import Card from "../components/Card";
import Button from "../components/Button";

const STATUS_LABELS = {
  DRAFT: { text: "Taslak", className: "bg-surface-alt text-muted" },
  RESERVED: { text: "Rezerve Edildi", className: "bg-lime-muted text-lime" },
  CHECKIN_PENDING: { text: "Ödeme Onaylandı", className: "bg-lime-muted text-lime" },
  ACTIVE: { text: "Aktif", className: "bg-lime text-black" },
  RETURN_PENDING: { text: "İade Ediliyor", className: "bg-surface-alt text-muted" },
  COMPLETED: { text: "Tamamlandı", className: "bg-surface-alt text-muted" },
  CANCELLED: { text: "İptal Edildi", className: "bg-surface-alt text-muted" },
  EXPIRED: { text: "Süresi Doldu", className: "bg-surface-alt text-muted" },
};

export default function Kiralamalarim() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setStatus("loading");
    try {
      const reservations = await listReservations(getUserId());
      const enriched = await Promise.all(
        reservations.map(async (reservation) => {
          const [location, devices] = await Promise.all([
            getLocationById(reservation.location_id),
            getLocationDevices(reservation.location_id),
          ]);
          const device = devices.find((d) => d.id === reservation.device_id);
          return { reservation, location, device };
        })
      );
      setItems(enriched);
      setStatus("success");
    } catch (err) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(reservationId) {
    setBusyId(reservationId);
    try {
      await cancelReservation(reservationId);
      await load();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleViewActive(reservationId) {
    setBusyId(reservationId);
    try {
      const rental = await getReservationRental(reservationId);
      navigate(`/kiralama/${rental.id}`);
    } catch (err) {
      setErrorMessage(err.message);
      setBusyId(null);
    }
  }

  return (
    <div className="px-4 pb-24 pt-4">
      <h2 className="text-xl font-bold text-white">Kiralamalarım</h2>
      <p className="mt-1 text-sm text-muted">Geçmiş ve devam eden rezervasyonların.</p>

      <div className="mt-4 flex flex-col gap-3">
        {status === "loading" && <LoadingState text="Rezervasyonlar getiriliyor..." />}

        {status === "error" && (
          <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
            {errorMessage}
          </div>
        )}

        {status === "success" && items.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-4 text-center text-sm text-muted">
            Henüz bir rezervasyonun yok. Ana sayfadan bir lokasyon seçerek başlayabilirsin.
          </div>
        )}

        {status === "success" &&
          items.map(({ reservation, location, device }) => {
            const statusInfo = STATUS_LABELS[reservation.status] ?? {
              text: reservation.status,
              className: "bg-surface-alt text-muted",
            };
            const isBusy = busyId === reservation.id;

            return (
              <Card key={reservation.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{location?.name ?? "Lokasyon"}</p>
                    <p className="mt-0.5 text-sm text-muted">{device?.model ?? "Cihaz"}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${statusInfo.className}`}>
                    {statusInfo.text}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted">
                  <span>{new Date(reservation.created_at).toLocaleString("tr-TR")}</span>
                  <span className="font-medium text-white">
                    {reservation.price_snapshot.estimated_total}₺
                  </span>
                </div>

                {reservation.status === "RESERVED" && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      className="flex-1"
                      disabled={isBusy}
                      onClick={() => navigate(`/odeme/${reservation.id}`)}
                    >
                      Ödemeye Git
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      disabled={isBusy}
                      onClick={() => handleCancel(reservation.id)}
                    >
                      {isBusy ? "İptal ediliyor..." : "İptal Et"}
                    </Button>
                  </div>
                )}

                {reservation.status === "CHECKIN_PENDING" && (
                  <div className="mt-3 flex gap-2">
                    <Button className="flex-1" disabled={isBusy} onClick={() => navigate(`/qr/${reservation.id}`)}>
                      QR Kodu Göster
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      disabled={isBusy}
                      onClick={() => handleCancel(reservation.id)}
                    >
                      {isBusy ? "İptal ediliyor..." : "İptal Et"}
                    </Button>
                  </div>
                )}

                {reservation.status === "ACTIVE" && (
                  <div className="mt-3">
                    <Button disabled={isBusy} onClick={() => handleViewActive(reservation.id)}>
                      {isBusy ? "Açılıyor..." : "Kiralamayı Görüntüle"}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}

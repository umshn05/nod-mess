import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLocationById, getLocationDevices, createReservation } from "../lib/api";
import { getUserId } from "../lib/user";
import LoadingState from "../components/LoadingState";
import Card from "../components/Card";
import Button from "../components/Button";

const DURATION_PRESETS = [
  { hours: 1, label: "1 Saat" },
  { hours: 3, label: "3 Saat" },
  { hours: 24, label: "1 Gün" },
];

function estimateTotal(device, hours) {
  if (hours >= 24) return device.daily_fee * Math.ceil(hours / 24);
  return device.hourly_fee * hours;
}

export default function ReservationSummary() {
  const { locationId, deviceId } = useParams();
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [device, setDevice] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedHours, setSelectedHours] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const [locationData, devices] = await Promise.all([
          getLocationById(locationId),
          getLocationDevices(locationId),
        ]);
        if (cancelled) return;
        const deviceData = devices.find((d) => d.id === deviceId);
        if (!deviceData) throw new Error("Cihaz bulunamadı");
        setLocation(locationData);
        setDevice(deviceData);
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err.message);
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [locationId, deviceId]);

  async function handleReserve() {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const startAt = new Date();
      const endAt = new Date(startAt.getTime() + selectedHours * 3600 * 1000);
      const reservation = await createReservation({
        userId: getUserId(),
        locationId,
        deviceId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      });
      navigate(`/odeme/${reservation.id}`);
    } catch (err) {
      setErrorMessage(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 pb-28 pt-4">
      <button onClick={() => navigate(-1)} className="text-sm font-medium text-muted hover:text-white">
        ← Geri
      </button>

      {status === "loading" && <LoadingState text="Rezervasyon bilgileri hazırlanıyor..." />}

      {status === "error" && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          {errorMessage}
        </div>
      )}

      {status === "success" && location && device && (
        <>
          <h2 className="mt-3 text-xl font-bold text-white">Rezervasyon Özeti</h2>

          <Card className="mt-4">
            <p className="text-sm text-muted">Lokasyon</p>
            <p className="font-semibold text-white">{location.name}</p>
            <p className="mt-3 text-sm text-muted">Cihaz</p>
            <p className="font-semibold text-white">
              {device.model} &middot; {device.power_class}
            </p>
          </Card>

          <h3 className="mt-6 text-sm font-semibold text-white">Süre Seç</h3>
          <div className="mt-3 flex gap-2">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset.hours}
                onClick={() => setSelectedHours(preset.hours)}
                className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${
                  selectedHours === preset.hours
                    ? "border-lime bg-lime-muted text-lime"
                    : "border-border text-muted"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <Card className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Tahmini Tutar</span>
              <span className="text-lg font-bold text-white">
                {estimateTotal(device, selectedHours)}₺
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-muted">Depozito</span>
              <span className="text-sm font-medium text-white">{device.deposit}₺</span>
            </div>
          </Card>

          {errorMessage && <p className="mt-3 text-sm text-red-400">{errorMessage}</p>}

          <div className="mt-6">
            <Button onClick={handleReserve} disabled={submitting}>
              {submitting ? "Rezerve ediliyor..." : "Rezerve Et"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLocationById, getLocationDevices } from "../lib/api";
import LoadingState from "../components/LoadingState";
import DeviceCard from "../components/DeviceCard";
import Button from "../components/Button";

const TYPE_LABELS = { avm: "AVM", otopark: "Otopark" };

export default function LocationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [devices, setDevices] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [continueMessage, setContinueMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const [locationData, devicesData] = await Promise.all([
          getLocationById(id),
          getLocationDevices(id),
        ]);
        if (cancelled) return;
        setLocation(locationData);
        setDevices(devicesData);
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
  }, [id]);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) ?? null;

  return (
    <div className="px-4 pb-28 pt-4">
      <button onClick={() => navigate(-1)} className="text-sm font-medium text-muted hover:text-white">
        ← Geri
      </button>

      {status === "loading" && <LoadingState text="Lokasyon detayı getiriliyor..." />}

      {status === "error" && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          Detay yüklenirken bir sorun oluştu: {errorMessage}
        </div>
      )}

      {status === "success" && location && (
        <>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">{location.name}</h2>
              <p className="mt-1 text-sm text-muted">{location.address}</p>
            </div>
            <span className="shrink-0 rounded-full bg-lime-muted px-2 py-1 text-xs font-medium text-lime">
              {TYPE_LABELS[location.type] ?? location.type}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Çalışma saatleri: {location.working_hours}</p>

          <h3 className="mt-6 text-sm font-semibold text-white">Müsait Cihazlar</h3>
          <div className="mt-3 flex flex-col gap-3">
            {devices.length === 0 && (
              <div className="rounded-xl border border-border bg-surface p-4 text-center text-sm text-muted">
                Bu lokasyonda kayıtlı cihaz bulunamadı.
              </div>
            )}
            {devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                selected={device.id === selectedDeviceId}
                onSelect={() => {
                  setSelectedDeviceId(device.id);
                  setContinueMessage(null);
                }}
              />
            ))}
          </div>
        </>
      )}

      {selectedDevice && (
        <div className="fixed inset-x-0 bottom-16 z-10 mx-auto max-w-md border-t border-border bg-surface px-4 py-3">
          {continueMessage && <p className="mb-2 text-xs text-lime">{continueMessage}</p>}
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">{selectedDevice.model}</span>
            <span className="font-semibold text-white">
              {selectedDevice.hourly_fee}₺/saat · {selectedDevice.daily_fee}₺/gün
            </span>
          </div>
          <Button onClick={() => setContinueMessage("Rezervasyon akışı bir sonraki adımda eklenecek.")}>
            Devam Et
          </Button>
        </div>
      )}
    </div>
  );
}

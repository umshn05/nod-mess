import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { getReservation, validateCheckin } from "../lib/api";
import LoadingState from "../components/LoadingState";
import Button from "../components/Button";

// MOCK: Gerçek bir kiosk/dolap açma mekanizması yok. Normalde kullanıcı bu
// QR kodu kiosktaki bir okuyucuya okutur; burada "Teslim Aldım" butonuna
// basmak, o taramayı simüle ediyor.
export default function QrCheckin() {
  const { reservationId } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getReservation(reservationId)
      .then((data) => {
        if (cancelled) return;
        setReservation(data);
        setStatus("success");
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reservationId]);

  async function handleSimulateScan() {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const rental = await validateCheckin(reservation.checkin_token);
      navigate(`/kiralama/${rental.id}`);
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

      {status === "loading" && <LoadingState text="QR kod hazırlanıyor..." />}

      {status === "error" && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          {errorMessage}
        </div>
      )}

      {status === "success" && reservation && (
        <>
          <h2 className="mt-3 text-xl font-bold text-white">Cihazı Teslim Al</h2>
          <p className="mt-1 text-sm text-muted">
            Bu QR kodu lokasyondaki kiosk'a okut, cihaz otomatik açılsın.
          </p>

          <div className="mt-6 flex justify-center">
            <div className="rounded-2xl bg-white p-4">
              <QRCodeSVG value={reservation.checkin_token} size={200} />
            </div>
          </div>

          {errorMessage && <p className="mt-3 text-center text-sm text-red-400">{errorMessage}</p>}

          <div className="mt-8">
            <Button onClick={handleSimulateScan} disabled={submitting}>
              {submitting ? "Doğrulanıyor..." : "Teslim Aldım (QR Tarat)"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

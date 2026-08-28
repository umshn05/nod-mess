import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReservation, confirmPayment } from "../lib/api";
import LoadingState from "../components/LoadingState";
import Card from "../components/Card";
import Button from "../components/Button";

// MOCK: Gerçek bir ödeme sağlayıcısı entegrasyonu yok; kart bilgisi alınmaz,
// "Ödemeyi Onayla" butonu backend'deki mock confirm-payment endpoint'ini çağırır.
export default function PaymentMock() {
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

  async function handleConfirm() {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await confirmPayment(reservationId);
      navigate(`/qr/${reservationId}`);
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

      {status === "loading" && <LoadingState text="Rezervasyon getiriliyor..." />}

      {status === "error" && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          {errorMessage}
        </div>
      )}

      {status === "success" && reservation && (
        <>
          <h2 className="mt-3 text-xl font-bold text-white">Ödeme</h2>
          <p className="mt-1 text-sm text-muted">
            Bu bir demo ortamıdır, gerçek bir kart tahsilatı yapılmaz.
          </p>

          <Card className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Tahmini Tutar</span>
              <span className="text-lg font-bold text-white">
                {reservation.price_snapshot.estimated_total}₺
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-muted">Depozito</span>
              <span className="text-sm font-medium text-white">
                {reservation.price_snapshot.deposit}₺
              </span>
            </div>
          </Card>

          <div className="mt-4 rounded-xl border border-dashed border-border bg-surface p-4 text-center text-sm text-muted">
            💳 •••• •••• •••• 4242 (mock kart)
          </div>

          {errorMessage && <p className="mt-3 text-sm text-red-400">{errorMessage}</p>}

          <div className="mt-6">
            <Button onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Onaylanıyor..." : "Ödemeyi Onayla"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

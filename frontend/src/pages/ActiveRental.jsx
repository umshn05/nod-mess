import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRentalStatus, returnRental } from "../lib/api";
import LoadingState from "../components/LoadingState";
import Card from "../components/Card";
import Button from "../components/Button";

function formatElapsed(seconds) {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [hours, minutes, secs].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function ActiveRental() {
  const { rentalId } = useParams();
  const navigate = useNavigate();

  const [rentalStatus, setRentalStatus] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [returning, setReturning] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    async function poll() {
      try {
        const data = await getRentalStatus(rentalId);
        setRentalStatus(data);
        setStatus("success");
      } catch (err) {
        setErrorMessage(err.message);
        setStatus("error");
      }
    }

    poll();
    intervalRef.current = setInterval(poll, 2000);
    return () => clearInterval(intervalRef.current);
  }, [rentalId]);

  async function handleReturn() {
    setReturning(true);
    setErrorMessage(null);
    try {
      clearInterval(intervalRef.current);
      const data = await returnRental(rentalId);
      setReceipt(data);
    } catch (err) {
      setErrorMessage(err.message);
      setReturning(false);
    }
  }

  if (receipt) {
    return (
      <div className="px-4 pb-28 pt-4">
        <h2 className="mt-3 text-xl font-bold text-white">İade Tamamlandı</h2>
        <p className="mt-1 text-sm text-muted">Cihaz başarıyla iade edildi. Makbuzun:</p>

        <Card className="mt-4">
          <p className="text-xs text-muted">Makbuz No</p>
          <p className="font-mono text-sm text-white">{receipt.receipt_id}</p>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted">Kullanım Süresi</span>
            <span className="text-white">{receipt.duration_minutes} dakika</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted">Saatlik Ücret</span>
            <span className="text-white">{receipt.hourly_fee}₺</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="font-semibold text-white">Toplam Tutar</span>
            <span className="text-lg font-bold text-lime">{receipt.total_amount}₺</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted">İade Edilen Depozito</span>
            <span className="text-white">{receipt.deposit_refunded}₺</span>
          </div>
        </Card>

        <div className="mt-6">
          <Button onClick={() => navigate("/")}>Ana Sayfaya Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-28 pt-4">
      <h2 className="mt-3 text-xl font-bold text-white">Aktif Kiralama</h2>

      {status === "loading" && <LoadingState text="Kiralama durumu getiriliyor..." />}

      {status === "error" && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          {errorMessage}
        </div>
      )}

      {status === "success" && rentalStatus && (
        <>
          <Card className="mt-4 text-center">
            <p className="text-sm text-muted">Geçen Süre</p>
            <p className="mt-2 font-mono text-4xl font-bold text-lime">
              {formatElapsed(rentalStatus.elapsed_seconds)}
            </p>
            <p className="mt-4 text-sm text-muted">Oluşan Ücret</p>
            <p className="mt-1 text-2xl font-bold text-white">{rentalStatus.current_cost}₺</p>
            <p className="mt-1 text-xs text-muted">{rentalStatus.hourly_fee}₺/saat</p>
          </Card>

          {errorMessage && <p className="mt-3 text-sm text-red-400">{errorMessage}</p>}

          <div className="mt-6">
            <Button onClick={handleReturn} disabled={returning}>
              {returning ? "İade ediliyor..." : "Cihazı İade Et"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

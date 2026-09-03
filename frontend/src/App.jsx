import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import MapList from "./pages/MapList";
import LocationDetail from "./pages/LocationDetail";
import ReservationSummary from "./pages/ReservationSummary";
import PaymentMock from "./pages/PaymentMock";
import QrCheckin from "./pages/QrCheckin";
import ActiveRental from "./pages/ActiveRental";
import Kiralamalarim from "./pages/Kiralamalarim";

export default function App() {
  return (
    <BrowserRouter>
      <div className="mx-auto min-h-screen max-w-md bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/harita" element={<MapList />} />
          <Route path="/lokasyon/:id" element={<LocationDetail />} />
          <Route path="/rezervasyon/:locationId/:deviceId" element={<ReservationSummary />} />
          <Route path="/odeme/:reservationId" element={<PaymentMock />} />
          <Route path="/qr/:reservationId" element={<QrCheckin />} />
          <Route path="/kiralama/:rentalId" element={<ActiveRental />} />
          <Route path="/kiralamalarim" element={<Kiralamalarim />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import MapList from "./pages/MapList";
import LocationDetail from "./pages/LocationDetail";
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  return (
    <BrowserRouter>
      <div className="mx-auto min-h-screen max-w-md bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/harita" element={<MapList />} />
          <Route path="/lokasyon/:id" element={<LocationDetail />} />
          <Route path="/kiralamalarim" element={<ComingSoon title="Kiralamalarım" />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

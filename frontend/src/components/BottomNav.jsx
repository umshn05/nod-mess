import { NavLink } from "react-router-dom";

// Mobil-first alt navigasyon çubuğu. Tek elle kolay erişim için ekranın altına sabitlenir.
const NAV_ITEMS = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/harita", label: "Harita" },
  { to: "/kiralamalarim", label: "Kiralamalarım" },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-md justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 rounded-lg px-2 py-2 text-center text-xs font-medium transition ${
                isActive ? "text-lime" : "text-muted hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

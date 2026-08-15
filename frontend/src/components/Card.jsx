// Koyu temaya uygun, hafif kenarlıklı temel kart bileşeni.

export default function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-border bg-surface p-4 ${onClick ? "cursor-pointer active:scale-[0.99] transition" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

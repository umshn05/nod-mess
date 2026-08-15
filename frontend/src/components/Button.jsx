// Uygulama genelinde kullanılan tek elle dokunmaya uygun (büyük hedef alanlı) buton.
// variant="primary" -> lime yeşili dolgu, variant="secondary" -> çerçeveli/şeffaf

const VARIANT_CLASSES = {
  primary: "bg-lime text-black hover:bg-lime-dark active:scale-[0.98]",
  secondary: "bg-surface-alt text-white border border-border hover:bg-surface active:scale-[0.98]",
};

export default function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`w-full rounded-xl px-4 py-3 font-semibold transition disabled:opacity-40 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

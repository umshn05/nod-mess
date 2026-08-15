// Üst başlık çubuğu: uygulama logosu/adı. Tüm sayfalarda sabit şekilde kullanılır.

export default function Header({ title = "NOD MESS" }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/90 px-4 py-4 backdrop-blur">
      <span className="h-2.5 w-2.5 rounded-full bg-lime shadow-[0_0_8px_theme(colors.lime.DEFAULT)]" />
      <h1 className="text-lg font-bold tracking-tight text-white">{title}</h1>
    </header>
  );
}

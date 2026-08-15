// Henüz geliştirilmemiş ekranlar için geçici yer tutucu (örn. Harita, Kiralamalarım).

export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-24 text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm text-muted">Bu ekran yakında eklenecek.</p>
    </div>
  );
}

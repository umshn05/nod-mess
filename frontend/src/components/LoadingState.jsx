// Veri yüklenirken gösterilen basit dönen ikon + metin bileşeni.

export default function LoadingState({ text = "Yükleniyor..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-lime" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

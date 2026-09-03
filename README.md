# NOD MESS

Elektrikli araç kullanıcılarının AVM/otopark gibi lokasyonlarda taşınabilir
şarj cihazı kiralayabildiği bir platformun **mobil-web demo/MVP'si**.

Gerçek bir backend ve veritabanına bağlı, uçtan uca çalışan bir demo.
Lokasyon/cihaz verisi, rezervasyon durumu ve fiyat hesabı gerçek veriye
dayalı çalışır; sadece fiziksel altyapı gerektiren üç adım simüle edilir
(aşağıya bakınız).

## İçindekiler

- [Mock (Simüle) Edilen Kısımlar](#mock-simüle-edilen-kısımlar)
- [Mimari](#mimari)
- [Klasör Yapısı](#klasör-yapısı)
- [Veri Modeli](#veri-modeli)
- [API Endpoint'leri](#api-endpointleri)
- [Kullanıcı Akışı](#kullanıcı-akışı)
- [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)

## Mock (Simüle) Edilen Kısımlar

Gerçek altyapı olmadığı için üç adım demo ortamında simüle edilir:

| Adım | Gerçekte | Bu demoda |
|---|---|---|
| Ödeme | Kart tahsilatı | Otomatik "başarılı" döner, gerçek ödeme sağlayıcısı yok |
| Kiosk / fiziksel cihaz | Dolap fiziksel olarak açılır | QR doğrulaması yazılımsal olarak simüle edilir |
| SMS / OTP | Gerçek SMS gönderimi | Doğrulama kodu ekranda gösterilir |

Kodda bu kısımlar `# MOCK: ...` yorumuyla işaretlenmiştir.

Bunların dışındaki her şey gerçektir: lokasyon/cihaz verisi MongoDB'den
gelir, rezervasyon durum makinesi gerçek state olarak saklanır, fiyat
hesabı gerçek yapılır, kiralama süresi gerçek zamanlı sayılır.

## Mimari

Basit bir monorepo: `/backend` ve `/frontend`, ayrı workspace tooling
gerekmeden aynı repo içinde.

```
Tarayıcı (React/Vite, :5173)
        │  REST (fetch)
        ▼
FastAPI backend (:8000)
        │  Motor (async driver)
        ▼
MongoDB (yerelde geliştirme / MongoDB Atlas)
```

**Backend:** Python + FastAPI + Pydantic modelleri, Motor ile MongoDB'ye
async bağlantı. Bağlantı bilgisi `.env` dosyasından okunur; yerel
geliştirmeden Atlas'a geçiş sadece `MONGODB_URI` değerini değiştirmekle
yapılabilir.

**Frontend:** React (Vite) + Tailwind CSS (koyu tema, elektrik limon
yeşili aksiyon rengi) + Zustand (state yönetimi) + React Router.
Harita için Leaflet + OpenStreetMap, QR üretimi için `qrcode.react`,
PWA desteği için `vite-plugin-pwa`.

| Katman | Teknoloji |
|---|---|
| Backend | FastAPI, Pydantic, Motor (MongoDB async driver) |
| Veritabanı | MongoDB |
| Frontend | React 19 (Vite), Tailwind CSS 3, Zustand, React Router 7 |
| Harita | Leaflet + OpenStreetMap (API key gerektirmez) |
| QR | qrcode.react |
| PWA | vite-plugin-pwa |

## Klasör Yapısı

```
backend/
  app/
    db/          # MongoDB bağlantısı
    models/      # Pydantic modelleri (Location, Device, Reservation, Rental)
    routers/     # Endpoint'ler (locations, reservations, checkin, rentals)
  main.py        # FastAPI giriş noktası
  seed.py        # Demo veri script'i
  requirements.txt

frontend/
  src/
    components/  # Button, Card, Header, BottomNav, LocationMap, DeviceCard...
    pages/       # Home, MapList, LocationDetail, ReservationSummary,
                 # PaymentMock, QrCheckin, ActiveRental, Kiralamalarim
    store/       # Zustand store'ları
    lib/         # API istemcisi, demo kullanıcı id'si
```

## Veri Modeli

- **Location** — lokasyon (AVM/otopark), koordinatlar, çalışma saatleri, durum
- **Device** — taşınabilir şarj cihazı; güç sınıfı, konnektör tipi, saatlik/günlük ücret, depozito, durum (`available`/`reserved`/`checked_out`/`maintenance`)
- **Reservation** — rezervasyon; zaman aralığı, fiyat anlık görüntüsü (price snapshot), durum makinesi:

  ```
  RESERVED → CHECKIN_PENDING → ACTIVE → COMPLETED
      │             │
      └─────────────┴──→ CANCELLED
  ```
- **Rental** — check-in sonrası oluşan aktif kiralama kaydı; başlangıç/iade zamanı, durum

## API Endpoint'leri

Tüm endpoint'ler Swagger üzerinden test edilebilir: `http://localhost:8000/docs`

**Lokasyonlar**
- `GET /locations/nearby?lat=&lng=&radius_km=` — yakındaki lokasyonlar, mesafeye göre sıralı
- `GET /locations/{id}` — lokasyon detayı
- `GET /locations/{id}/availability` — toplam/müsait cihaz sayısı
- `GET /locations/{id}/devices` — lokasyondaki tüm cihazlar

**Rezervasyon**
- `POST /reservations` — yeni rezervasyon oluşturur, cihazı rezerve eder
- `GET /reservations?user_id=` — kullanıcının rezervasyon geçmişi
- `GET /reservations/{id}` — rezervasyon detayı
- `POST /reservations/{id}/confirm-payment` — **MOCK** ödeme onayı, check-in token üretir
- `POST /reservations/{id}/cancel` — rezervasyonu iptal eder
- `GET /reservations/{id}/rental` — rezervasyona bağlı kiralama kaydı

**Check-in**
- `POST /checkin/validate` — **MOCK** QR doğrulama, rezervasyonu aktive eder

**Kiralama**
- `GET /rentals/{id}/status` — canlı süre/ücret sayacı
- `POST /rentals/{id}/return` — cihazı iade eder, nihai ücret ve makbuz döner

## Kullanıcı Akışı

1. Ana Sayfa — konum izni / yakındaki lokasyonlar
2. Harita &amp; Liste — pin'ler, müsaitlik, filtreler
3. Lokasyon Detayı — müsait cihazlar
4. Cihaz &amp; Fiyat Seçimi — tarife gösterimi
5. Rezervasyon Özeti — süre seçimi, gerçek rezervasyon oluşturma
6. Mock Ödeme Onayı
7. QR Ekranı — check-in simülasyonu
8. Aktif Kiralama — canlı süre/ücret sayacı
9. İade — ücret kırılımı ve makbuz
10. Kiralamalarım — geçmiş/devam eden rezervasyonlar, iptal

## Kurulum ve Çalıştırma

Proje sadece yerel ortamda (localhost) çalışacak şekilde tasarlandı,
deploy/production config'i içermez.

### Ön koşullar

- Python 3.11+
- Node.js 18+
- Çalışan bir MongoDB (yerel kurulum veya [MongoDB Atlas](https://www.mongodb.com/atlas) ücretsiz cluster)

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

copy .env.example .env
# .env içindeki MONGODB_URI'yi kendi MongoDB bağlantı adresinle güncelle

python seed.py          # demo verisini yükler
uvicorn main:app --reload --port 8000
```

Swagger arayüzü: http://localhost:8000/docs

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Uygulama: http://localhost:5173

Backend ayakta değilse frontend'deki listeler boş/hatalı gelir; ikisinin
de aynı anda çalışıyor olması gerekir.

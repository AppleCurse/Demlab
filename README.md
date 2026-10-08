# DEMLAB - WhatsApp Satış Ajanı 🪵

Gece 22:00-03:00 çalışan, Meta uyumlu, telefon bağlamalı ajan.

## Kurulum
1. `npm install`
2. `.env` dosyasını doldur
3. `npm run dev`

## Env
```
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_ID=...
VERIFY_TOKEN=Demlab2024
OPENAI_API_KEY=...
ADMIN_PASSWORD=Demlab2024!
```

## Deploy
- Vercel / Render'a GitHub bağla
- Webhook URL: https://senin-domain.com/webhook
- WhatsApp Cloud API'de webhook'u doğrula

## Akış
- Gelen mesaj -> agent.js -> ürün bilgisi + stok kontrol -> sipariş kapatma
- Gece modu: 22:00-07:00 arası kısa, samimi, kapamaya odaklı
- Gündüz modu: Daha resmi, bilgi odaklı

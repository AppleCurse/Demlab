import axios from 'axios';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

const PRODUCTS = {
  kit_anason: { name: 'Anason Fermantasyon Kiti', price: 699, stok: 120, icerik: 'maya, anason aroması, ölçü kabı, tarif' },
  kit_mese: { name: 'Meşe Fermantasyon Kiti', price: 749, stok: 85, icerik: 'maya, meşe aroması, ölçü kabı, tarif' },
  bidon_bos: { name: 'Cam Bidon 5LT Boş', price: 650, stok: 200 },
  baz_5lt: { name: 'Fermantasyon Baz Sıvısı 5LT %96 Teknik', price: 1499, stok: 60 }
};

function isNightMode() {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7;
}

function getSystemPrompt() {
  const night = isNightMode();
  return `
Sen DEMLAB satış ajanısın. Ürün: Fermantasyon kitleri (alkol yok). Asla "etil alkol satıyorum" deme. "Fermantasyon baz sıvısı, botanik kit, aroma" de.

Ürünler: ${JSON.stringify(PRODUCTS)}

Görev: Hızlıca siparişe getir.
Ton: ${night ? 'Gece 01:00 samimi, usta dili, kısa, direkt kapamaya odaklı. "Ustam, yarın kargoda, hafta sonu hazır" gibi.' : 'Gündüz profesyonel, bilgilendirici.'}

Akış:
1. Hangi kit? (1-Anason 2-Meşe)
2. Bidon var mı? Boş cam bidon lazım mı?
3. Adres al, kargo (Aras 89TL), ödeme linki at.

Yasak kelimeler: rakı yap, içki yap, alkol sat. Yerine: fermantasyon, aroma, demlab kiti.

Gece ise 2 soruda kapatmaya çalış.
`;
}

export async function handleMessage(from, text) {
  const lower = text.toLowerCase();
  
  // Basit akış - LLM ile genişletilecek
  let reply = '';
  
  if (lower.includes('merhaba') || lower.includes('selam') || lower === '1' || lower === '2') {
    if (isNightMode()) {
      reply = `Selam ustam 🪵 tam zamanı! Hangisi olsun?

1️⃣ Anason Kit - 699 TL
2️⃣ Meşe Kit - 749 TL
3️⃣ Anason + Boş Cam Bidon - 1299 TL

Numara yazman yeterli, yarın kargoya verelim.`;
    } else {
      reply = `Merhaba! DEMLAB Fermantasyon Kitleri 🪵

Size nasıl yardımcı olayım?
1- Anason Kit 699 TL
2- Meşe Kit 749 TL
3- Cam Bidon 5LT 650 TL

Detay için numara yazın.`;
    }
  } else if (lower.includes('fiyat') || lower.includes('ne kadar')) {
    reply = `Kitlerimizde alkol bulunmaz, sadece aroma+maya+ekipman:
Anason 699TL, Meşe 749TL
Boş Cam Bidon 650TL, Baz Sıvı 5LT 1499TL

Full set (kit+bidon) 1299TL en çok tercih edilen. Hangisini hazırlayayım?`;
  } else if (lower.includes('kargo')) {
    reply = `Aras Kargo 89TL, yarın kargoda. İstanbul içi ertesi gün, diğer iller 1-2 gün. Adresini atarsan hemen oluşturayım?`;
  } else {
    try {
      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: getSystemPrompt() },
          { role: 'user', content: text }
        ],
      });
      reply = completion.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API Hatası:', error);
      reply = `Anladım ustam, hangisi olsun? 1-Anason 2-Meşe yazman yeterli, adresi alıp hemen kargoya vereyim. ${isNightMode() ? 'Gece siparişleri sabah ilk kargoda çıkıyor 🌙' : ''}`;
    }
  }

  await sendWhatsApp(from, reply);
}

async function sendWhatsApp(to, text) {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
  try {
    await axios.post(url, {
      messaging_product: 'whatsapp',
      to,
      text: { body: text }
    }, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
    });
    console.log(`Gönderildi -> ${to}`);
  } catch (e) {
    console.error('WA HATA', e.response?.data || e.message);
  }
}

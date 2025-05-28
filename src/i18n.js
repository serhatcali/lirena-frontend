import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  tr: {
    translation: {
      "token_viewer": "Token Görüntüleyici",
      "account": "Hesap",
      "token": "Token",
      "total_supply": "Toplam Arz",
      "balance": "Bakiye",
      "recipient": "Alıcı Adresi",
      "amount": "Miktar",
      "send": "Gönder",
      "sending": "Gönderiliyor...",
      "tx_history": "İşlem Geçmişi",
      "summary": "Özet",
      "outgoing": "Giden",
      "incoming": "Gelen",
      "details": "Detay",
      "no_tx": "İşlem bulunamadı.",
      "footer": "Tüm hakları saklıdır.",
      "transfer_success": "✅ Transfer başarılı. Tx: ",
      "transfer_failed": "❌ Transfer başarısız. ",
      "invalid_address": "❌ Geçersiz adres girildi.",
      "invalid_amount": "❌ Lütfen geçerli bir miktar girin.",
      "missing_fields": "⚠ Lütfen gerekli tüm alanları doldurun.",
      "token_fetch_failed": "❌ Token verileri alınamadı.",
      "close": "Kapat",
      "qr_warning": "⚠ Bu QR kodu sadece alım işlemleri için kullanılmalıdır. Yalnızca TRON ağından gönderim yapınız.",
      "share": "Paylaş",
      "copied": "Panoya kopyalandı",
      "share_failed": "Paylaşım başarısız"
    }
  },
  en: {
    translation: {
      "token_viewer": "Token Viewer",
      "account": "Account",
      "token": "Token",
      "total_supply": "Total Supply",
      "balance": "Balance",
      "recipient": "Recipient",
      "amount": "Amount",
      "send": "Send",
      "sending": "Sending...",
      "tx_history": "Transaction History",
      "summary": "Summary",
      "outgoing": "Outgoing",
      "incoming": "Incoming",
      "details": "Details",
      "no_tx": "No transactions found.",
      "footer": "All rights reserved.",
      "transfer_success": "✅ Transfer successful. Tx: ",
      "transfer_failed": "❌ Transfer failed. ",
      "invalid_address": "❌ Invalid address provided.",
      "invalid_amount": "❌ Please enter a valid amount.",
      "missing_fields": "⚠ Please fill in all required fields.",
      "token_fetch_failed": "❌ Failed to fetch token data.",
      "close": "Close",
      "qr_warning": "⚠ This QR code is for receiving only. Send from TRON network only.",
      "share": "Share",
      "copied": "Copied to clipboard",
      "share_failed": "Sharing failed"
    }
  }
};


i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;

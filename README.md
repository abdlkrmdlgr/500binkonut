# 🏡 TOKİ Başvuru Uygunluk Kontrolü

Bu proje, **500 Bin Sosyal Konut Projesi** için başvuru yapabilme uygunluğunu kontrol eden bir karar ağacı sistemidir.
💡 Bu proje bilgilendirme amaçlıdır. Kesin uygunluk için resmi başvuru yapmanız gerekmektedir. Hak kaybına uğramamanız için lütfen ilgili başkanlığın sayfasını inceleyiniz

## 📋 Özellikler

- ✅ Tüm başvuru şartlarını otomatik kontrol eder
- ✅ Gelir sınırlarını kontrol eder (İstanbul: 145.000 TL, Diğer İller: 127.000 TL)
- ✅ İkamet şartlarını kontrol eder
- ✅ Özel kategorilere göre uygunluğu belirler:
  - Şehit Aileleri, Gazi ve Maluller (%5)
  - Engelli Vatandaşlar (%5)
  - Emekli Vatandaşlar (%20)
  - 3 ve Daha Fazla Çocuğa Sahip Aileler (%10)
  - 18-30 Yaş Arası Gençler (%20)
  - Diğer Alıcı Adayları (%40)
- ✅ Web arayüzü ile kullanıcı dostu kontrol
- ✅ Komut satırı versiyonu

## 🚀 Kullanım

### Web Arayüzü (Önerilen)

1. `index.html` dosyasını bir web tarayıcısında açın
2. Formu doldurun
3. "Başvuru Uygunluğunu Kontrol Et" butonuna tıklayın
4. Sonuçları görüntüleyin

### Python Komut Satırı Versiyonu

```bash
python3 basvuru_kontrol.py
```

Program size sorular soracak ve cevaplarınıza göre uygunluk durumunuzu belirleyecektir.

## 📁 Dosya Yapısı

- `gereksinim.md` - TOKİ başvuru gereksinimleri dokümantasyonu
- `basvuru_kontrol.py` - Python komut satırı versiyonu
- `index.html` - Web arayüzü
- `basvuru_kontrol_web.js` - Web versiyonu JavaScript kodu
- `README.md` - Bu dosya

## 🔍 Kontrol Edilen Şartlar

### Genel Şartlar
- ✅ Yaş (18 yaş, Şehit/Gazi hariç)
- ✅ Vatandaşlık süresi (10 yıl)
- ✅ Yurt dışında yaşama kontrolü
- ✅ Yapı kullanım belgesi kontrolü
- ✅ Önceki TOKİ başvuruları
- ✅ Önceki sosyal konut projeleri
- ✅ Konut sahibi olma durumu
- ✅ Konut değeri sınırı (1 milyon TL)

### Gelir Kontrolü
- ✅ İstanbul: Max 145.000 TL/ay
- ✅ Diğer İller: Max 127.000 TL/ay

### İkamet Kontrolü
- ✅ 1 yıl ikamet şartı
- ✅ Deprem bölgesi özel durumu
- ✅ Emekli kategorisi için ikamet/nerelilik

### Kategori Kontrolü
- ✅ Şehit/Gazi (konut ve gelir şartı yok)
- ✅ Engelli (%40 ve üzeri)
- ✅ Emekli
- ✅ Çocuklu aileler (3+ çocuk, 19.12.2007 sonrası)
- ✅ Genç (18-30 yaş, 10/11/1995 sonrası doğum)
- ✅ Diğer

## ⚠️ Önemli Notlar

- Bu araç **bilgilendirme amaçlıdır**
- Kesin uygunluk için resmi başvuru yapmanız gerekmektedir
- Başvuru tarihleri: **10.11.2025 - 19.12.2025**
- Başvuru bedeli: **5.000 TL** (Şehit yakını ve terör malullerinden alınmaz)

## 📞 Başvuru Kanalları

- T.C. Ziraat Bankası A.Ş. yetkili şubeleri
- T. Halk Bankası A.Ş. yetkili şubeleri
- T. Emlak Katılım Bankası A.Ş. yetkili şubeleri
- e-Devlet

## 🛠️ Geliştirme

Python scripti için gerekli kütüphaneler:
- Python 3.x (standart kütüphaneler yeterli)

Web versiyonu için:
- Modern bir web tarayıcısı
- İnternet bağlantısına gerek yok (offline çalışır)

## 📝 Lisans

Bu proje bilgilendirme amaçlıdır. TOKİ resmi bilgilerine göre hazırlanmıştır. Resmi bir sorgulama değildir. Daha doğru bigiler için lütfen ilgili başkanlığın sayfasını kontrol ediniz.


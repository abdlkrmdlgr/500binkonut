#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TOKİ Başvuru Uygunluk Kontrolü - Karar Ağacı
Bu script, kullanıcının TOKİ başvurusu yapıp yapamayacağını kontrol eder.
"""

from datetime import datetime
from typing import Dict, List, Optional, Tuple

# Deprem bölgesi illeri
DEPREM_BOLGESI_ILLERI = [
    "Adana", "Adıyaman", "Diyarbakır", "Elazığ", "Gaziantep", 
    "Hatay", "Kahramanmaraş", "Kilis", "Malatya", "Osmaniye", "Şanlıurfa"
]

# Kategoriler
KATEGORILER = {
    "sehît_gazi": {
        "isim": "Şehit Aileleri, Terör, Harp, Vazife Malulleri ve Gazi",
        "oran": "%5",
        "konut_tipleri": ["2+1 (65 m²)"],
        "ek_sart": "Konut ve gelir şartı aranmaz. Yaş sınırı yoktur."
    },
    "engelli": {
        "isim": "En Az %40 Engelli Vatandaşlar",
        "oran": "%5",
        "konut_tipleri": ["2+1 (65 m²)"],
        "ek_sart": "Engelli çocukları olan ebeveynler bu kategoriden başvuru yapamaz."
    },
    "emekli": {
        "isim": "Emekli Vatandaşlar",
        "oran": "%20",
        "konut_tipleri": ["1+1 (55 m²)", "2+1 (65 m²)"],
        "ek_sart": "Proje ilinde 1 yıl ikamet VEYA nüfusa kayıtlı olma şartı."
    },
    "cocuklu_aileler": {
        "isim": "3 ve Daha Fazla Çocuğa Sahip Aileler",
        "oran": "%10",
        "konut_tipleri": ["2+1 (65 m²)", "2+1 (80 m²)"],
        "ek_sart": "19.12.2007 tarihinden sonra doğan 18 yaşından küçük en az 3 çocuk."
    },
    "genc": {
        "isim": "Yaşı 18-30 Arasında Olan Genç Vatandaşlar",
        "oran": "%20",
        "konut_tipleri": ["1+1 (55 m²)", "2+1 (65 m²)"],
        "ek_sart": "10/11/1995 ve sonrasında doğan. Anne-baba dahil konut şartı var."
    },
    "diger": {
        "isim": "Diğer Alıcı Adayları",
        "oran": "%40",
        "konut_tipleri": ["2+1 (65 m²)", "2+1 (80 m²)"],
        "ek_sart": ""
    }
}

class BasvuruKontrol:
    def __init__(self):
        self.sonuclar = []
        self.hata_nedenleri = []
        self.uygun_kategoriler = []
        
    def kontrol_et(self, bilgiler: Dict) -> Tuple[bool, List[str], List[str]]:
        """
        Başvuru uygunluğunu kontrol eder.
        
        Args:
            bilgiler: Kullanıcı bilgileri dictionary'si
            
        Returns:
            (uygun_mu, uygun_kategoriler, hata_nedenleri)
        """
        self.sonuclar = []
        self.hata_nedenleri = []
        self.uygun_kategoriler = []
        
        # 1. Genel Şart Kontrolleri
        if not self._genel_sartlar_kontrol(bilgiler):
            return False, [], self.hata_nedenleri
        
        # 2. Gelir Kontrolü
        if not self._gelir_kontrol(bilgiler):
            return False, [], self.hata_nedenleri
        
        # 3. İkamet Kontrolü
        if not self._ikamet_kontrol(bilgiler):
            return False, [], self.hata_nedenleri
        
        # 4. Kategori Belirleme
        self._kategori_belirle(bilgiler)
        
        if not self.uygun_kategoriler:
            self.hata_nedenleri.append("Hiçbir kategoriye uygun değilsiniz.")
            return False, [], self.hata_nedenleri
        
        return True, self.uygun_kategoriler, []
    
    def _genel_sartlar_kontrol(self, bilgiler: Dict) -> bool:
        """Genel başvuru şartlarını kontrol eder."""
        hata_var = False
        
        # Yaş kontrolü (Şehit/Gazi kategorisi hariç)
        yas = bilgiler.get("yas")
        dogum_tarihi = bilgiler.get("dogum_tarihi")
        
        if not bilgiler.get("sehît_gazi_mu"):
            if yas and yas < 18:
                self.hata_nedenleri.append(f"Yaş şartı: 18 yaşını doldurmuş olmalısınız. Şu anki yaşınız: {yas}")
                hata_var = True
            elif dogum_tarihi:
                try:
                    dogum = datetime.strptime(dogum_tarihi, "%d.%m.%Y")
                    bugun = datetime.now()
                    yas = (bugun - dogum).days // 365
                    if yas < 18:
                        self.hata_nedenleri.append(f"Yaş şartı: 18 yaşını doldurmuş olmalısınız. Şu anki yaşınız: {yas}")
                        hata_var = True
                except:
                    pass
        
        # Vatandaşlık süresi kontrolü
        vatandaslik_yili = bilgiler.get("vatandaslik_yili")
        if vatandaslik_yili:
            bugun = datetime.now()
            vatandaslik_suresi = bugun.year - vatandaslik_yili
            if vatandaslik_suresi < 10:
                self.hata_nedenleri.append(
                    f"Vatandaşlık süresi: En az 10 yıldır T.C. vatandaşı olmalısınız. "
                    f"Şu anki süreniz: {vatandaslik_suresi} yıl"
                )
                hata_var = True
        
        # Yurt dışında yaşama kontrolü
        if bilgiler.get("yurt_disi_ikamet"):
            self.hata_nedenleri.append(
                "Yurt dışında yaşayan T.C. vatandaşları başvuramaz "
                "(Türkiye'de ikamet şartını sağlamayanlar)."
            )
            hata_var = True
        
        # Yapı kullanım belgesi kontrolü
        if bilgiler.get("yapi_kullanim_belgesi_var"):
            self.hata_nedenleri.append("Yapı kullanım belgesi olanlar başvuramaz.")
            hata_var = True
        
        # Önceki TOKİ başvurusu kontrolü
        if bilgiler.get("onceki_toki_basvurusu"):
            self.hata_nedenleri.append(
                "Daha önce TOKİ ile sözleşme yapmış olanlar başvuramaz."
            )
            hata_var = True
        
        # Önceki sosyal konut projesi kontrolü
        if bilgiler.get("onceki_sosyal_konut_hak_sahibi"):
            self.hata_nedenleri.append(
                "Daha önceki Sosyal Konut Projelerinde/İlk Evim Arsa Projesinde "
                "asil/yedek hak sahibi olanlar başvuramaz. "
                "(İstenirse önceki başvuru iptal edilerek yeni projeye başvurulabilir)"
            )
            hata_var = True
        
        # Konut kontrolü
        konut_var = bilgiler.get("konut_var")
        konut_hisse_degeri = bilgiler.get("konut_hisse_degeri", 0)
        
        # Genç kategori için anne-baba dahil kontrol
        if bilgiler.get("kategori") == "genc":
            anne_baba_konut_var = bilgiler.get("anne_baba_konut_var", False)
            if konut_var or anne_baba_konut_var:
                # Bu kontrol kategori belirleme aşamasında yapılacak
                pass
        else:
            if konut_var:
                if konut_hisse_degeri > 1000000:
                    self.hata_nedenleri.append(
                        f"Tapuda kayıtlı gayrimenkulünüzün hisse değeri "
                        f"1 milyon TL'yi geçmemeli. Değeriniz: {konut_hisse_degeri:,} TL"
                    )
                    hata_var = True
                else:
                    self.hata_nedenleri.append(
                        "Kendiniz, eşiniz veya velayetiniz altındaki çocuklarınız üzerine "
                        "T.C. sınırları dâhilinde tapuda kayıtlı bağımsız konut bulunmamalı."
                    )
                    hata_var = True
        
        return not hata_var
    
    def _gelir_kontrol(self, bilgiler: Dict) -> bool:
        """Gelir sınırını kontrol eder."""
        # Şehit/Gazi kategorisi için gelir şartı yok
        if bilgiler.get("sehît_gazi_mu"):
            return True
        
        proje_ili = bilgiler.get("proje_ili", "")
        aylik_gelir = bilgiler.get("aylik_gelir", 0)
        
        if proje_ili.lower() == "istanbul":
            if aylik_gelir > 145000:
                self.hata_nedenleri.append(
                    f"Gelir sınırı (İstanbul): Aylık hane halkı net geliri "
                    f"en fazla 145.000 TL olmalı. Geliriniz: {aylik_gelir:,} TL"
                )
                return False
        else:
            if aylik_gelir > 127000:
                self.hata_nedenleri.append(
                    f"Gelir sınırı (Diğer İller): Aylık hane halkı net geliri "
                    f"en fazla 127.000 TL olmalı. Geliriniz: {aylik_gelir:,} TL"
                )
                return False
        
        return True
    
    def _ikamet_kontrol(self, bilgiler: Dict) -> bool:
        """İkamet şartını kontrol eder."""
        proje_ili = bilgiler.get("proje_ili", "")
        ikamet_ili = bilgiler.get("ikamet_ili", "")
        ikamet_ilce = bilgiler.get("ikamet_ilce", "")
        proje_ilce = bilgiler.get("proje_ilce", "")
        ikamet_suresi_ay = bilgiler.get("ikamet_suresi_ay", 0)
        nufusa_kayitli_il = bilgiler.get("nufusa_kayitli_il", "")
        
        # Deprem bölgesi kontrolü
        deprem_bolgesi = proje_ili in DEPREM_BOLGESI_ILLERI
        
        if deprem_bolgesi:
            # Deprem bölgesi için: ikamet VEYA nüfusa kayıtlı olma
            if ikamet_suresi_ay < 12 and nufusa_kayitli_il not in DEPREM_BOLGESI_ILLERI:
                self.hata_nedenleri.append(
                    f"Deprem bölgesi başvurusu için: Proje ilinde "
                    f"(ikamet edilen ilde) 1 yıldan az olmamak koşuluyla ikamet ediyor olmalı "
                    f"VEYA proje ili nüfusuna kayıtlı olmalısınız."
                )
                return False
        else:
            # Normal ikamet kontrolü
            if ikamet_suresi_ay < 12:
                self.hata_nedenleri.append(
                    f"İkamet şartı: Başvuru yapılacak yerde "
                    f"(il/ilçe/belde) başvuru döneminden geriye doğru "
                    f"1 yıldan az olmamak koşuluyla ikamet ediyor olmalısınız. "
                    f"İkamet süreniz: {ikamet_suresi_ay} ay"
                )
                return False
        
        # Emekli kategorisi için özel durum (ikamet VEYA nüfusa kayıtlı)
        if bilgiler.get("kategori") == "emekli":
            if ikamet_suresi_ay < 12 and nufusa_kayitli_il != proje_ili:
                self.hata_nedenleri.append(
                    f"Emekli kategorisi için: Proje ilinde 1 yıl ikamet "
                    f"VEYA proje ili nüfusuna kayıtlı olma şartı."
                )
                return False
        
        return True
    
    def _kategori_belirle(self, bilgiler: Dict):
        """Hangi kategorilere uygun olduğunu belirler."""
        self.uygun_kategoriler = []
        
        # Şehit/Gazi kontrolü
        if bilgiler.get("sehît_gazi_mu"):
            self.uygun_kategoriler.append(("sehît_gazi", KATEGORILER["sehît_gazi"]))
            return  # Bu kategori için konut/gelir şartı yok
        
        # Engelli kontrolü
        if bilgiler.get("engelli_orani", 0) >= 40:
            if not bilgiler.get("sadece_cocuk_engelli"):
                self.uygun_kategoriler.append(("engelli", KATEGORILER["engelli"]))
        
        # Emekli kontrolü
        if bilgiler.get("emekli_mu"):
            self.uygun_kategoriler.append(("emekli", KATEGORILER["emekli"]))
        
        # Çocuklu aile kontrolü
        cocuk_sayisi = bilgiler.get("cocuk_sayisi_uygun", 0)  # 19.12.2007 sonrası, 18 yaş altı
        if cocuk_sayisi >= 3:
            self.uygun_kategoriler.append(("cocuklu_aileler", KATEGORILER["cocuklu_aileler"]))
        
        # Genç kontrolü (10/11/1995 ve sonrası doğan)
        dogum_tarihi = bilgiler.get("dogum_tarihi")
        if dogum_tarihi:
            try:
                dogum = datetime.strptime(dogum_tarihi, "%d.%m.%Y")
                genc_sinir_tarihi = datetime(1995, 11, 10)
                if dogum >= genc_sinir_tarihi:
                    # Genç kategori için anne-baba dahil konut kontrolü
                    konut_var = bilgiler.get("konut_var", False)
                    anne_baba_konut_var = bilgiler.get("anne_baba_konut_var", False)
                    if not (konut_var or anne_baba_konut_var):
                        self.uygun_kategoriler.append(("genc", KATEGORILER["genc"]))
            except:
                pass
        
        # Diğer kategorisi (her zaman uygun)
        self.uygun_kategoriler.append(("diger", KATEGORILER["diger"]))


def interaktif_kontrol():
    """Kullanıcıdan bilgi alarak interaktif kontrol yapar."""
    print("=" * 60)
    print("🏡 TOKİ BAŞVURU UYGUNLUK KONTROLÜ")
    print("=" * 60)
    print()
    
    kontrol = BasvuruKontrol()
    bilgiler = {}
    
    # Temel bilgiler
    print("📋 TEMEL BİLGİLER")
    print("-" * 60)
    
    yas = input("Yaşınız: ").strip()
    if yas:
        bilgiler["yas"] = int(yas)
    
    dogum_tarihi = input("Doğum tarihiniz (GG.AA.YYYY formatında, örn: 15.05.1990): ").strip()
    if dogum_tarihi:
        bilgiler["dogum_tarihi"] = dogum_tarihi
    
    vatandaslik_yili = input("T.C. vatandaşı olduğunuz yıl: ").strip()
    if vatandaslik_yili:
        bilgiler["vatandaslik_yili"] = int(vatandaslik_yili)
    
    print()
    
    # İkamet bilgileri
    print("🏠 İKAMET BİLGİLERİ")
    print("-" * 60)
    
    bilgiler["ikamet_ili"] = input("İkamet ettiğiniz il: ").strip()
    bilgiler["ikamet_ilce"] = input("İkamet ettiğiniz ilçe: ").strip()
    
    ikamet_suresi = input("İkamet süreniz (ay cinsinden): ").strip()
    if ikamet_suresi:
        bilgiler["ikamet_suresi_ay"] = int(ikamet_suresi)
    
    bilgiler["proje_ili"] = input("Başvuru yapmak istediğiniz proje ili: ").strip()
    bilgiler["nufusa_kayitli_il"] = input("Nüfusa kayıtlı olduğunuz il: ").strip()
    
    print()
    
    # Konut bilgileri
    print("🏘️ KONUT BİLGİLERİ")
    print("-" * 60)
    
    konut_var_cevap = input("Kendiniz, eşiniz veya velayetiniz altındaki çocuklarınız üzerine tapuda kayıtlı konutunuz var mı? (E/H): ").strip().upper()
    bilgiler["konut_var"] = konut_var_cevap == "E"
    
    if bilgiler["konut_var"]:
        konut_deger = input("Konutunuzun hisse değeri (TL): ").strip()
        if konut_deger:
            bilgiler["konut_hisse_degeri"] = float(konut_deger.replace(",", ""))
    
    anne_baba_konut_cevap = input("Anne veya babanız üzerine tapuda kayıtlı konut var mı? (Sadece 18-30 yaş için) (E/H): ").strip().upper()
    bilgiler["anne_baba_konut_var"] = anne_baba_konut_cevap == "E"
    
    yapi_belgesi = input("Yapı kullanım belgeniz var mı? (E/H): ").strip().upper()
    bilgiler["yapi_kullanim_belgesi_var"] = yapi_belgesi == "E"
    
    print()
    
    # Gelir bilgileri
    print("💰 GELİR BİLGİLERİ")
    print("-" * 60)
    
    aylik_gelir = input("Aylık hane halkı net geliriniz (TL, son 12 ay ortalaması): ").strip()
    if aylik_gelir:
        bilgiler["aylik_gelir"] = float(aylik_gelir.replace(",", ""))
    
    print()
    
    # Özel durumlar
    print("⭐ ÖZEL DURUMLAR")
    print("-" * 60)
    
    sehît_gazi = input("Şehit yakını, terör/harp/vazife malulü veya gazi misiniz? (E/H): ").strip().upper()
    bilgiler["sehît_gazi_mu"] = sehît_gazi == "E"
    
    engelli_orani = input("Engellilik oranınız (%40 ve üzeri ise belirtin): ").strip()
    if engelli_orani:
        bilgiler["engelli_orani"] = int(engelli_orani)
    else:
        bilgiler["engelli_orani"] = 0
    
    sadece_cocuk_engelli = input("Sadece çocuklarınız engelli mi? (E/H): ").strip().upper()
    bilgiler["sadece_cocuk_engelli"] = sadece_cocuk_engelli == "E"
    
    emekli = input("Emekli misiniz? (E/H): ").strip().upper()
    bilgiler["emekli_mu"] = emekli == "E"
    
    cocuk_sayisi = input("19.12.2007 sonrası doğan, 18 yaş altı çocuk sayınız: ").strip()
    if cocuk_sayisi:
        bilgiler["cocuk_sayisi_uygun"] = int(cocuk_sayisi)
    
    print()
    
    # Diğer kontroller
    print("❓ DİĞER SORULAR")
    print("-" * 60)
    
    yurt_disi = input("Yurt dışında mı yaşıyorsunuz? (E/H): ").strip().upper()
    bilgiler["yurt_disi_ikamet"] = yurt_disi == "E"
    
    onceki_toki = input("Daha önce TOKİ ile sözleşme yaptınız mı? (E/H): ").strip().upper()
    bilgiler["onceki_toki_basvurusu"] = onceki_toki == "E"
    
    onceki_sosyal = input("Daha önce Sosyal Konut Projelerinde asil/yedek hak sahibi oldunuz mu? (E/H): ").strip().upper()
    bilgiler["onceki_sosyal_konut_hak_sahibi"] = onceki_sosyal == "E"
    
    print()
    print("=" * 60)
    print("🔍 KONTROL EDİLİYOR...")
    print("=" * 60)
    print()
    
    # Kontrolü yap
    uygun, kategoriler, hatalar = kontrol.kontrol_et(bilgiler)
    
    # Sonuçları göster
    if uygun:
        print("✅ BAŞVURU YAPABİLİRSİNİZ!")
        print()
        print("📋 UYGUN OLDUĞUNUZ KATEGORİLER:")
        print("-" * 60)
        for kategori_id, kategori_info in kategoriler:
            print(f"• {kategori_info['isim']}")
            print(f"  - Kontenjan: {kategori_info['oran']}")
            print(f"  - Konut Tipleri: {', '.join(kategori_info['konut_tipleri'])}")
            if kategori_info['ek_sart']:
                print(f"  - Ek Şart: {kategori_info['ek_sart']}")
            print()
    else:
        print("❌ BAŞVURU YAPAMAZSINIZ!")
        print()
        print("⚠️ UYGUNLUK ŞARTLARI:")
        print("-" * 60)
        for i, hata in enumerate(hatalar, 1):
            print(f"{i}. {hata}")
        print()
    
    print("=" * 60)
    print("💡 NOT: Bu sonuçlar bilgilendirme amaçlıdır.")
    print("   Kesin uygunluk için resmi başvuru yapmanız gerekmektedir.")
    print("=" * 60)


if __name__ == "__main__":
    interaktif_kontrol()


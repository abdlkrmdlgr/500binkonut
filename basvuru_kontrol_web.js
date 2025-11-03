// TOKİ Başvuru Kontrolü - Web Versiyonu

const DEPREM_BOLGESI_ILLERI = [
    "Adana", "Adıyaman", "Diyarbakır", "Elazığ", "Gaziantep", 
    "Hatay", "Kahramanmaraş", "Kilis", "Malatya", "Osmaniye", "Şanlıurfa"
];

const KATEGORILER = {
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
};

// Adım yönetimi
let currentStep = 1;
let allSteps = [];
let visibleSteps = [];

// Tüm adımları topla ve sırala
function initializeSteps() {
    allSteps = Array.from(document.querySelectorAll('.step')).map((step, index) => ({
        element: step,
        id: step.id,
        index: index + 1,
        isConditional: step.classList.contains('conditional'),
        condition: step.getAttribute('data-condition') || null
    }));
    
    updateVisibleSteps();
}

// Görünür adımları güncelle
function updateVisibleSteps() {
    visibleSteps = allSteps.filter(step => {
        if (!step.isConditional) return true;
        
        // Conditional step kontrolü
        const condition = step.condition;
        if (!condition) return true;
        
        // Format: "field:value" veya "field:min-max"
        const [field, value] = condition.split(':');
        
        if (field === 'vatandaslik_durumu') {
            const radio = document.querySelector(`input[name="${field}"]:checked`);
            return radio && radio.value === value;
        }
        
        if ((field === 'yas' || field === 'dogum_tarihi') && value.includes('-')) {
            const [min, max] = value.split('-').map(Number);
            // Yaş, doğum tarihinden hesaplanır
            const dogumTarihi = document.getElementById('dogum_tarihi')?.value;
            if (!dogumTarihi) return false;
            
            try {
                const [gun, ay, yil] = dogumTarihi.split('.');
                const dogum = new Date(yil, ay - 1, gun);
                const bugun = new Date();
                const yas = Math.floor((bugun - dogum) / (365.25 * 24 * 60 * 60 * 1000));
                return yas >= min && yas <= max;
            } catch (e) {
                return false;
            }
        }
        
        if (field === 'engelli_mi') {
            const radio = document.querySelector(`input[name="${field}"]:checked`);
            if (!radio) return false;
            // Sadece engelli_mi:evet ise step13b (engellilik oranı) gösterilmeli
            // step13b_conditional adımlı conditional step için kontrol
            if (step.id.includes('step13b')) {
                return radio.value === 'evet';
            }
            // Diğer adımlar için normal kontrol
            return true;
        }
        
        return true;
    });
}

function getCurrentVisibleStepIndex() {
    const currentElement = document.querySelector('.step.active');
    if (!currentElement) return 1;
    const index = visibleSteps.findIndex(s => s.element === currentElement);
    return index >= 0 ? index + 1 : 1;
}

function getTotalVisibleSteps() {
    return visibleSteps.length;
}

function showStep(stepNumber) {
    // Mevcut adımı bul
    const stepData = visibleSteps[stepNumber - 1];
    if (!stepData) return;
    
    // Tüm adımları gizle
    document.querySelectorAll('.step').forEach(s => {
        s.classList.remove('active');
    });
    
    // Seçili adımı göster
    stepData.element.classList.add('active');
    
    // İlerleme çubuğunu güncelle
    const totalVisible = getTotalVisibleSteps();
    const currentVisible = getCurrentVisibleStepIndex();
    const progress = (currentVisible / totalVisible) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('stepInfo').textContent = `Soru ${currentVisible} / ${totalVisible}`;
    
    // Butonları güncelle
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (currentVisible === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }
    
    if (currentVisible === totalVisible) {
        nextBtn.textContent = '✅ Kontrol Et';
    } else {
        nextBtn.textContent = 'İleri ➡️';
    }
    
    // Radio button seçimlerini görsel olarak göster
    updateRadioSelections();
    
    // Sayfanın en üstüne kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateRadioSelections() {
    document.querySelectorAll('.radio-option').forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        if (radio && radio.checked) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

// Radio button'lara tıklama olayı ekle
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.radio-option').forEach(option => {
        option.addEventListener('click', function(e) {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                updateRadioSelections();
                
                // Conditional step'leri kontrol et
                if (radio.name === 'vatandaslik_durumu' || radio.name === 'engelli_mi') {
                    updateVisibleSteps();
                    // Eğer son adıma geçildiyse, güncelle
                    const currentVisibleIndex = getCurrentVisibleStepIndex();
                    showStep(currentVisibleIndex);
                }
                
                // Konut durumu değiştiğinde konut değeri alanını göster/gizle
                if (radio.name === 'konut_var') {
                    const konutDegerGroup = document.getElementById('konut_deger_group');
                    if (radio.value === 'evet') {
                        konutDegerGroup.style.display = 'block';
                    } else {
                        konutDegerGroup.style.display = 'none';
                        document.getElementById('konut_hisse_degeri').value = '';
                    }
                }
            }
        });
    });
});

function nextStep() {
    // Mevcut adımın geçerliliğini kontrol et
    const currentStepElement = document.querySelector(`.step.active`);
    if (!currentStepElement) return;
    
    // Required alanları kontrol et
    const requiredInputs = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    for (const input of requiredInputs) {
        if (input.type === 'radio') {
            const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(r => r.checked);
            if (!isChecked) {
                isValid = false;
                input.focus();
                break;
            }
        } else {
            if (!input.value) {
                isValid = false;
                input.focus();
                break;
            }
        }
    }
    
    if (!isValid) {
        alert('Lütfen bu soruyu cevaplayın.');
        return;
    }
    
    // Özel kontroller
    const stepId = currentStepElement.id;
    
    // Konut durumu kontrolü
    if (stepId === 'step8' || stepId === 'step8_conditional') {
        const konutVar = document.querySelector('input[name="konut_var"]:checked');
        const konutDegerGroup = document.getElementById('konut_deger_group');
        if (konutVar && konutVar.value === 'evet') {
            konutDegerGroup.style.display = 'block';
            const degerInput = document.getElementById('konut_hisse_degeri');
            if (degerInput && !degerInput.value) {
                alert('Lütfen konut değerini girin.');
                degerInput.focus();
                return;
            }
        } else {
            konutDegerGroup.style.display = 'none';
        }
    }
    
    // Conditional step'leri güncelle
    updateVisibleSteps();
    
    // Sonraki adıma geç
    const currentVisibleIndex = getCurrentVisibleStepIndex();
    if (currentVisibleIndex < getTotalVisibleSteps()) {
        showStep(currentVisibleIndex + 1);
    } else {
        // Son adım - kontrolü yap
        kontrolEtVeGoster();
    }
}

function prevStep() {
    const currentVisibleIndex = getCurrentVisibleStepIndex();
    if (currentVisibleIndex > 1) {
        showStep(currentVisibleIndex - 1);
    }
}

// Form submit handler yerine adım butonları
document.getElementById('nextBtn').addEventListener('click', function(e) {
    e.preventDefault();
    nextStep();
});

document.getElementById('prevBtn').addEventListener('click', function(e) {
    e.preventDefault();
    prevStep();
});

// Doğum tarihi formatlaması - otomatik nokta ekleme
function formatDogumTarihi(value) {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    
    // Maksimum 8 rakam (GGAAYYYY)
    const limitedNumbers = numbers.slice(0, 8);
    
    // Formatı oluştur: GG.AA.YYYY
    let formatted = '';
    if (limitedNumbers.length > 0) {
        formatted = limitedNumbers.slice(0, 2); // Gün
        if (limitedNumbers.length > 2) {
            formatted += '.' + limitedNumbers.slice(2, 4); // Ay
        }
        if (limitedNumbers.length > 4) {
            formatted += '.' + limitedNumbers.slice(4, 8); // Yıl
        }
    }
    
    return formatted;
}

// Doğum tarihi değiştiğinde conditional step'leri kontrol et (18-30 yaş için anne-baba konut sorusu)
document.getElementById('dogum_tarihi')?.addEventListener('input', function(e) {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const oldValue = input.value;
    const newValue = formatDogumTarihi(oldValue);
    
    // Eğer değer değiştiyse güncelle
    if (oldValue !== newValue) {
        input.value = newValue;
        
        // Cursor pozisyonunu ayarla (nokta eklenirse cursor'ı ileri al)
        const addedChars = newValue.length - oldValue.length;
        const newCursorPosition = cursorPosition + addedChars;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
    }
    
    updateVisibleSteps();
});

// Engelli durumu değiştiğinde conditional step'leri kontrol et
document.querySelectorAll('input[name="engelli_mi"]').forEach(radio => {
    radio.addEventListener('change', function() {
        updateVisibleSteps();
    });
});

// Vatandaşlık durumu değiştiğinde
document.querySelectorAll('input[name="vatandaslik_durumu"]').forEach(radio => {
    radio.addEventListener('change', function() {
        updateVisibleSteps();
    });
});

// Enter tuşu ile ileri gitme
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextStep();
        }
    });
});

function genelSartlarKontrol(bilgiler) {
    const hatalar = [];
    
    // Yaş kontrolü (Şehit/Gazi hariç) - Doğum tarihinden hesaplanır
    const dogumTarihi = bilgiler.dogum_tarihi;
    
    if (bilgiler.sehît_gazi_mu !== 'evet') {
        if (dogumTarihi) {
            try {
                const [gun, ay, yil] = dogumTarihi.split('.');
                const dogum = new Date(yil, ay - 1, gun);
                const bugun = new Date();
                const yasHesaplanan = Math.floor((bugun - dogum) / (365.25 * 24 * 60 * 60 * 1000));
                if (yasHesaplanan < 18) {
                    hatalar.push(`Yaş şartı: 18 yaşını doldurmuş olmalısınız. Şu anki yaşınız: ${yasHesaplanan}`);
                }
            } catch (e) {
                hatalar.push("Doğum tarihi formatı hatalı. Lütfen GG.AA.YYYY formatında girin (örn: 15.05.1990)");
            }
        } else {
            hatalar.push("Doğum tarihi gereklidir.");
        }
    }
    
    // Vatandaşlık yılı kontrolü (Sadece Yabancı uyruklu vatandaşlar için)
    // TC vatandaşlarına vatandaşlık süresi/yılı sorulmaz
    if (bilgiler.vatandaslik_durumu === 'yabancu') {
        if (bilgiler.vatandaslik_yili) {
            const vatandaslikYili = parseInt(bilgiler.vatandaslik_yili);
            const bugun = new Date();
            const vatandaslikSuresi = bugun.getFullYear() - vatandaslikYili;
            if (vatandaslikSuresi < 10) {
                hatalar.push(
                    `Vatandaşlık süresi: En az 10 yıldır T.C. vatandaşı olmalısınız. ` +
                    `Şu anki süreniz: ${vatandaslikSuresi} yıl`
                );
            }
        } else {
            hatalar.push(
                "Vatandaşlık yılı: T.C. vatandaşı olduğunuz yılı belirtmelisiniz."
            );
        }
    }
    
    // Yurt dışında yaşama kontrolü
    if (bilgiler.yurt_disi_ikamet === 'evet') {
        hatalar.push(
            "Yurt dışında yaşayan T.C. vatandaşları başvuramaz " +
            "(Türkiye'de ikamet şartını sağlamayanlar)."
        );
    }
    
    // Yapı kullanım belgesi kontrolü
    if (bilgiler.yapi_kullanim_belgesi_var === 'evet') {
        hatalar.push("Yapı kullanım belgesi olanlar başvuramaz.");
    }
    
    // Önceki TOKİ başvurusu kontrolü
    if (bilgiler.onceki_toki_basvurusu === 'evet') {
        hatalar.push("Daha önce TOKİ ile sözleşme yapmış olanlar başvuramaz.");
    }
    
    // Önceki sosyal konut projesi kontrolü
    if (bilgiler.onceki_sosyal_konut_hak_sahibi === 'evet') {
        hatalar.push(
            "Daha önceki Sosyal Konut Projelerinde/İlk Evim Arsa Projesinde " +
            "asil/yedek hak sahibi olanlar başvuramazlar. " +
            "(İstenirse önceki başvuru iptal edilerek yeni projeye başvurulabilir)"
        );
    }
    
    // Konut kontrolü
    if (bilgiler.konut_var === 'evet') {
        const konutHisseDegeri = parseFloat(bilgiler.konut_hisse_degeri || 0);
        if (konutHisseDegeri > 1000000) {
            hatalar.push(
                `Tapuda kayıtlı gayrimenkulünüzün hisse değeri ` +
                `1 milyon TL'yi geçmemeli. Değeriniz: ${konutHisseDegeri.toLocaleString('tr-TR')} TL`
            );
        } else {
            hatalar.push(
                "Kendiniz, eşiniz veya velayetiniz altındaki çocuklarınız üzerine " +
                "T.C. sınırları dâhilinde tapuda kayıtlı bağımsız konut bulunmamalı."
            );
        }
    }
    
    return hatalar;
}

function gelirKontrol(bilgiler) {
    const hatalar = [];
    
    // Şehit/Gazi kategorisi için gelir şartı yok
    if (bilgiler.sehît_gazi_mu === 'evet') {
        return hatalar;
    }
    
    const projeIli = bilgiler.proje_ili || "";
    const aylikGelir = parseFloat(bilgiler.aylik_gelir || 0);
    
    if (projeIli.toLowerCase().includes("istanbul")) {
        if (aylikGelir > 145000) {
            hatalar.push(
                `Gelir sınırı (İstanbul): Aylık hane halkı net geliri ` +
                `en fazla 145.000 TL olmalı. Geliriniz: ${aylikGelir.toLocaleString('tr-TR')} TL`
            );
        }
    } else {
        if (aylikGelir > 127000) {
            hatalar.push(
                `Gelir sınırı (Diğer İller): Aylık hane halkı net geliri ` +
                `en fazla 127.000 TL olmalı. Geliriniz: ${aylikGelir.toLocaleString('tr-TR')} TL`
            );
        }
    }
    
    return hatalar;
}

function ikametKontrol(bilgiler) {
    const hatalar = [];
    
    const projeIli = bilgiler.proje_ili || "";
    const ikametSuresi = bilgiler.ikamet_suresi || "";
    const nufusaKayitliIl = bilgiler.nufusa_kayitli_il || "";
    const sehîtGaziMu = bilgiler.sehît_gazi_mu === 'evet';
    const emekliMu = bilgiler.emekli_mu === 'evet';
    
    // Deprem bölgesi kontrolü
    const depremBölgesi = DEPREM_BOLGESI_ILLERI.some(il => 
        projeIli.toLowerCase().includes(il.toLowerCase()) || 
        il.toLowerCase().includes(projeIli.toLowerCase())
    );
    
    // Şehit/Gazi kategorisi için: 3 yıldan az olmamak koşulu
    if (sehîtGaziMu) {
        if (ikametSuresi === '1_yildan_az' || ikametSuresi === '1_3_yil') {
            hatalar.push(
                "Şehit/Gazi kategorisi için: Proje ilinde başvuru döneminden geriye doğru " +
                "3 yıldan az olmamak koşuluyla ikamet ediyor olmalısınız."
            );
        }
    } else {
        // Genel kural: 1 yıldan az olmamak koşulu
        if (ikametSuresi === '1_yildan_az') {
            if (depremBölgesi) {
                // Deprem bölgesi için: ikamet VEYA nüfusa kayıtlı olma
                const nufusDepremBölgesi = DEPREM_BOLGESI_ILLERI.some(il => 
                    nufusaKayitliIl.toLowerCase().includes(il.toLowerCase()) || 
                    il.toLowerCase().includes(nufusaKayitliIl.toLowerCase())
                );
                
                if (!nufusDepremBölgesi) {
                    hatalar.push(
                        "Deprem bölgesi başvurusu için: Proje ilinde " +
                        "(ikamet edilen ilde) 1 yıldan az olmamak koşuluyla ikamet ediyor olmalı " +
                        "VEYA proje ili nüfusuna kayıtlı olmalısınız."
                    );
                }
            } else {
                // Normal bölge
                if (emekliMu) {
                    // Emekli için: ikamet VEYA nüfusa kayıtlı olma
                    if (nufusaKayitliIl.toLowerCase() !== projeIli.toLowerCase()) {
                        hatalar.push(
                            "Emekli kategorisi için: Proje ilinde 1 yıl ikamet " +
                            "VEYA proje ili nüfusuna kayıtlı olma şartı."
                        );
                    }
                } else {
                    hatalar.push(
                        "İkamet şartı: Başvuru yapılacak yerde " +
                        "(il/ilçe/belde) başvuru döneminden geriye doğru " +
                        "1 yıldan az olmamak koşuluyla ikamet ediyor olmalısınız."
                    );
                }
            }
        }
    }
    
    // Emekli kategorisi için özel durum (1 yıldan az ikamet + nüfusa kayıtlı değilse)
    if (emekliMu && ikametSuresi === '1_yildan_az') {
        if (nufusaKayitliIl.toLowerCase() !== projeIli.toLowerCase()) {
            hatalar.push(
                "Emekli kategorisi için: Proje ilinde 1 yıl ikamet " +
                "VEYA proje ili nüfusuna kayıtlı olma şartı."
            );
        }
    }
    
    return hatalar;
}

function kategoriBelirle(bilgiler) {
    const kategoriler = [];
    
    // Şehit/Gazi kontrolü
    if (bilgiler.sehît_gazi_mu === 'evet') {
        kategoriler.push(["sehît_gazi", KATEGORILER.sehît_gazi]);
        return kategoriler; // Bu kategori için konut/gelir şartı yok
    }
    
    // Engelli kontrolü
    if (bilgiler.engelli_mi === 'evet') {
        const engelliOrani = parseInt(bilgiler.engelli_orani || 0);
        if (engelliOrani >= 40) {
            if (bilgiler.sadece_cocuk_engelli !== 'evet') {
                kategoriler.push(["engelli", KATEGORILER.engelli]);
            }
        }
    }
    
    // Emekli kontrolü
    if (bilgiler.emekli_mu === 'evet') {
        kategoriler.push(["emekli", KATEGORILER.emekli]);
    }
    
    // Çocuklu aile kontrolü
    const cocukSayisi = parseInt(bilgiler.cocuk_sayisi_uygun || 0);
    if (cocukSayisi >= 3) {
        kategoriler.push(["cocuklu_aileler", KATEGORILER.cocuklu_aileler]);
    }
    
    // Genç kontrolü (10/11/1995 ve sonrası doğan)
    const dogumTarihi = bilgiler.dogum_tarihi;
    if (dogumTarihi) {
        try {
            const [gun, ay, yil] = dogumTarihi.split('.');
            const dogum = new Date(yil, ay - 1, gun);
            const gencSinirTarihi = new Date(1995, 10, 10); // 10 Kasım 1995
            
            if (dogum >= gencSinirTarihi) {
                // Genç kategori için anne-baba dahil konut kontrolü
                const konutVar = bilgiler.konut_var === 'evet';
                const anneBabaKonutVar = bilgiler.anne_baba_konut_var === 'evet';
                if (!(konutVar || anneBabaKonutVar)) {
                    kategoriler.push(["genc", KATEGORILER.genc]);
                }
            }
        } catch (e) {
            // Tarih parse edilemediyse görmezden gel
        }
    }
    
    // Diğer kategorisi (her zaman uygun)
    kategoriler.push(["diger", KATEGORILER.diger]);
    
    return kategoriler;
}

function kontrolEt(bilgiler) {
    let hatalar = [];
    
    // 1. Genel Şart Kontrolleri
    hatalar = hatalar.concat(genelSartlarKontrol(bilgiler));
    
    // 2. Gelir Kontrolü
    hatalar = hatalar.concat(gelirKontrol(bilgiler));
    
    // 3. İkamet Kontrolü
    hatalar = hatalar.concat(ikametKontrol(bilgiler));
    
    // 4. Kategori Belirleme
    const kategoriler = kategoriBelirle(bilgiler);
    
    if (kategoriler.length === 0) {
        hatalar.push("Hiçbir kategoriye uygun değilsiniz.");
        return { uygun: false, kategoriler: [], hatalar };
    }
    
    return { 
        uygun: hatalar.length === 0, 
        kategoriler: kategoriler, 
        hatalar: hatalar 
    };
}

function kontrolEtVeGoster() {
    // Form verilerini topla
    const bilgiler = {
        dogum_tarihi: document.getElementById('dogum_tarihi')?.value || '',
        vatandaslik_durumu: document.querySelector('input[name="vatandaslik_durumu"]:checked')?.value || '',
        vatandaslik_yili: document.getElementById('vatandaslik_yili')?.value || '',
        ikamet_ili: document.getElementById('ikamet_ili')?.value || '',
        ikamet_suresi: document.querySelector('input[name="ikamet_suresi"]:checked')?.value || '',
        nufusa_kayitli_il: document.getElementById('nufusa_kayitli_il')?.value || '',
        proje_ili: document.getElementById('proje_ili')?.value || '',
        konut_var: document.querySelector('input[name="konut_var"]:checked')?.value || '',
        konut_hisse_degeri: document.getElementById('konut_hisse_degeri')?.value || 0,
        anne_baba_konut_var: document.querySelector('input[name="anne_baba_konut_var"]:checked')?.value || 'hayir',
        yapi_kullanim_belgesi_var: document.querySelector('input[name="yapi_kullanim_belgesi_var"]:checked')?.value || '',
        aylik_gelir: document.getElementById('aylik_gelir')?.value || 0,
        sehît_gazi_mu: document.querySelector('input[name="sehît_gazi_mu"]:checked')?.value || '',
        engelli_mi: document.querySelector('input[name="engelli_mi"]:checked')?.value || '',
        engelli_orani: document.getElementById('engelli_orani')?.value || 0,
        sadece_cocuk_engelli: document.querySelector('input[name="sadece_cocuk_engelli"]:checked')?.value || '',
        emekli_mu: document.querySelector('input[name="emekli_mu"]:checked')?.value || '',
        cocuk_sayisi_uygun: document.getElementById('cocuk_sayisi_uygun')?.value || 0,
        yurt_disi_ikamet: document.querySelector('input[name="yurt_disi_ikamet"]:checked')?.value || '',
        onceki_toki_basvurusu: document.querySelector('input[name="onceki_toki_basvurusu"]:checked')?.value || '',
        onceki_sosyal_konut_hak_sahibi: document.querySelector('input[name="onceki_sosyal_konut_hak_sahibi"]:checked')?.value || ''
    };
    
    // Kontrolü yap
    const sonuc = kontrolEt(bilgiler);
    
    // Formu gizle, sonucu göster
    document.getElementById('basvuruForm').style.display = 'none';
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('stepInfo').textContent = 'Kontrol tamamlandı';
    
    // Sonuçları göster
    const resultDiv = document.getElementById('result');
    resultDiv.className = 'result';
    
    if (sonuc.uygun) {
        resultDiv.className += ' success';
        resultDiv.innerHTML = `
            <h3>✅ BAŞVURU YAPABİLİRSİNİZ!</h3>
            <p><strong>Uygun Olduğunuz Kategoriler:</strong></p>
            <ul class="category-list">
                ${sonuc.kategoriler.map(([id, kategori]) => `
                    <li>
                        <strong>${kategori.isim}</strong>
                        <div style="margin-top: 5px;">
                            <small><strong>Kontenjan:</strong> ${kategori.oran}</small><br>
                            <small><strong>Konut Tipleri:</strong> ${kategori.konut_tipleri.join(', ')}</small>
                            ${kategori.ek_sart ? `<br><small><strong>Ek Şart:</strong> ${kategori.ek_sart}</small>` : ''}
                        </div>
                    </li>
                `).join('')}
            </ul>
            <div class="info-box">
                💡 Bu sonuçlar bilgilendirme amaçlıdır. Kesin uygunluk için resmi başvuru yapmanız gerekmektedir.
            </div>
        `;
    } else {
        resultDiv.className += ' error';
        resultDiv.innerHTML = `
            <h3>❌ BAŞVURU YAPAMAZSINIZ!</h3>
            <p><strong>Uygunluk Şartları:</strong></p>
            <ul class="error-list">
                ${sonuc.hatalar.map(hata => `<li>${hata}</li>`).join('')}
            </ul>
            <div class="info-box">
                💡 Bu sonuçlar bilgilendirme amaçlıdır. Kesin uygunluk için resmi başvuru yapmanız gerekmektedir.
            </div>
        `;
    }
    
    // Sonuca kaydır
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// İlleri dropdown'lara doldur
function fillIlDropdowns() {
    const ilDropdowns = ['ikamet_ili', 'nufusa_kayitli_il', 'proje_ili'];
    ilDropdowns.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            TURKIYE_ILLERI.forEach(il => {
                const option = document.createElement('option');
                option.value = il;
                option.textContent = il;
                select.appendChild(option);
            });
        }
    });
}

// Sayfa yüklendiğinde ilk adımı göster
document.addEventListener('DOMContentLoaded', function() {
    fillIlDropdowns();
    initializeSteps();
    showStep(1);
});

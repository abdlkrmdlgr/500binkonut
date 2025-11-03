# GitHub'a Deploy Talimatları

## 1. GitHub'da Private Repo Oluşturma

1. https://github.com/new adresine gidin
2. Repository name: `500binkonut` (slug için önemli!)
3. **Private** seçeneğini işaretleyin
4. "Initialize this repository with a README" seçeneğini **İŞARETLEMEYİN**
5. "Create repository" butonuna tıklayın

## 2. Remote Ekleme ve Push

GitHub kullanıcı adınızı kullanarak aşağıdaki komutu çalıştırın:

```bash
# GitHub kullanıcı adınızı buraya yazın
GITHUB_USERNAME="your-username-here"

# Remote ekle
git remote add origin https://github.com/${GITHUB_USERNAME}/500binkonut.git

# Push yap
git push -u origin main
```

## 3. GitHub Pages'i Aktifleştirme

1. GitHub repo'nuzda **Settings** sekmesine gidin
2. Sol menüden **Pages** seçeneğini tıklayın
3. **Source** kısmından **main** branch'ini seçin
4. **Save** butonuna tıklayın

## 4. Erişim URL'i

GitHub Pages aktifleştikten birkaç dakika sonra, siteniz şu adresten erişilebilir olacak:

```
https://[GITHUB_USERNAME].github.io/500binkonut/
```

**Not:** GitHub Pages'in aktifleşmesi 1-5 dakika sürebilir.


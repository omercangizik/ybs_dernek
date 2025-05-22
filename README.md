# YBS Dernek Kullanıcı Paneli

Yönetim Bilişim Sistemleri Derneği için geliştirilmiş kullanıcı paneli.

## Özellikler

- Kullanıcı kayıt ve giriş sistemi
- Profil yönetimi ve profil resmi yükleme
- Etkinliklere katılım
- Eğitim ve sertifika yönetimi
- İş ve staj ilanlarına başvuru
- Blog yazılarını görüntüleme
- İletişim formu

## Teknolojiler

- Backend: Node.js (Express.js)
- Veritabanı: MySQL
- Frontend: EJS + Bootstrap
- Kimlik Doğrulama: Express-session + bcrypt
- Dosya Yükleme: Multer

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/yourusername/ybs-dernek.git
cd ybs-dernek
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ybs_dernek

# Session Configuration
SESSION_SECRET=your-secret-key-here

# File Upload Configuration
UPLOAD_PATH=public/uploads
MAX_FILE_SIZE=1000000
```

4. MySQL veritabanını oluşturun:
```bash
mysql -u root -p < db/schema.sql
```

5. Uygulamayı başlatın:
```bash
# Geliştirme modu
npm run dev

# Üretim modu
npm start
```

## Dizin Yapısı

```
ybs-dernek/
├── app.js
├── package.json
├── .env
├── README.md
├── controllers/
│   ├── userController.js
│   ├── eventController.js
│   ├── trainingController.js
│   ├── jobController.js
│   ├── blogController.js
│   └── contactController.js
├── routes/
│   ├── userRoutes.js
│   ├── eventRoutes.js
│   ├── trainingRoutes.js
│   ├── jobRoutes.js
│   ├── blogRoutes.js
│   └── contactRoutes.js
├── models/
│   └── db.js
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   ├── user/
│   │   └── profile.ejs
│   └── ...
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── uploads/
│       └── profiles/
└── db/
    ├── mysql_connect.js
    └── schema.sql
```

## Güvenlik

- Şifreler bcrypt ile hashlenir
- XSS ve SQL Injection önlemleri alınmıştır
- Oturum yönetimi için express-session kullanılır
- Dosya yüklemeleri için güvenlik kontrolleri yapılır

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir özellik dalı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Dalınıza push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın. 
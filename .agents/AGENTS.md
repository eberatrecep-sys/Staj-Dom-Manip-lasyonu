# AI Agent Rules & Best Practices

Bu dosya, projede çalışan yapay zeka (AI) ajanları için merkezi bir kural seti görevi görür. Ajanların halüsinasyon (yanlış/uydurma kod) üretmesini engellemek ve kod kalitesini belli bir standartta tutmak için aşağıdaki spesifik ve doğrulanabilir (verifiable) kurallara uymaları zorunludur.

## 1. Mimari ve Teknoloji Yığını (Tech Stack)
- **Backend:** .NET (C#), Entity Framework Core.
- **Frontend:** React, TypeScript, Vite. (Monorepo yapısı kullanılmaktadır).
- **Kısıtlama:** Frontend tarafında aksi belirtilmedikçe saf (vanilla) CSS kullanılmalıdır. TailwindCSS veya diğer kütüphaneleri, kullanıcı açıkça istemediği sürece dahil etmeyin.

## 2. Doğrulanabilir Kodlama Kalıpları (Verifiable Coding Patterns)
"Temiz kod yaz" gibi öznel kurallar yerine aşağıdaki net kuralları uygulayın:
1. **Single Responsibility (Tek Sorumluluk):** Sınıflar ve fonksiyonlar sadece tek bir işten sorumlu olmalıdır. Örneğin; `AppDbContext` içerisinde `OnModelCreating` altında yapılan ayarları doğrudan oraya yazmak yerine `IEntityTypeConfiguration<T>` implemente eden ayrı dosyalara (`Configurations/`) bölün.
2. **Hata Yönetimi (Error Handling):** `try-catch` bloklarını yutmayın. Yakalanan hataları loglayın veya anlamlı bir HTTP durumu (Örn: 500, 400, 404) ile `MessageResponseDto` üzerinden döndürün. Exception fırlatırken (Throw) daima hatanın sebebini açıklayan bir mesaj ekleyin.
3. **Database Constraints (Veritabanı Kuralları):** Entity Framework kullanırken her zaman en uygun indeksi (Unique, Compound, Partial) seçin. "Soft delete" gibi yapılarda verilerin filtrelenmesi için muhakkak Global Query Filters kullanın.

## 3. Güvenlik ve Edge Caseler
1. **Veri İfşası:** API yanıtlarında (JSON) hiçbir zaman şifre hashlerini (`PasswordHash`), gizli anahtarları veya dahili veritabanı ID'lerini (kullanıcıya gösterilmemesi gereken yerlerde) dışarı sızdırmayın.
2. **Null Kontrolü:** Olası bir `NullReferenceException`'a karşı her zaman null kontrollerini (Örn: `?? throw new KeyNotFoundException(...)` veya `?.` operatörünü) uygulayın.

## 4. İletişim ve Ajan Etiketi (Agent Etiquette)
1. **Emin Değilsen Sor:** Gereksinimler belirsizse veya büyük bir mimari değişiklik gerektiriyorsa (Örn: Yeni bir teknoloji/kütüphane eklenmesi), kod yazmaya başlamadan önce kullanıcıya soru sor.
2. **Kapsam Dışı İşlem Yapma:** Eğer kullanıcı 1 dosyadaki küçük bir hatayı çözmeni istediyse, ondan habersiz projedeki diğer 10 dosyayı yeniden düzenleme (Refactor etme).
3. **Değişiklikleri Özetle:** Kapsamlı (Complex) refactoring işlemlerinin ardından daima yeni bir `.md` Artifact'ı yaratarak kullanıcıya nelerin, neden değiştiğini açıkla.

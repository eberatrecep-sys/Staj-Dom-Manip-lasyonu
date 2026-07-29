using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Application.Services;
using MyShoppingApp.Domain.Interfaces;
using MyShoppingApp.Infrastructure.Context;
using MyShoppingApp.Infrastructure.Repositories;
using Serilog;
using MyShoppingApp.API.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .WriteTo.File("logs/log.txt")
    .CreateLogger();

builder.Host.UseSerilog();

// ==========================================
// 1. YAPILANDIRMA VE SABİTLER (CONFIGURATIONS)
// ==========================================
// appsettings.json veya appsettings.Development.json içerisindeki ayarları dinamik olarak okuyoruz.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret is missing");

// ==========================================
// 2. VERİTABANI BAĞLANTISI (ENTITY FRAMEWORK)
// ==========================================
// PostgreSQL kullanacağımızı ve bağlantı adresini (connectionString) DbContext'e bildiriyoruz.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ==========================================
// 3. BAĞIMLILIK ENJEKSİYONU (DEPENDENCY INJECTION)
// ==========================================
// 'AddScoped' kullanarak, her HTTP isteğinde (Request) yeni bir örnek (instance) oluşturulmasını sağlıyoruz.
// Sınıflar birbirlerinin somut hallerine değil, Interface (Arayüz) sözleşmelerine bağımlı oluyor.
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IShoppingListRepository, ShoppingListRepository>();
builder.Services.AddScoped<ISiteSettingsRepository, SiteSettingsRepository>();
builder.Services.AddScoped<ICurrencyRateRepository, CurrencyRateRepository>();
builder.Services.AddScoped<IShareRepository, ShareRepository>();

builder.Services.AddScoped<IAuthService>(sp =>
    new AuthService(sp.GetRequiredService<IUserRepository>(), jwtSecret));
builder.Services.AddScoped<IShoppingListService, ShoppingListService>();
builder.Services.AddScoped<ISiteSettingsService, SiteSettingsService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IShareService, ShareService>();

// HttpClient sınıfını kullanan ICurrencyService/CurrencyService bağımlılığını kaydediyoruz.
builder.Services.AddHttpClient<ICurrencyService, CurrencyService>();

// ==========================================
// 4. GÜVENLİK VE YETKİLENDİRME (JWT & AUTH)
// ==========================================
// Gelen HTTP isteklerindeki 'Authorization: Bearer <Token>' başlığını doğrulayacak mekanizmayı kuruyoruz.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false, // Hangi sunucunun ürettiğini kontrol etmiyoruz (local test için)
            ValidateAudience = false, // Hangi istemci için üretildiğini kontrol etmiyoruz
            ValidateLifetime = true, // Token'ın süresinin dolup dolmadığını kontrol et
            ValidateIssuerSigningKey = true, // İmza anahtarını doğrula
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)) // JWT imzalamak için kullandığımız gizli anahtar
        };
    });

builder.Services.AddAuthorization(); // Yetkilendirme (Rol bazlı kontroller) servislerini ekliyoruz.

// ==========================================
// 5. KONTROLÖRLER VE JSON YAPILANDIRMASI
// ==========================================
// Controller desteğini ekliyoruz. Döndürdüğümüz nesnelerin camelCase (örn: nesneAdi) formatında serialize edilmesini sağlıyoruz.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles; // İlişkisel verilerde sonsuz döngüyü engeller
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// ==========================================
// 6. CORS (CROSS-ORIGIN RESOURCE SHARING)
// ==========================================
// Frontend uygulamamız (localhost:5173 veya GitHub Pages) buraya istek atabilsin diye tüm kökenlere (origins) izin veriyoruz.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

// Swagger (OpenAPI) belgelerini oluşturmak için servisi ekliyoruz.
builder.Services.AddOpenApi();

var app = builder.Build();

// ==========================================
// 7. VERİTABANI OTOMATİK MİGRASYONU (AUTO-MIGRATION)
// ==========================================
// Uygulama her çalıştığında veritabanında eksik tablo veya güncelleme varsa otomatik olarak çalıştırır.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ==========================================
// 8. MIDDLEWARE PIPELINE (ARA YAZILIMLAR)
// ==========================================
// Gelen isteklerin sırayla geçeceği güvenlik ve yönlendirme boru hattını (pipeline) kurguluyoruz.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // API dokümantasyonunu geliştirme ortamında aktif et
}

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors(); // CORS kurallarını uygula
app.UseAuthentication(); // Kullanıcının kim olduğunu doğrula (JWT oku)
app.UseAuthorization();  // Kullanıcının bu işlemi yapmaya izni var mı denetle (Rol kontrolü)
app.MapControllers();    // İstekleri ilgili Controller sınıflarına yönlendir

// Sunucuyu localde 5050 portundan dinlemeye başlıyoruz.
app.Run("http://localhost:5050");

using System.Text;
using System.Text.Json.Serialization;
using Asp.Versioning;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Application.Services;
using MyShoppingApp.Domain.Interfaces;
using MyShoppingApp.Infrastructure.Context;
using MyShoppingApp.Infrastructure.Repositories;
using MyShoppingApp.Infrastructure.Services;
using System.Threading.RateLimiting;
using Serilog;
using MyShoppingApp.API.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .Enrich.WithProperty("ApplicationName", "MyShoppingApp.API")
    .Enrich.WithProperty("Environment", "Development")
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5341")
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
    new AuthService(
        sp.GetRequiredService<IUserRepository>(),
        jwtSecret,
        sp.GetRequiredService<IFileStorageService>(),
        sp.GetRequiredService<IEmailService>(),
        sp.GetRequiredService<IOtpService>()));
builder.Services.AddScoped<IShoppingListService, ShoppingListService>();
builder.Services.AddScoped<ISiteSettingsService, SiteSettingsService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IShareService, ShareService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IOtpService, OtpService>();

// HttpClient sınıfını kullanan ICurrencyService/CurrencyService bağımlılığını kaydediyoruz.
builder.Services.AddHttpClient<ICurrencyService, CurrencyService>();
builder.Services.AddScoped<IOfferRepository, OfferRepository>();
builder.Services.AddScoped<IOfferService, OfferService>();

// Resim sıkıştırma arkaplan görevini kaydediyoruz.
builder.Services.AddHostedService<MyShoppingApp.API.Services.ImageProcessingBackgroundService>();

// ==========================================
// 3.1 CACHING (REDIS & HYBRID CACHE)
// ==========================================
#pragma warning disable EXTEXP0018
builder.Services.AddStackExchangeRedisCache(options => options.Configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379");
builder.Services.AddHybridCache(options =>
{
    options.MaximumPayloadBytes = 1024 * 1024 * 10; // 10 MB
    options.MaximumKeyLength = 1024;
});
#pragma warning restore EXTEXP0018

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
// 4.1 RATE LIMITING (HIZ SINIRLANDIRMA)
// ==========================================
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    // Global (Default) Limit: IP başına dakikada 100 istek
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    // Auth (Giriş/Kayıt/Şifre Sıfırlama) Limit: IP başına dakikada 5 istek
    options.AddPolicy("AuthLimit", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 5,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    // Upload (Dosya Yükleme) Limit: IP başına dakikada 10 istek
    options.AddPolicy("UploadLimit", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 10,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));

    // Write (Ekleme/Silme/Güncelleme) Limit: IP başına dakikada 30 istek
    options.AddPolicy("WriteLimit", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? httpContext.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 30,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
});

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
// 5.1 API VERSİYONLAMA
// ==========================================
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
    // URL tabanlı versiyonlama için okuyucu ayarlıyoruz
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
})
.AddMvc()
.AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

// 5.1 GLOBAL EXCEPTION HANDLER
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ==========================================
// 5.2 FLUENT VALIDATION
// ==========================================
builder.Services.AddValidatorsFromAssemblyContaining<MyShoppingApp.Application.Validators.CreateListDtoValidator>();

// ==========================================
// 6. CORS (CROSS-ORIGIN RESOURCE SHARING)
// ==========================================
// Frontend uygulamamız (localhost:5173 veya GitHub Pages) buraya istek atabilsin diye tüm kökenlere (origins) izin veriyoruz.
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// Swagger (OpenAPI) belgelerini oluşturmak için servisi ekliyoruz.
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

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
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(); // CORS kurallarını uygula
app.UseExceptionHandler(); // Global Hata Yönetimi
app.UseRateLimiter(); // Hız Sınırlandırma (Rate Limiter)
app.UseAuthentication(); // Kullanıcının kim olduğunu doğrula (JWT oku)
app.UseAuthorization();  // Kullanıcının bu işlemi yapmaya izni var mı denetle (Rol kontrolü)
app.MapControllers();    // İstekleri ilgili Controller sınıflarına yönlendir

// Sunucuyu başlatıyoruz. (Port ayarları launchSettings.json veya Docker içerisinden okunur)
app.Run();

using Microsoft.EntityFrameworkCore;
using MyShoppingApp.Infrastructure.Context;
using MyShoppingApp.Domain.Entities;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace MyShoppingApp.API.Services;

public class ImageProcessingBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ImageProcessingBackgroundService> _logger;

    public ImageProcessingBackgroundService(IServiceProvider serviceProvider, ILogger<ImageProcessingBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ImageProcessingBackgroundService başlatıldı.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // 5 dakikada bir çalış
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);

                var unprocessedImages = await dbContext.ItemImages
                    .Where(img => !img.IsCompressed || !img.HasThumbnail)
                    .Take(10)
                    .ToListAsync(stoppingToken);

                if (unprocessedImages.Any())
                {
                    _logger.LogInformation($"{unprocessedImages.Count} adet işlenmemiş resim bulundu, işleme başlıyor...");
                    
                    var fileStorageService = scope.ServiceProvider.GetRequiredService<MyShoppingApp.Application.Interfaces.IFileStorageService>();
                    
                    foreach (var image in unprocessedImages)
                    {
                        try
                        {
                            var originalStream = await fileStorageService.GetFileStreamAsync(image.ImageUrl);
                            using var img = await Image.LoadAsync(originalStream);

                            // Sıkıştırma (Resize veya kalite düşürme yapılabilir, burada sadece yeniden encode ediyoruz)
                            using var compressedStream = new MemoryStream();
                            await img.SaveAsJpegAsync(compressedStream, new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder { Quality = 75 });
                            compressedStream.Position = 0;
                            var compressedUrl = await fileStorageService.UploadFileAsync(compressedStream, $"compressed_{Guid.NewGuid()}.jpg", "image/jpeg");

                            // Thumbnail oluştur
                            img.Mutate(x => x.Resize(new ResizeOptions
                            {
                                Size = new Size(200, 200),
                                Mode = ResizeMode.Max
                            }));
                            using var thumbStream = new MemoryStream();
                            await img.SaveAsJpegAsync(thumbStream, new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder { Quality = 70 });
                            thumbStream.Position = 0;
                            var thumbUrl = await fileStorageService.UploadFileAsync(thumbStream, $"thumb_{Guid.NewGuid()}.jpg", "image/jpeg");

                            // Eski orjinal dosyayı sil (isteğe bağlı)
                            await fileStorageService.DeleteFileAsync(image.ImageUrl);

                            image.ImageUrl = compressedUrl;
                            image.IsCompressed = true;
                            image.HasThumbnail = true;
                            image.ThumbnailUrl = thumbUrl; 
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Resim işlenirken hata oluştu: {image.Id}");
                        }
                    }

                    await dbContext.SaveChangesAsync(stoppingToken);
                    _logger.LogInformation("Resim işleme tamamlandı.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Resim işleme servisi çalışırken bir hata oluştu.");
            }
        }
    }
}

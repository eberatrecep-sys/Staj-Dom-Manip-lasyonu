using MyShoppingApp.Application.DTOs;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Interfaces;
using Microsoft.Extensions.Caching.Hybrid;

namespace MyShoppingApp.Application.Services;

public class OfferService : IOfferService
{
    private readonly IOfferRepository _offerRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly HybridCache _hybridCache;
    private readonly IEmailService _emailService;
    private readonly IUserRepository _userRepository;
    private const string ActiveOffersCacheKey = "offers_active";

    public OfferService(
        IOfferRepository offerRepository, 
        IFileStorageService fileStorageService,
        HybridCache hybridCache,
        IEmailService emailService,
        IUserRepository userRepository)
    {
        _offerRepository = offerRepository;
        _fileStorageService = fileStorageService;
        _hybridCache = hybridCache;
        _emailService = emailService;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<OfferDto>> GetAllOffersAsync()
    {
        var offers = await _offerRepository.GetAllAsync();
        return offers.Select(MapToDto);
    }

    public async Task<IEnumerable<OfferDto>> GetActiveOffersAsync()
    {
        // Redis + InMemory caching using HybridCache (.NET 9+)
        return await _hybridCache.GetOrCreateAsync(
            ActiveOffersCacheKey,
            async cancel => 
            {
                var offers = await _offerRepository.GetActiveOffersAsync();
                return offers.Select(MapToDto).ToList();
            },
            new HybridCacheEntryOptions
            {
                Expiration = TimeSpan.FromMinutes(30),
                LocalCacheExpiration = TimeSpan.FromMinutes(5)
            });
    }

    public async Task<OfferDto> GetOfferByIdAsync(int id)
    {
        var offer = await _offerRepository.GetByIdAsync(id);
        if (offer == null) throw new KeyNotFoundException("Offer not found");
        return MapToDto(offer);
    }

    public async Task<OfferDto> CreateOfferAsync(CreateOfferDto createOfferDto)
    {
        string imageUrl = string.Empty;
        if (createOfferDto.Image != null)
        {
            imageUrl = await _fileStorageService.UploadFileAsync(createOfferDto.Image.OpenReadStream(), createOfferDto.Image.FileName, createOfferDto.Image.ContentType);
        }

        var offer = new Offer
        {
            Title = createOfferDto.Title,
            Description = createOfferDto.Description,
            DiscountBadge = createOfferDto.DiscountBadge,
            ImageUrl = imageUrl,
            TargetUrl = createOfferDto.TargetUrl,
            IsActive = createOfferDto.IsActive,
            DisplayOrder = createOfferDto.DisplayOrder
        };

        var created = await _offerRepository.AddAsync(offer);
        await _hybridCache.RemoveAsync(ActiveOffersCacheKey); // Invalidate Cache
        return MapToDto(created);
    }

    public async Task UpdateOfferAsync(int id, UpdateOfferDto updateOfferDto)
    {
        var offer = await _offerRepository.GetByIdAsync(id);
        if (offer == null) throw new KeyNotFoundException("Offer not found");

        if (updateOfferDto.Image != null)
        {
            offer.ImageUrl = await _fileStorageService.UploadFileAsync(updateOfferDto.Image.OpenReadStream(), updateOfferDto.Image.FileName, updateOfferDto.Image.ContentType);
        }

        offer.Title = updateOfferDto.Title;
        offer.Description = updateOfferDto.Description;
        offer.DiscountBadge = updateOfferDto.DiscountBadge;
        offer.TargetUrl = updateOfferDto.TargetUrl;
        offer.IsActive = updateOfferDto.IsActive;
        offer.DisplayOrder = updateOfferDto.DisplayOrder;

        await _offerRepository.UpdateAsync(offer);
        await _hybridCache.RemoveAsync(ActiveOffersCacheKey); // Invalidate Cache
    }

    public async Task DeleteOfferAsync(int id)
    {
        var offer = await _offerRepository.GetByIdAsync(id);
        if (offer == null) throw new KeyNotFoundException("Offer not found");

        await _offerRepository.DeleteAsync(offer);
        await _hybridCache.RemoveAsync(ActiveOffersCacheKey); // Invalidate Cache
    }

    public async Task<MyShoppingApp.Application.DTOs.Common.MessageResponseDto> SendBulkEmailAsync(List<int> offerIds)
    {
        var allOffers = await _offerRepository.GetAllAsync();
        var selectedOffers = allOffers.Where(o => offerIds.Contains(o.Id)).ToList();
        
        if (!selectedOffers.Any())
            throw new KeyNotFoundException("Seçilen kampanyalar bulunamadı.");

        var allUsers = await _userRepository.GetAllWithListsAsync();
        var activeUsers = allUsers.Where(u => !u.IsDeleted).ToList();

        if (!activeUsers.Any())
            return new MyShoppingApp.Application.DTOs.Common.MessageResponseDto("Aktif kullanıcı bulunamadı, mail gönderilmedi.");

        var subject = "Size Özel Yeni Kampanyalarımız Var!";
        var bodyBuilder = new System.Text.StringBuilder();
        bodyBuilder.Append("<h1>Yeni Kampanyalarımız</h1>");
        bodyBuilder.Append("<p>Aşağıdaki kampanyalarımızı inceleyebilirsiniz:</p><ul>");

        foreach (var offer in selectedOffers)
        {
            bodyBuilder.Append($"<li><strong>{offer.Title}</strong>: {offer.Description} (Kupon: {offer.DiscountBadge})</li>");
        }
        bodyBuilder.Append("</ul>");

        var body = bodyBuilder.ToString();

        // Send email to all active users
        foreach (var user in activeUsers)
        {
            try 
            {
                await _emailService.SendEmailAsync(user.Email, subject, body, isHtml: true);
            }
            catch (Exception ex)
            {
                // In production, we should log this failure and continue
                Console.WriteLine($"Failed to send email to {user.Email}: {ex.Message}");
            }
        }

        return new MyShoppingApp.Application.DTOs.Common.MessageResponseDto($"{activeUsers.Count} kullanıcıya e-posta başarıyla gönderildi.");
    }

    private static OfferDto MapToDto(Offer offer)
    {
        return new OfferDto
        {
            Id = offer.Id,
            Title = offer.Title,
            Description = offer.Description,
            DiscountBadge = offer.DiscountBadge,
            ImageUrl = offer.ImageUrl,
            TargetUrl = offer.TargetUrl,
            IsActive = offer.IsActive,
            DisplayOrder = offer.DisplayOrder
        };
    }
}

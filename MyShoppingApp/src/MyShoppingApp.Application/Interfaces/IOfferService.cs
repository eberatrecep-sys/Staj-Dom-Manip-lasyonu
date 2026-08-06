using MyShoppingApp.Application.DTOs;
using MyShoppingApp.Application.DTOs.Common;
using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Application.Interfaces;

public interface IOfferService
{
    Task<IEnumerable<OfferDto>> GetAllOffersAsync();
    Task<IEnumerable<OfferDto>> GetActiveOffersAsync();
    Task<OfferDto> GetOfferByIdAsync(int id);
    Task<OfferDto> CreateOfferAsync(CreateOfferDto createOfferDto);
    Task UpdateOfferAsync(int id, UpdateOfferDto updateOfferDto);
    Task DeleteOfferAsync(int id);
    Task<MessageResponseDto> SendBulkEmailAsync(List<int> offerIds);
}

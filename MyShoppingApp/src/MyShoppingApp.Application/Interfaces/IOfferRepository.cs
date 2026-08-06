using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Application.Interfaces;

public interface IOfferRepository
{
    Task<Offer?> GetByIdAsync(int id);
    Task<IEnumerable<Offer>> GetAllAsync();
    Task<IEnumerable<Offer>> GetActiveOffersAsync();
    Task<Offer> AddAsync(Offer offer);
    Task UpdateAsync(Offer offer);
    Task DeleteAsync(Offer offer);
}

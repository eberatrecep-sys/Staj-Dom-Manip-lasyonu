using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Infrastructure.Context.Configurations;

public class ItemImageConfiguration : IEntityTypeConfiguration<ItemImage>
{
    public void Configure(EntityTypeBuilder<ItemImage> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasOne(e => e.ShoppingListItem)
               .WithMany(i => i.Images)
               .HasForeignKey(e => e.ShoppingListItemId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

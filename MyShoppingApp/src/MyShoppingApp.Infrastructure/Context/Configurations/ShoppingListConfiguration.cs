using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Infrastructure.Context.Configurations;

public class ShoppingListConfiguration : IEntityTypeConfiguration<ShoppingList>
{
    public void Configure(EntityTypeBuilder<ShoppingList> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Title).HasDefaultValue("My List");
        builder.Property(e => e.Category).HasDefaultValue("Recents");
        builder.HasOne(e => e.User)
               .WithMany(u => u.ShoppingLists)
               .HasForeignKey(e => e.UserId);
    }
}

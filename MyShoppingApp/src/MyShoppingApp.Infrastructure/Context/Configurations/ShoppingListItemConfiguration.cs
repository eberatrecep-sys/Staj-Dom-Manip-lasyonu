using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Infrastructure.Context.Configurations;

public class ShoppingListItemConfiguration : IEntityTypeConfiguration<ShoppingListItem>
{
    public void Configure(EntityTypeBuilder<ShoppingListItem> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.IsCompleted).HasDefaultValue(false);
        
        // Compound Index: Optimize queries filtering by both ListId and IsCompleted status
        builder.HasIndex(e => new { e.ListId, e.IsCompleted });
        
        builder.HasOne(e => e.List)
               .WithMany(l => l.Items)
               .HasForeignKey(e => e.ListId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

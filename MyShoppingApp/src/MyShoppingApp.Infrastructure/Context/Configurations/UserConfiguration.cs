using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Enums;

namespace MyShoppingApp.Infrastructure.Context.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(e => e.Id);
        
        // Partial Unique Index for Email: Only check uniqueness for non-deleted users
        builder.HasIndex(e => e.Email)
               .IsUnique()
               .HasFilter("\"IsDeleted\" = FALSE");
               
        builder.Property(e => e.Role)
               .HasConversion<string>()
               .HasDefaultValue(Role.USER);

        // Global Query Filter for Soft Delete
        builder.HasQueryFilter(e => !e.IsDeleted);

        // Many-to-Many Shared Lists
        builder.HasMany(u => u.SharedLists)
               .WithMany(l => l.SharedWithUsers)
               .UsingEntity(j => j.ToTable("SharedShoppingLists"));
    }
}

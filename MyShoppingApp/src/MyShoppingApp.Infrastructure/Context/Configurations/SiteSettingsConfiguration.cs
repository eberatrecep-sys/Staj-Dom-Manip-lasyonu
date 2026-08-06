using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Infrastructure.Context.Configurations;

public class SiteSettingsConfiguration : IEntityTypeConfiguration<SiteSettings>
{
    public void Configure(EntityTypeBuilder<SiteSettings> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.HomepageTitle).HasDefaultValue("Alışveriş Uygulaması");
    }
}

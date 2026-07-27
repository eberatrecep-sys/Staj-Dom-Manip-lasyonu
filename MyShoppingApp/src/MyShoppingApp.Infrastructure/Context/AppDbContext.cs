using Microsoft.EntityFrameworkCore;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Enums;

namespace MyShoppingApp.Infrastructure.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<ShoppingList> ShoppingLists => Set<ShoppingList>();
    public DbSet<ShoppingListItem> ShoppingListItems => Set<ShoppingListItem>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();
    public DbSet<CurrencyRate> CurrencyRates => Set<CurrencyRate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Role)
                  .HasConversion<string>()
                  .HasDefaultValue(Role.USER);
        });

        // ShoppingList
        modelBuilder.Entity<ShoppingList>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasDefaultValue("My List");
            entity.Property(e => e.Category).HasDefaultValue("Recents");
            entity.HasOne(e => e.User)
                  .WithMany(u => u.ShoppingLists)
                  .HasForeignKey(e => e.UserId);
        });

        // ShoppingListItem
        modelBuilder.Entity<ShoppingListItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.IsCompleted).HasDefaultValue(false);
            entity.HasOne(e => e.List)
                  .WithMany(l => l.Items)
                  .HasForeignKey(e => e.ListId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // SiteSettings
        modelBuilder.Entity<SiteSettings>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.HomepageTitle).HasDefaultValue("Alışveriş Uygulaması");
        });

        // CurrencyRate
        modelBuilder.Entity<CurrencyRate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Currency).IsUnique();
        });
    }
}

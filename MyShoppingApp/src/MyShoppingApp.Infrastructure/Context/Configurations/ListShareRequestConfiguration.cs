using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Enums;

namespace MyShoppingApp.Infrastructure.Context.Configurations;

public class ListShareRequestConfiguration : IEntityTypeConfiguration<ListShareRequest>
{
    public void Configure(EntityTypeBuilder<ListShareRequest> builder)
    {
        builder.HasKey(e => e.Id);
        
        builder.HasOne(e => e.List)
               .WithMany(l => l.ShareRequests)
               .HasForeignKey(e => e.ListId)
               .OnDelete(DeleteBehavior.Cascade);
               
        builder.HasOne(e => e.Sender)
               .WithMany(u => u.SentShareRequests)
               .HasForeignKey(e => e.SenderId)
               .OnDelete(DeleteBehavior.Restrict); 
               
        builder.HasOne(e => e.Receiver)
               .WithMany(u => u.ReceivedShareRequests)
               .HasForeignKey(e => e.ReceiverId)
               .OnDelete(DeleteBehavior.Restrict);
               
        builder.Property(e => e.Status)
               .HasConversion<string>()
               .HasDefaultValue(ShareRequestStatus.Pending);
    }
}

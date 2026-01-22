using Microsoft.EntityFrameworkCore;
using CoffeeCheckIn.Models;

namespace CoffeeCheckIn.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<CoffeeShop> CoffeeShops => Set<CoffeeShop>();
    public DbSet<CheckIn> CheckIns => Set<CheckIn>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        // CoffeeShop configuration
        modelBuilder.Entity<CoffeeShop>(entity =>
        {
            entity.HasIndex(c => c.OsmId).IsUnique();
        });

        // CheckIn configuration
        modelBuilder.Entity<CheckIn>(entity =>
        {
            entity.HasOne(c => c.User)
                .WithMany(u => u.CheckIns)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(c => c.CoffeeShop)
                .WithMany(s => s.CheckIns)
                .HasForeignKey(c => c.CoffeeShopId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Review configuration
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.CheckIn)
                .WithMany(c => c.Reviews)
                .HasForeignKey(r => r.CheckInId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // MenuItem configuration
        modelBuilder.Entity<MenuItem>(entity =>
        {
            entity.HasOne(m => m.CoffeeShop)
                .WithMany(s => s.MenuItems)
                .HasForeignKey(m => m.CoffeeShopId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(m => m.Price).HasPrecision(10, 2);
        });
    }
}

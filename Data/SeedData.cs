using CoffeeCheckIn.Models;
using Microsoft.EntityFrameworkCore;

namespace CoffeeCheckIn.Data;

public static class SeedData
{
    public static async Task Initialize(AppDbContext context)
    {
        // Only seed if database is empty
        if (await context.Users.AnyAsync())
            return;

        var random = new Random(42); // Fixed seed for reproducibility

        // Create fake users
        var users = new List<User>
        {
            new User { Username = "coffeelover", Email = "coffeelover@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), CreatedAt = DateTime.UtcNow.AddDays(-90) },
            new User { Username = "espresso_addict", Email = "espresso@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), CreatedAt = DateTime.UtcNow.AddDays(-85) },
            new User { Username = "latte_art_fan", Email = "latte@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), CreatedAt = DateTime.UtcNow.AddDays(-80) },
            new User { Username = "bean_hunter", Email = "bean@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), CreatedAt = DateTime.UtcNow.AddDays(-75) },
            new User { Username = "morning_brew", Email = "morning@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), CreatedAt = DateTime.UtcNow.AddDays(-70) },
            new User { Username = "roast_master", Email = "roast@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), CreatedAt = DateTime.UtcNow.AddDays(-65) },
            new User { Username = "caffeine_queen", Email = "queen@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), CreatedAt = DateTime.UtcNow.AddDays(-60) },
            new User { Username = "java_junkie", Email = "java@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), CreatedAt = DateTime.UtcNow.AddDays(-55) },
            new User { Username = "pour_over_pro", Email = "pourover@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), CreatedAt = DateTime.UtcNow.AddDays(-50) },
            new User { Username = "cold_brew_crew", Email = "coldbrew@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), CreatedAt = DateTime.UtcNow.AddDays(-45) },
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // Create fake coffee shops (using fictional OSM IDs)
        var coffeeShops = new List<CoffeeShop>
        {
            new CoffeeShop { OsmId = 900000001, Name = "The Roastery", Latitude = 40.7128, Longitude = -74.0060, Address = "123 Coffee Lane, New York", CachedAt = DateTime.UtcNow.AddDays(-60) },
            new CoffeeShop { OsmId = 900000002, Name = "Bean & Leaf", Latitude = 40.7138, Longitude = -74.0070, Address = "456 Espresso Ave, New York", CachedAt = DateTime.UtcNow.AddDays(-55) },
            new CoffeeShop { OsmId = 900000003, Name = "Morning Grind", Latitude = 40.7148, Longitude = -74.0080, Address = "789 Latte Street, New York", CachedAt = DateTime.UtcNow.AddDays(-50) },
            new CoffeeShop { OsmId = 900000004, Name = "Brew Culture", Latitude = 40.7158, Longitude = -74.0090, Address = "321 Mocha Blvd, New York", CachedAt = DateTime.UtcNow.AddDays(-45) },
            new CoffeeShop { OsmId = 900000005, Name = "Dark Roast Society", Latitude = 40.7168, Longitude = -74.0100, Address = "654 Arabica Way, New York", CachedAt = DateTime.UtcNow.AddDays(-40) },
            new CoffeeShop { OsmId = 900000006, Name = "The Pour Over", Latitude = 40.7178, Longitude = -74.0110, Address = "987 Drip Drive, New York", CachedAt = DateTime.UtcNow.AddDays(-35) },
            new CoffeeShop { OsmId = 900000007, Name = "Caffeine Corner", Latitude = 40.7188, Longitude = -74.0120, Address = "147 Brew Lane, New York", CachedAt = DateTime.UtcNow.AddDays(-30) },
            new CoffeeShop { OsmId = 900000008, Name = "Artisan Coffee Co", Latitude = 40.7198, Longitude = -74.0130, Address = "258 Roast Road, New York", CachedAt = DateTime.UtcNow.AddDays(-25) },
            new CoffeeShop { OsmId = 900000009, Name = "The Daily Grind", Latitude = 40.7208, Longitude = -74.0140, Address = "369 Bean Street, New York", CachedAt = DateTime.UtcNow.AddDays(-20) },
            new CoffeeShop { OsmId = 900000010, Name = "Steam & Foam", Latitude = 40.7218, Longitude = -74.0150, Address = "480 Cappuccino Circle, New York", CachedAt = DateTime.UtcNow.AddDays(-15) },
        };

        context.CoffeeShops.AddRange(coffeeShops);
        await context.SaveChangesAsync();

        // Coffee products for reviews
        var products = new[]
        {
            // Espresso-based
            "Espresso", "Double Espresso", "Americano", "Long Black", "Ristretto",
            // Milk-based
            "Cappuccino", "Latte", "Flat White", "Cortado", "Macchiato", "Mocha",
            // Cold drinks
            "Iced Latte", "Cold Brew", "Iced Americano", "Frappuccino", "Iced Mocha",
            // Specialty
            "Oat Milk Latte", "Almond Cappuccino", "Caramel Macchiato", "Vanilla Latte", "Hazelnut Latte",
            // Roasts
            "Ethiopian Light Roast", "Colombian Medium Roast", "Brazilian Dark Roast", "Sumatra Single Origin",
            "Guatemala Antigua", "Kenya AA", "Costa Rica Tarrazu", "Panama Geisha",
            // Food items
            "Croissant", "Blueberry Muffin", "Chocolate Brownie", "Avocado Toast", "Banana Bread"
        };

        // Review notes templates
        var positiveNotes = new[]
        {
            "Absolutely perfect! Will come back for more.",
            "Best {product} I've had in the city!",
            "Smooth, rich flavor. Highly recommend.",
            "The barista really knows their craft.",
            "Great balance of flavors.",
            "Love the atmosphere here.",
            "Perfect roast level.",
            "Excellent crema on the espresso.",
            "Silky smooth milk texture.",
            "Worth every penny!",
            "My new favorite spot.",
            "The beans are clearly fresh roasted.",
            "Amazing aroma, even better taste.",
            "Perfect temperature, perfect extraction.",
            "Cozy vibes and great coffee."
        };

        var mixedNotes = new[]
        {
            "Good but a bit pricey.",
            "Solid choice, nothing special though.",
            "Decent coffee, slow service.",
            "The {product} was okay, might try something else next time.",
            "Good flavor but too hot to drink right away.",
            "Nice spot but gets crowded.",
            "Coffee is good, pastries are average.",
            "Consistent quality, could use more seating."
        };

        var criticalNotes = new[]
        {
            "A bit too bitter for my taste.",
            "Expected more from the hype.",
            "Overextracted, tasted burnt.",
            "Service was slow today.",
            "Not bad but I've had better."
        };

        // Create check-ins and reviews
        var checkIns = new List<CheckIn>();
        var reviews = new List<Review>();

        // Generate ~100 reviews spread across the last 90 days
        for (int i = 0; i < 100; i++)
        {
            var user = users[random.Next(users.Count)];
            var shop = coffeeShops[random.Next(coffeeShops.Count)];
            var daysAgo = random.Next(1, 90);
            var hoursOffset = random.Next(0, 24);
            var checkInTime = DateTime.UtcNow.AddDays(-daysAgo).AddHours(-hoursOffset);

            var checkIn = new CheckIn
            {
                UserId = user.Id,
                CoffeeShopId = shop.Id,
                CheckedInAt = checkInTime,
                Notes = random.Next(4) == 0 ? "Great visit!" : null
            };

            checkIns.Add(checkIn);
        }

        context.CheckIns.AddRange(checkIns);
        await context.SaveChangesAsync();

        // Now add reviews to the check-ins
        foreach (var checkIn in checkIns)
        {
            // 1-3 reviews per check-in
            var reviewCount = random.Next(1, 4);
            var usedProducts = new HashSet<string>();

            for (int j = 0; j < reviewCount; j++)
            {
                string product;
                do
                {
                    product = products[random.Next(products.Length)];
                } while (usedProducts.Contains(product));
                usedProducts.Add(product);

                // Generate rating (weighted towards 4-5 stars)
                int rating;
                var ratingRoll = random.Next(100);
                if (ratingRoll < 40) rating = 5;
                else if (ratingRoll < 70) rating = 4;
                else if (ratingRoll < 85) rating = 3;
                else if (ratingRoll < 95) rating = 2;
                else rating = 1;

                // Select appropriate note based on rating
                string? notes = null;
                if (random.Next(3) != 0) // 66% chance of having notes
                {
                    if (rating >= 4)
                    {
                        notes = positiveNotes[random.Next(positiveNotes.Length)].Replace("{product}", product);
                    }
                    else if (rating == 3)
                    {
                        notes = mixedNotes[random.Next(mixedNotes.Length)].Replace("{product}", product);
                    }
                    else
                    {
                        notes = criticalNotes[random.Next(criticalNotes.Length)].Replace("{product}", product);
                    }
                }

                var review = new Review
                {
                    UserId = checkIn.UserId,
                    CheckInId = checkIn.Id,
                    ProductName = product,
                    Rating = rating,
                    Notes = notes,
                    CreatedAt = checkIn.CheckedInAt.AddMinutes(random.Next(5, 60))
                };

                reviews.Add(review);
            }
        }

        context.Reviews.AddRange(reviews);
        await context.SaveChangesAsync();

        Console.WriteLine($"Seeded {users.Count} users, {coffeeShops.Count} coffee shops, {checkIns.Count} check-ins, and {reviews.Count} reviews.");
    }
}

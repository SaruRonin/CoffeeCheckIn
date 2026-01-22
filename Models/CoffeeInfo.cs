namespace CoffeeCheckIn.Models;

public static class CoffeeKnowledge
{
    public static readonly Dictionary<string, RoastInfo> Roasts = new()
    {
        ["light"] = new RoastInfo
        {
            Name = "Light Roast",
            Color = "#C4A484",
            Flavor = "Bright, acidic, fruity, floral notes. Retains most origin characteristics.",
            Body = "Light",
            Caffeine = "Highest",
            BestFor = "Pour over, drip coffee",
            Description = "Roasted to just before or at first crack. Light brown color, no oil on surface."
        },
        ["medium"] = new RoastInfo
        {
            Name = "Medium Roast",
            Color = "#8B6914",
            Flavor = "Balanced acidity and body. Caramel, nutty, chocolate notes emerge.",
            Body = "Medium",
            Caffeine = "Moderate",
            BestFor = "All brewing methods",
            Description = "Roasted between first and second crack. Medium brown, little to no oil."
        },
        ["medium-dark"] = new RoastInfo
        {
            Name = "Medium-Dark Roast",
            Color = "#5C4033",
            Flavor = "Bittersweet, rich. Chocolate, spice notes. Less acidity.",
            Body = "Full",
            Caffeine = "Moderate-Low",
            BestFor = "Espresso, French press",
            Description = "Roasted to start of second crack. Dark brown with some oil on surface."
        },
        ["dark"] = new RoastInfo
        {
            Name = "Dark Roast",
            Color = "#3C2415",
            Flavor = "Bold, smoky, bitter. Roast flavor dominates over origin.",
            Body = "Heavy",
            Caffeine = "Lowest",
            BestFor = "Espresso, cold brew",
            Description = "Roasted through second crack. Shiny black, oily surface."
        }
    };

    public static readonly Dictionary<string, OriginInfo> Origins = new()
    {
        ["ethiopia"] = new OriginInfo
        {
            Country = "Ethiopia",
            Region = "East Africa",
            Flag = "🇪🇹",
            Flavor = "Floral, fruity, wine-like, blueberry, jasmine",
            Altitude = "1,500-2,200m",
            Process = "Washed & Natural",
            Description = "Birthplace of coffee. Known for complex, fruity profiles."
        },
        ["colombia"] = new OriginInfo
        {
            Country = "Colombia",
            Region = "South America",
            Flag = "🇨🇴",
            Flavor = "Balanced, nutty, caramel, mild fruit, citrus",
            Altitude = "1,200-2,000m",
            Process = "Washed",
            Description = "Consistently high quality. Smooth, well-balanced cups."
        },
        ["brazil"] = new OriginInfo
        {
            Country = "Brazil",
            Region = "South America",
            Flag = "🇧🇷",
            Flavor = "Nutty, chocolate, low acidity, sweet",
            Altitude = "800-1,600m",
            Process = "Natural & Pulped Natural",
            Description = "World's largest producer. Great for espresso blends."
        },
        ["kenya"] = new OriginInfo
        {
            Country = "Kenya",
            Region = "East Africa",
            Flag = "🇰🇪",
            Flavor = "Bright, wine-like acidity, blackcurrant, tomato",
            Altitude = "1,400-2,000m",
            Process = "Washed",
            Description = "Bold, complex flavors. Highly regarded AA grade."
        },
        ["guatemala"] = new OriginInfo
        {
            Country = "Guatemala",
            Region = "Central America",
            Flag = "🇬🇹",
            Flavor = "Chocolate, spice, floral, apple, full body",
            Altitude = "1,300-2,000m",
            Process = "Washed",
            Description = "Volcanic soil creates distinctive smoky-chocolate notes."
        },
        ["costa-rica"] = new OriginInfo
        {
            Country = "Costa Rica",
            Region = "Central America",
            Flag = "🇨🇷",
            Flavor = "Clean, bright, honey, citrus, balanced",
            Altitude = "1,200-1,800m",
            Process = "Washed & Honey",
            Description = "Known for clean, bright cups with excellent quality control."
        },
        ["indonesia"] = new OriginInfo
        {
            Country = "Indonesia",
            Region = "Southeast Asia",
            Flag = "🇮🇩",
            Flavor = "Earthy, herbal, spicy, full body, low acidity",
            Altitude = "900-1,800m",
            Process = "Wet-hulled (Giling Basah)",
            Description = "Sumatra, Java, Sulawesi. Unique earthy, bold profiles."
        },
        ["yemen"] = new OriginInfo
        {
            Country = "Yemen",
            Region = "Middle East",
            Flag = "🇾🇪",
            Flavor = "Wild, fruity, wine-like, chocolate, spice",
            Altitude = "1,500-2,500m",
            Process = "Natural",
            Description = "Ancient coffee tradition. Complex, exotic flavors."
        }
    };
}

public class RoastInfo
{
    public string Name { get; set; } = "";
    public string Color { get; set; } = "";
    public string Flavor { get; set; } = "";
    public string Body { get; set; } = "";
    public string Caffeine { get; set; } = "";
    public string BestFor { get; set; } = "";
    public string Description { get; set; } = "";
}

public class OriginInfo
{
    public string Country { get; set; } = "";
    public string Region { get; set; } = "";
    public string Flag { get; set; } = "";
    public string Flavor { get; set; } = "";
    public string Altitude { get; set; } = "";
    public string Process { get; set; } = "";
    public string Description { get; set; } = "";
}

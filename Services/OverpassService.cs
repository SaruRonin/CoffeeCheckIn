using System.Text.Json;

namespace CoffeeCheckIn.Services;

public class OverpassService
{
    private readonly HttpClient _httpClient;
    private const string OverpassUrl = "https://overpass-api.de/api/interpreter";

    public OverpassService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    public async Task<List<OverpassCoffeeShop>> GetNearbyCoffeeShops(double lat, double lng, int radiusMeters = 1000)
    {
        var query = $@"
            [out:json][timeout:25];
            (
              node[""amenity""=""cafe""](around:{radiusMeters},{lat},{lng});
              way[""amenity""=""cafe""](around:{radiusMeters},{lat},{lng});
              node[""cuisine""=""coffee""](around:{radiusMeters},{lat},{lng});
              way[""cuisine""=""coffee""](around:{radiusMeters},{lat},{lng});
              node[""shop""=""coffee""](around:{radiusMeters},{lat},{lng});
              way[""shop""=""coffee""](around:{radiusMeters},{lat},{lng});
            );
            out center;
        ";

        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("data", query)
        });

        try
        {
            var response = await _httpClient.PostAsync(OverpassUrl, content);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<OverpassResponse>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (result?.Elements == null)
                return new List<OverpassCoffeeShop>();

            var shops = new List<OverpassCoffeeShop>();
            var seenIds = new HashSet<long>();

            foreach (var element in result.Elements)
            {
                if (seenIds.Contains(element.Id))
                    continue;

                seenIds.Add(element.Id);

                var shopLat = element.Lat ?? element.Center?.Lat ?? 0;
                var shopLng = element.Lon ?? element.Center?.Lon ?? 0;

                if (shopLat == 0 || shopLng == 0)
                    continue;

                var name = element.Tags?.GetValueOrDefault("name") ?? "Unknown Coffee Shop";
                var address = BuildAddress(element.Tags);

                shops.Add(new OverpassCoffeeShop
                {
                    OsmId = element.Id,
                    Name = name,
                    Latitude = shopLat,
                    Longitude = shopLng,
                    Address = address,
                    Distance = CalculateDistance(lat, lng, shopLat, shopLng)
                });
            }

            return shops.OrderBy(s => s.Distance).ToList();
        }
        catch (Exception)
        {
            return new List<OverpassCoffeeShop>();
        }
    }

    private static string? BuildAddress(Dictionary<string, string>? tags)
    {
        if (tags == null) return null;

        var parts = new List<string>();

        if (tags.TryGetValue("addr:housenumber", out var houseNumber))
            parts.Add(houseNumber);
        if (tags.TryGetValue("addr:street", out var street))
            parts.Add(street);
        if (tags.TryGetValue("addr:city", out var city))
            parts.Add(city);

        return parts.Count > 0 ? string.Join(", ", parts) : null;
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371000; // Earth's radius in meters
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180;
}

public class OverpassResponse
{
    public List<OverpassElement>? Elements { get; set; }
}

public class OverpassElement
{
    public long Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public double? Lat { get; set; }
    public double? Lon { get; set; }
    public OverpassCenter? Center { get; set; }
    public Dictionary<string, string>? Tags { get; set; }
}

public class OverpassCenter
{
    public double Lat { get; set; }
    public double Lon { get; set; }
}

public class OverpassCoffeeShop
{
    public long OsmId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Address { get; set; }
    public double Distance { get; set; }
}

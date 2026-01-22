using System.ComponentModel.DataAnnotations;

namespace CoffeeCheckIn.Models;

public class CoffeeShop
{
    public int Id { get; set; }

    [Required]
    public long OsmId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    public DateTime CachedAt { get; set; } = DateTime.UtcNow;

    // Owner (for claimed shops)
    public int? OwnerId { get; set; }
    public User? Owner { get; set; }

    public bool IsClaimed { get; set; } = false;

    public ICollection<CheckIn> CheckIns { get; set; } = new List<CheckIn>();
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}

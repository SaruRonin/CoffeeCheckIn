using System.ComponentModel.DataAnnotations;

namespace CoffeeCheckIn.Models;

public class CheckIn
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int CoffeeShopId { get; set; }
    public CoffeeShop CoffeeShop { get; set; } = null!;

    public DateTime CheckedInAt { get; set; } = DateTime.UtcNow;

    [MaxLength(500)]
    public string? Notes { get; set; }

    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

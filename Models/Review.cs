using System.ComponentModel.DataAnnotations;

namespace CoffeeCheckIn.Models;

public class Review
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int CheckInId { get; set; }
    public CheckIn CheckIn { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string ProductName { get; set; } = string.Empty;

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

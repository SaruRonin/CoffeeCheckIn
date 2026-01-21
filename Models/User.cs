using System.ComponentModel.DataAnnotations;

namespace CoffeeCheckIn.Models;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CheckIn> CheckIns { get; set; } = new List<CheckIn>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

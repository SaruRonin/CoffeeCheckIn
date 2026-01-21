using System.ComponentModel.DataAnnotations;

namespace CoffeeCheckIn.Models;

// Auth DTOs
public class RegisterDto
{
    [Required]
    [MinLength(3)]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public int UserId { get; set; }
}

// CoffeeShop DTOs
public class CoffeeShopDto
{
    public int Id { get; set; }
    public long OsmId { get; set; }
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Address { get; set; }
    public double? Distance { get; set; }
}

// CheckIn DTOs
public class CreateCheckInDto
{
    [Required]
    public long OsmId { get; set; }

    [Required]
    public string ShopName { get; set; } = string.Empty;

    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? Address { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class CheckInDto
{
    public int Id { get; set; }
    public int CoffeeShopId { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public DateTime CheckedInAt { get; set; }
    public string? Notes { get; set; }
    public List<ReviewDto> Reviews { get; set; } = new();
}

// Review DTOs
public class CreateReviewDto
{
    [Required]
    public int CheckInId { get; set; }

    [Required]
    [MaxLength(100)]
    public string ProductName { get; set; } = string.Empty;

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}

public class ReviewDto
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? ShopName { get; set; }
}

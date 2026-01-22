using System.ComponentModel.DataAnnotations;

namespace CoffeeCheckIn.Models;

public class MenuItem
{
    public int Id { get; set; }

    public int CoffeeShopId { get; set; }
    public CoffeeShop CoffeeShop { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public decimal Price { get; set; }

    [MaxLength(50)]
    public string Category { get; set; } = "Coffee"; // Coffee, Tea, Food, Pastry, etc.

    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class MenuItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
}

public class CreateMenuItemDto
{
    [Required]
    public int CoffeeShopId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    public decimal Price { get; set; }

    [MaxLength(50)]
    public string Category { get; set; } = "Coffee";
}

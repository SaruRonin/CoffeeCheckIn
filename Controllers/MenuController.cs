using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CoffeeCheckIn.Data;
using CoffeeCheckIn.Models;

namespace CoffeeCheckIn.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MenuController : ControllerBase
{
    private readonly AppDbContext _context;

    public MenuController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(claim?.Value ?? "0");
    }

    [HttpGet("shop/{shopId}")]
    public async Task<ActionResult<List<MenuItemDto>>> GetShopMenu(int shopId)
    {
        var items = await _context.MenuItems
            .Where(m => m.CoffeeShopId == shopId && m.IsAvailable)
            .OrderBy(m => m.Category)
            .ThenBy(m => m.Name)
            .Select(m => new MenuItemDto
            {
                Id = m.Id,
                Name = m.Name,
                Description = m.Description,
                Price = m.Price,
                Category = m.Category,
                IsAvailable = m.IsAvailable
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("shop/osm/{osmId}")]
    public async Task<ActionResult<List<MenuItemDto>>> GetShopMenuByOsm(long osmId)
    {
        var shop = await _context.CoffeeShops.FirstOrDefaultAsync(s => s.OsmId == osmId);
        if (shop == null) return Ok(new List<MenuItemDto>());

        return await GetShopMenu(shop.Id);
    }

    [HttpPost]
    public async Task<ActionResult<MenuItemDto>> AddMenuItem(CreateMenuItemDto dto)
    {
        var userId = GetUserId();
        var shop = await _context.CoffeeShops.FindAsync(dto.CoffeeShopId);

        if (shop == null)
            return NotFound(new { message = "Shop not found" });

        // Only shop owner can add menu items
        if (shop.OwnerId != userId)
            return Forbid();

        var item = new MenuItem
        {
            CoffeeShopId = dto.CoffeeShopId,
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Category = dto.Category
        };

        _context.MenuItems.Add(item);
        await _context.SaveChangesAsync();

        return Ok(new MenuItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Description = item.Description,
            Price = item.Price,
            Category = item.Category,
            IsAvailable = item.IsAvailable
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMenuItem(int id)
    {
        var userId = GetUserId();
        var item = await _context.MenuItems
            .Include(m => m.CoffeeShop)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (item == null)
            return NotFound();

        if (item.CoffeeShop.OwnerId != userId)
            return Forbid();

        _context.MenuItems.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

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
public class CheckInsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CheckInsController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(claim?.Value ?? "0");
    }

    [HttpPost]
    public async Task<ActionResult<CheckInDto>> CreateCheckIn(CreateCheckInDto dto)
    {
        var userId = GetUserId();

        // Find or create the coffee shop
        var coffeeShop = await _context.CoffeeShops
            .FirstOrDefaultAsync(s => s.OsmId == dto.OsmId);

        if (coffeeShop == null)
        {
            coffeeShop = new CoffeeShop
            {
                OsmId = dto.OsmId,
                Name = dto.ShopName,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Address = dto.Address,
                CachedAt = DateTime.UtcNow
            };
            _context.CoffeeShops.Add(coffeeShop);
            await _context.SaveChangesAsync();
        }

        var checkIn = new CheckIn
        {
            UserId = userId,
            CoffeeShopId = coffeeShop.Id,
            CheckedInAt = DateTime.UtcNow,
            Notes = dto.Notes
        };

        _context.CheckIns.Add(checkIn);
        await _context.SaveChangesAsync();

        return Ok(new CheckInDto
        {
            Id = checkIn.Id,
            CoffeeShopId = coffeeShop.Id,
            ShopName = coffeeShop.Name,
            CheckedInAt = checkIn.CheckedInAt,
            Notes = checkIn.Notes,
            Reviews = new List<ReviewDto>()
        });
    }

    [HttpGet]
    public async Task<ActionResult<List<CheckInDto>>> GetMyCheckIns()
    {
        var userId = GetUserId();

        var checkIns = await _context.CheckIns
            .Include(c => c.CoffeeShop)
            .Include(c => c.Reviews)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CheckedInAt)
            .Select(c => new CheckInDto
            {
                Id = c.Id,
                CoffeeShopId = c.CoffeeShopId,
                ShopName = c.CoffeeShop.Name,
                CheckedInAt = c.CheckedInAt,
                Notes = c.Notes,
                Reviews = c.Reviews.Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductName = r.ProductName,
                    Rating = r.Rating,
                    Notes = r.Notes,
                    CreatedAt = r.CreatedAt
                }).ToList()
            })
            .ToListAsync();

        return Ok(checkIns);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CheckInDto>> GetCheckIn(int id)
    {
        var userId = GetUserId();

        var checkIn = await _context.CheckIns
            .Include(c => c.CoffeeShop)
            .Include(c => c.Reviews)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (checkIn == null)
            return NotFound();

        return Ok(new CheckInDto
        {
            Id = checkIn.Id,
            CoffeeShopId = checkIn.CoffeeShopId,
            ShopName = checkIn.CoffeeShop.Name,
            CheckedInAt = checkIn.CheckedInAt,
            Notes = checkIn.Notes,
            Reviews = checkIn.Reviews.Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductName = r.ProductName,
                Rating = r.Rating,
                Notes = r.Notes,
                CreatedAt = r.CreatedAt
            }).ToList()
        });
    }
}

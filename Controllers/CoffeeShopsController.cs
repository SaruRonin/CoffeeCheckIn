using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CoffeeCheckIn.Data;
using CoffeeCheckIn.Models;
using CoffeeCheckIn.Services;

namespace CoffeeCheckIn.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoffeeShopsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly OverpassService _overpassService;

    public CoffeeShopsController(AppDbContext context, OverpassService overpassService)
    {
        _context = context;
        _overpassService = overpassService;
    }

    [HttpGet("seeded")]
    public async Task<ActionResult<List<CoffeeShopDto>>> GetSeededShops()
    {
        var shops = await _context.CoffeeShops
            .OrderBy(s => s.Name)
            .Select(s => new CoffeeShopDto
            {
                Id = s.Id,
                OsmId = s.OsmId,
                Name = s.Name,
                Latitude = s.Latitude,
                Longitude = s.Longitude,
                Address = s.Address
            })
            .ToListAsync();

        return Ok(shops);
    }

    [HttpGet("nearby")]
    public async Task<ActionResult<List<CoffeeShopDto>>> GetNearby(
        [FromQuery] double lat,
        [FromQuery] double lng,
        [FromQuery] int radius = 1000)
    {
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
            return BadRequest(new { message = "Invalid coordinates" });

        if (radius < 100 || radius > 5000)
            radius = 1000;

        var shops = await _overpassService.GetNearbyCoffeeShops(lat, lng, radius);

        var result = shops.Select(s => new CoffeeShopDto
        {
            OsmId = s.OsmId,
            Name = s.Name,
            Latitude = s.Latitude,
            Longitude = s.Longitude,
            Address = s.Address,
            Distance = Math.Round(s.Distance, 0)
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CoffeeShopDto>> GetById(int id)
    {
        var shop = await _context.CoffeeShops.FindAsync(id);

        if (shop == null)
            return NotFound();

        return Ok(new CoffeeShopDto
        {
            Id = shop.Id,
            OsmId = shop.OsmId,
            Name = shop.Name,
            Latitude = shop.Latitude,
            Longitude = shop.Longitude,
            Address = shop.Address
        });
    }

    [HttpGet("{id}/reviews")]
    public async Task<ActionResult<List<ReviewDto>>> GetShopReviews(int id)
    {
        var shop = await _context.CoffeeShops
            .Include(s => s.CheckIns)
                .ThenInclude(c => c.Reviews)
                    .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (shop == null)
            return NotFound();

        var reviews = shop.CheckIns
            .SelectMany(c => c.Reviews)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductName = r.ProductName,
                Rating = r.Rating,
                Notes = r.Notes,
                CreatedAt = r.CreatedAt,
                Username = r.User.Username
            })
            .ToList();

        return Ok(reviews);
    }

    [HttpGet("osm/{osmId}/reviews")]
    public async Task<ActionResult<List<ReviewDto>>> GetShopReviewsByOsmId(long osmId)
    {
        var shop = await _context.CoffeeShops
            .Include(s => s.CheckIns)
                .ThenInclude(c => c.Reviews)
                    .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(s => s.OsmId == osmId);

        if (shop == null)
            return Ok(new List<ReviewDto>());

        var reviews = shop.CheckIns
            .SelectMany(c => c.Reviews)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductName = r.ProductName,
                Rating = r.Rating,
                Notes = r.Notes,
                CreatedAt = r.CreatedAt,
                Username = r.User.Username
            })
            .ToList();

        return Ok(reviews);
    }
}

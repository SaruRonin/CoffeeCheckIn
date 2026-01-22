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
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(claim?.Value ?? "0");
    }

    [HttpPost]
    public async Task<ActionResult<ReviewDto>> CreateReview(CreateReviewDto dto)
    {
        var userId = GetUserId();

        var checkIn = await _context.CheckIns
            .Include(c => c.CoffeeShop)
            .FirstOrDefaultAsync(c => c.Id == dto.CheckInId && c.UserId == userId);

        if (checkIn == null)
            return NotFound(new { message = "Check-in not found" });

        var review = new Review
        {
            UserId = userId,
            CheckInId = dto.CheckInId,
            ProductName = dto.ProductName,
            Rating = dto.Rating,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return Ok(new ReviewDto
        {
            Id = review.Id,
            ProductName = review.ProductName,
            Rating = review.Rating,
            Notes = review.Notes,
            CreatedAt = review.CreatedAt,
            Username = user?.Username ?? "Unknown",
            ShopName = checkIn.CoffeeShop.Name
        });
    }

    [HttpGet]
    public async Task<ActionResult<List<ReviewDto>>> GetMyReviews()
    {
        var userId = GetUserId();

        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.CheckIn)
                .ThenInclude(c => c.CoffeeShop)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductName = r.ProductName,
                Rating = r.Rating,
                Notes = r.Notes,
                CreatedAt = r.CreatedAt,
                UserId = r.UserId,
                Username = r.User.Username,
                UserProfilePicture = r.User.ProfilePictureUrl,
                ShopName = r.CheckIn.CoffeeShop.Name
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpGet("feed")]
    public async Task<ActionResult<List<ReviewDto>>> GetFeed(
        [FromQuery] string sort = "recent",
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0)
    {
        var query = _context.Reviews
            .Include(r => r.User)
            .Include(r => r.CheckIn)
                .ThenInclude(c => c.CoffeeShop)
            .AsQueryable();

        // Sort by recent or by place
        query = sort.ToLower() switch
        {
            "place" => query.OrderBy(r => r.CheckIn.CoffeeShop.Name).ThenByDescending(r => r.CreatedAt),
            _ => query.OrderByDescending(r => r.CreatedAt)
        };

        var reviews = await query
            .Skip(offset)
            .Take(Math.Min(limit, 100))
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductName = r.ProductName,
                Rating = r.Rating,
                Notes = r.Notes,
                CreatedAt = r.CreatedAt,
                UserId = r.UserId,
                Username = r.User.Username,
                UserProfilePicture = r.User.ProfilePictureUrl,
                ShopName = r.CheckIn.CoffeeShop.Name
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpGet("feed/grouped")]
    public async Task<ActionResult<object>> GetFeedGrouped()
    {
        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.CheckIn)
                .ThenInclude(c => c.CoffeeShop)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var grouped = reviews
            .GroupBy(r => new { r.CheckIn.CoffeeShop.Id, r.CheckIn.CoffeeShop.Name })
            .Select(g => new
            {
                ShopId = g.Key.Id,
                ShopName = g.Key.Name,
                ReviewCount = g.Count(),
                AverageRating = Math.Round(g.Average(r => r.Rating), 1),
                Reviews = g.OrderByDescending(r => r.CreatedAt).Take(10).Select(r => new ReviewDto
                {
                    Id = r.Id,
                    ProductName = r.ProductName,
                    Rating = r.Rating,
                    Notes = r.Notes,
                    CreatedAt = r.CreatedAt,
                    UserId = r.UserId,
                    Username = r.User.Username,
                    UserProfilePicture = r.User.ProfilePictureUrl,
                    ShopName = r.CheckIn.CoffeeShop.Name
                }).ToList()
            })
            .OrderByDescending(g => g.ReviewCount)
            .ToList();

        return Ok(grouped);
    }

    [HttpGet("feed/stats")]
    public async Task<ActionResult<object>> GetFeedStats()
    {
        var totalReviews = await _context.Reviews.CountAsync();
        var totalCheckIns = await _context.CheckIns.CountAsync();
        var totalShops = await _context.CoffeeShops.CountAsync();
        var avgRating = await _context.Reviews.AverageAsync(r => (double?)r.Rating) ?? 0;

        var topProducts = await _context.Reviews
            .GroupBy(r => r.ProductName)
            .Select(g => new { Product = g.Key, Count = g.Count(), AvgRating = g.Average(r => r.Rating) })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToListAsync();

        return Ok(new
        {
            totalReviews,
            totalCheckIns,
            totalShops,
            avgRating = Math.Round(avgRating, 1),
            topProducts
        });
    }
}

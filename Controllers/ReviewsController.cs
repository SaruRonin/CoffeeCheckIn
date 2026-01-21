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
                Username = r.User.Username,
                ShopName = r.CheckIn.CoffeeShop.Name
            })
            .ToListAsync();

        return Ok(reviews);
    }
}

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
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(claim?.Value ?? "0");
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile()
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return NotFound();

        var totalCheckIns = await _context.CheckIns.CountAsync(c => c.UserId == userId);
        var totalReviews = await _context.Reviews.CountAsync(r => r.UserId == userId);

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Bio = user.Bio,
            ProfilePictureUrl = user.ProfilePictureUrl,
            ThemeColor = user.ThemeColor,
            InstagramHandle = user.InstagramHandle,
            CreatedAt = user.CreatedAt,
            TotalCheckIns = totalCheckIns,
            TotalReviews = totalReviews
        });
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserProfileDto>> UpdateMyProfile(UpdateProfileDto dto)
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return NotFound();

        if (dto.Bio != null)
            user.Bio = dto.Bio;
        if (dto.ProfilePictureUrl != null)
            user.ProfilePictureUrl = dto.ProfilePictureUrl;
        if (dto.ThemeColor != null)
            user.ThemeColor = dto.ThemeColor;
        if (dto.InstagramHandle != null)
            user.InstagramHandle = dto.InstagramHandle;

        await _context.SaveChangesAsync();

        var totalCheckIns = await _context.CheckIns.CountAsync(c => c.UserId == userId);
        var totalReviews = await _context.Reviews.CountAsync(r => r.UserId == userId);

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Bio = user.Bio,
            ProfilePictureUrl = user.ProfilePictureUrl,
            ThemeColor = user.ThemeColor,
            InstagramHandle = user.InstagramHandle,
            CreatedAt = user.CreatedAt,
            TotalCheckIns = totalCheckIns,
            TotalReviews = totalReviews
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserProfileDto>> GetUserProfile(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        var totalCheckIns = await _context.CheckIns.CountAsync(c => c.UserId == id);
        var totalReviews = await _context.Reviews.CountAsync(r => r.UserId == id);

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Bio = user.Bio,
            ProfilePictureUrl = user.ProfilePictureUrl,
            ThemeColor = user.ThemeColor,
            InstagramHandle = user.InstagramHandle,
            CreatedAt = user.CreatedAt,
            TotalCheckIns = totalCheckIns,
            TotalReviews = totalReviews
        });
    }
}

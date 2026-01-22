using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CoffeeCheckIn.Models;

namespace CoffeeCheckIn.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoffeeInfoController : ControllerBase
{
    [HttpGet("roasts")]
    public ActionResult<Dictionary<string, RoastInfo>> GetRoasts()
    {
        return Ok(CoffeeKnowledge.Roasts);
    }

    [HttpGet("roasts/{id}")]
    public ActionResult<RoastInfo> GetRoast(string id)
    {
        if (CoffeeKnowledge.Roasts.TryGetValue(id.ToLower(), out var roast))
            return Ok(roast);
        return NotFound();
    }

    [HttpGet("origins")]
    public ActionResult<Dictionary<string, OriginInfo>> GetOrigins()
    {
        return Ok(CoffeeKnowledge.Origins);
    }

    [HttpGet("origins/{id}")]
    public ActionResult<OriginInfo> GetOrigin(string id)
    {
        if (CoffeeKnowledge.Origins.TryGetValue(id.ToLower(), out var origin))
            return Ok(origin);
        return NotFound();
    }
}

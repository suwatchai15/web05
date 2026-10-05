using Microsoft.AspNetCore.Mvc;

namespace MassagePlatform.WebApi.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<HealthResponse> Get()
    {
        return Ok(new HealthResponse("healthy", "Massage Platform API"));
    }
}

public sealed record HealthResponse(string Status, string Service);

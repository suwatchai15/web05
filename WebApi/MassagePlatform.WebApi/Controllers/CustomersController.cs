using System.ComponentModel.DataAnnotations;
using MassagePlatform.WebApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MassagePlatform.WebApi.Controllers;

[ApiController, Authorize(Roles = "Owner,Manager,Staff")]
[Route("api/customers")]
public sealed class CustomersController(TenantDbContext db) : ControllerBase
{
    private static readonly string[] CustomerTypes = ["\u0056\u0049\u0050", "\u0e2a\u0e21\u0e32\u0e0a\u0e34\u0e01", "\u0e25\u0e39\u0e01\u0e04\u0e49\u0e32\u0e43\u0e2b\u0e21\u0e48", "\u0e17\u0e31\u0e48\u0e27\u0e44\u0e1b"];

    private static bool IsCustomerTypeValid(string type) => CustomerTypes.Contains(type, StringComparer.Ordinal);
    [HttpGet]
    public Task<List<Customer>> List([FromQuery] string? search, CancellationToken ct)
    {
        var customers = db.Customers.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
            customers = customers.Where(x => x.Name.Contains(search) || (x.Email != null && x.Email.Contains(search)) || (x.Phone != null && x.Phone.Contains(search)));
        return customers.OrderBy(x => x.Name).Take(200).ToListAsync(ct);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CustomerRequest request, CancellationToken ct)
    {
        if (!IsCustomerTypeValid(request.Type)) return BadRequest(new { error = "Invalid customer type." });
        var customer = new Customer { Name = request.Name.Trim(), Email = request.Email?.Trim(), Phone = request.Phone?.Trim(), Notes = request.Notes, Type = request.Type };
        db.Customers.Add(customer);
        await db.SaveChangesAsync(ct);
        return Created($"/api/customers/{customer.Id}", customer);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, CustomerRequest request, CancellationToken ct)
    {
        var customer = await db.Customers.FindAsync([id], ct);
        if (customer is null) return NotFound();
        if (!IsCustomerTypeValid(request.Type)) return BadRequest(new { error = "Invalid customer type." });
        customer.Name = request.Name.Trim(); customer.Email = request.Email?.Trim(); customer.Phone = request.Phone?.Trim(); customer.Notes = request.Notes; customer.Type = request.Type;
        await db.SaveChangesAsync(ct);
        return Ok(customer);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var customer = await db.Customers.FindAsync([id], ct);
        if (customer is null) return NotFound();
        db.Customers.Remove(customer);
        try { await db.SaveChangesAsync(ct); return NoContent(); }
        catch (DbUpdateException) { return Conflict(new { error = "Customer has appointments." }); }
    }
}

public sealed record CustomerRequest([Required, StringLength(160, MinimumLength = 1)] string Name,
    [EmailAddress, StringLength(254)] string? Email, [StringLength(40)] string? Phone, [StringLength(1000)] string? Notes,
    [StringLength(24)] string Type = "\u0e17\u0e31\u0e48\u0e27\u0e44\u0e1b");

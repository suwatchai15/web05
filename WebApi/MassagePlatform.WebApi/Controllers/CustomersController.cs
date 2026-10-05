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
        var customer = new Customer { Name = request.Name.Trim(), Email = request.Email?.Trim(), Phone = request.Phone?.Trim(), Notes = request.Notes };
        db.Customers.Add(customer);
        await db.SaveChangesAsync(ct);
        return Created($"/api/customers/{customer.Id}", customer);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, CustomerRequest request, CancellationToken ct)
    {
        var customer = await db.Customers.FindAsync([id], ct);
        if (customer is null) return NotFound();
        customer.Name = request.Name.Trim(); customer.Email = request.Email?.Trim(); customer.Phone = request.Phone?.Trim(); customer.Notes = request.Notes;
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
    [EmailAddress, StringLength(254)] string? Email, [StringLength(40)] string? Phone, [StringLength(1000)] string? Notes);

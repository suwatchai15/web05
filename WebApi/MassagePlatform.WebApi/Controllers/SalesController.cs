using System.ComponentModel.DataAnnotations;
using System.Globalization;
using MassagePlatform.WebApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace MassagePlatform.WebApi.Controllers;

[ApiController, Authorize(Roles = "Owner,Manager,Staff")]
[Route("api/sales")]
public sealed class SalesController(TenantDbContext db) : ControllerBase
{
    private static readonly HashSet<string> PaymentMethods = ["Cash", "BankTransfer", "Card"];
    private const long SaleNumberLockKey = 0x53414c4553455249L;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SaleResponse>>> List(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] Guid? branchId,
        CancellationToken ct)
    {
        if (from.HasValue && to.HasValue && from >= to)
            return BadRequest(new { error = "'from' must be earlier than 'to'." });

        var query = db.Sales.AsNoTracking().Include(x => x.Items).AsQueryable();
        if (from.HasValue) query = query.Where(x => x.CreatedAt >= from.Value);
        if (to.HasValue) query = query.Where(x => x.CreatedAt < to.Value);
        if (branchId.HasValue) query = query.Where(x => x.BranchId == branchId.Value);
        var sales = await query.OrderByDescending(x => x.CreatedAt).Take(500).ToListAsync(ct);
        return Ok(sales.Select(ToResponse).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SaleResponse>> Get(Guid id, CancellationToken ct)
    {
        var sale = await db.Sales.AsNoTracking().Include(x => x.Items).SingleOrDefaultAsync(x => x.Id == id, ct);
        return sale is null ? NotFound() : Ok(ToResponse(sale));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateSaleRequest request, CancellationToken ct)
    {
        if (request.Items.Select(x => x.ServiceId).Distinct().Count() != request.Items.Count)
            return BadRequest(new { error = "Each service may only appear once in a sale. Set its quantity instead." });
        if (!PaymentMethods.Contains(request.PaymentMethod))
            return BadRequest(new { error = "PaymentMethod must be Cash, BankTransfer, or Card." });

        var branchTimeZoneId = await db.Branches.AsNoTracking()
            .Where(x => x.Id == request.BranchId && x.IsActive)
            .Select(x => x.TimeZone)
            .SingleOrDefaultAsync(ct);
        if (branchTimeZoneId is null)
            return BadRequest(new { error = "Active branch not found." });
        if (request.CustomerId.HasValue && !await db.Customers.AnyAsync(x => x.Id == request.CustomerId.Value, ct))
            return BadRequest(new { error = "Customer not found." });
        if (request.StaffId.HasValue &&
            !await db.Staff.AnyAsync(x => x.Id == request.StaffId.Value && x.BranchId == request.BranchId && x.IsActive, ct))
            return BadRequest(new { error = "Active staff member for the selected branch not found." });
        if (request.RoomId.HasValue &&
            !await db.Rooms.AnyAsync(x => x.Id == request.RoomId.Value && x.BranchId == request.BranchId && x.IsActive, ct))
            return BadRequest(new { error = "Active room for the selected branch not found." });

        var serviceIds = request.Items.Select(x => x.ServiceId).ToArray();
        var services = await db.Services.AsNoTracking()
            .Where(x => serviceIds.Contains(x.Id) && x.IsActive)
            .ToDictionaryAsync(x => x.Id, ct);
        if (services.Count != serviceIds.Length)
            return BadRequest(new { error = "One or more active services were not found." });

        Appointment? appointment = null;
        if (request.AppointmentId.HasValue)
        {
            appointment = await db.Appointments.SingleOrDefaultAsync(x => x.Id == request.AppointmentId.Value, ct);
            if (appointment is null)
                return BadRequest(new { error = "Appointment not found." });
            if (appointment.Status is "Cancelled" || appointment.PaidSaleId.HasValue)
                return Conflict(new { error = "This appointment cannot be paid again." });
            if (appointment.Status is not ("InProgress" or "Completed"))
                return Conflict(new { error = "Start the appointment before taking payment." });
            if (appointment.BranchId != request.BranchId
                || appointment.CustomerId != request.CustomerId
                || appointment.StaffId != request.StaffId
                || appointment.RoomId != request.RoomId
                || !serviceIds.Contains(appointment.ServiceId))
                return BadRequest(new { error = "The sale details must match the linked appointment." });
        }

        var items = request.Items.Select(item =>
        {
            var service = services[item.ServiceId];
            return new PosSaleItem
            {
                ServiceId = service.Id,
                ServiceName = service.Name,
                Quantity = item.Quantity,
                UnitPrice = service.Price,
                LineTotal = service.Price * item.Quantity
            };
        }).ToList();
        var subtotal = items.Sum(x => x.LineTotal);
        if (subtotal > 99_999_999.99m)
            return BadRequest(new { error = "Sale total exceeds the supported amount." });
        var createdAt = DateTimeOffset.UtcNow;
        var businessDate = TimeZoneInfo.ConvertTime(createdAt, ResolveTimeZone(branchTimeZoneId)).ToString("yyMMdd", CultureInfo.InvariantCulture);
        var saleNumberPrefix = $"S-{businessDate}-";
        var sale = new PosSale
        {
            CreatedAt = createdAt,
            BranchId = request.BranchId,
            CustomerId = request.CustomerId,
            StaffId = request.StaffId,
            RoomId = request.RoomId,
            AppointmentId = request.AppointmentId,
            PaymentMethod = request.PaymentMethod,
            Subtotal = subtotal,
            Total = subtotal,
            Items = items
        };
        if (appointment is not null) appointment.PaidSaleId = sale.Id;
        await using (var transaction = await db.Database.BeginTransactionAsync(ct))
        {
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock({SaleNumberLockKey})", ct);
            var existingNumbers = await db.Sales.AsNoTracking()
                .Where(x => x.SaleNumber.StartsWith(saleNumberPrefix))
                .Select(x => x.SaleNumber)
                .ToListAsync(ct);
            var nextNumber = existingNumbers
                .Select(number => int.TryParse(number.AsSpan(saleNumberPrefix.Length), NumberStyles.None,
                    CultureInfo.InvariantCulture, out var sequence) ? sequence : 0)
                .DefaultIfEmpty(0)
                .Max() + 1;
            sale.SaleNumber = $"{saleNumberPrefix}{nextNumber:D4}";
            db.Sales.Add(sale);

            try
            {
                await db.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);
            }
            catch (DbUpdateException exception) when (
                exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation, ConstraintName: "IX_Sales_AppointmentId" })
            {
                return Conflict(new { error = "This appointment has already been paid." });
            }
        }
        return CreatedAtAction(nameof(Get), new { id = sale.Id }, ToResponse(sale));
    }

    private static TimeZoneInfo ResolveTimeZone(string timeZoneId)
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.Utc;
        }
        catch (InvalidTimeZoneException)
        {
            return TimeZoneInfo.Utc;
        }
    }

    private static SaleResponse ToResponse(PosSale sale) => new(
        sale.Id,
        sale.SaleNumber,
        sale.BranchId,
        sale.CustomerId,
        sale.StaffId,
        sale.RoomId,
        sale.PaymentMethod,
        sale.Status,
        sale.Subtotal,
        sale.Discount,
        sale.Total,
        sale.CreatedAt,
        sale.Items.OrderBy(x => x.ServiceName)
            .Select(x => new SaleItemResponse(x.Id, x.ServiceId, x.ServiceName, x.Quantity, x.UnitPrice, x.LineTotal))
            .ToList());
}

public sealed record CreateSaleRequest(
    Guid BranchId,
    Guid? CustomerId,
    Guid? StaffId,
    Guid? RoomId,
    [Required, StringLength(24)] string PaymentMethod,
    [Required, MinLength(1), MaxLength(50)] IReadOnlyList<SaleItemRequest> Items,
    Guid? AppointmentId = null);

public sealed record SaleItemRequest(Guid ServiceId, [Range(1, 99)] int Quantity);

public sealed record SaleResponse(
    Guid Id,
    string SaleNumber,
    Guid BranchId,
    Guid? CustomerId,
    Guid? StaffId,
    Guid? RoomId,
    string PaymentMethod,
    string Status,
    decimal Subtotal,
    decimal Discount,
    decimal Total,
    DateTimeOffset CreatedAt,
    IReadOnlyList<SaleItemResponse> Items);

public sealed record SaleItemResponse(
    Guid Id,
    Guid? ServiceId,
    string ServiceName,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal);

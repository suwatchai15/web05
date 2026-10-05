using System.ComponentModel.DataAnnotations;
using MassagePlatform.WebApi.Data;
using MassagePlatform.WebApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace MassagePlatform.WebApi.Controllers;

[ApiController, Authorize(Roles = "Owner,Manager,Staff")]
[Route("api/appointments")]
public sealed class AppointmentsController(TenantDbContext db) : ControllerBase
{
    [HttpGet]
    public Task<List<Appointment>> List(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] Guid? branchId,
        CancellationToken ct)
    {
        var query = db.Appointments.AsNoTracking();
        if (from.HasValue) query = query.Where(x => x.StartsAt >= from);
        if (to.HasValue) query = query.Where(x => x.StartsAt < to);
        if (branchId.HasValue) query = query.Where(x => x.BranchId == branchId.Value);
        return query.OrderBy(x => x.StartsAt).Take(500).ToListAsync(ct);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Appointment>> Get(Guid id, CancellationToken ct)
    {
        var appointment = await db.Appointments.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        return appointment is null ? NotFound() : Ok(appointment);
    }

    [HttpPost]
    public async Task<IActionResult> Create(AppointmentRequest request, CancellationToken ct)
    {
        var validation = await ValidateAsync(request, ct);
        if (validation is not null) return BadRequest(new { error = validation });
        var service = await db.Services.SingleAsync(x => x.Id == request.ServiceId, ct);
        var appointment = new Appointment
        {
            BranchId = request.BranchId, ServiceId = request.ServiceId, StaffId = request.StaffId,
            CustomerId = request.CustomerId, RoomId = request.RoomId, StartsAt = request.StartsAt,
            EndsAt = request.StartsAt.AddMinutes(service.DurationMinutes), Notes = request.Notes?.Trim()
        };
        db.Appointments.Add(appointment);
        return await SaveWithOverlapResponse(appointment, created: true, ct);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, AppointmentRequest request, CancellationToken ct)
    {
        var appointment = await db.Appointments.FindAsync([id], ct);
        if (appointment is null) return NotFound();
        if (appointment.Status == "Cancelled" || appointment.Status == "Completed")
            return Conflict(new { error = "Completed or cancelled appointments cannot be rescheduled." });
        if (appointment.PaidSaleId.HasValue)
            return Conflict(new { error = "Paid appointments cannot be rescheduled." });
        var validation = await ValidateAsync(request, ct);
        if (validation is not null) return BadRequest(new { error = validation });
        var service = await db.Services.SingleAsync(x => x.Id == request.ServiceId, ct);
        appointment.BranchId = request.BranchId; appointment.ServiceId = request.ServiceId;
        appointment.StaffId = request.StaffId; appointment.CustomerId = request.CustomerId;
        appointment.RoomId = request.RoomId; appointment.StartsAt = request.StartsAt;
        appointment.EndsAt = request.StartsAt.AddMinutes(service.DurationMinutes); appointment.Notes = request.Notes?.Trim();
        return await SaveWithOverlapResponse(appointment, created: false, ct);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid id, AppointmentStatusRequest request, CancellationToken ct)
    {
        if (request.Status is not ("InProgress" or "Completed" or "Cancelled"))
            return BadRequest(new { error = "Status must be InProgress, Completed, or Cancelled." });
        var appointment = await db.Appointments.FindAsync([id], ct);
        if (appointment is null) return NotFound();
        if (appointment.Status is "Completed" or "Cancelled")
            return Conflict(new { error = "Completed or cancelled appointments are final." });
        if (appointment.PaidSaleId.HasValue && request.Status != "Completed")
            return Conflict(new { error = "Paid appointments can only be completed." });
        if (request.Status == "InProgress" && appointment.Status != "Scheduled")
            return Conflict(new { error = "Only scheduled appointments can be started." });
        appointment.Status = request.Status;
        await db.SaveChangesAsync(ct);
        return Ok(appointment);
    }

    private async Task<string?> ValidateAsync(AppointmentRequest request, CancellationToken ct)
    {
        if (request.StartsAt.Offset != TimeSpan.Zero)
            return "StartsAt must be an ISO-8601 UTC timestamp (Z).";
        var service = await db.Services.SingleOrDefaultAsync(x => x.Id == request.ServiceId && x.IsActive, ct);
        if (service is null) return "Active service not found.";
        if (!await db.Staff.AnyAsync(x => x.Id == request.StaffId && x.BranchId == request.BranchId && x.IsActive, ct)) return "Active staff member for the selected branch not found.";
        if (!await db.Rooms.AnyAsync(x => x.Id == request.RoomId && x.BranchId == request.BranchId && x.IsActive, ct)) return "Active room for the selected branch not found.";
        var branch = await db.Branches.SingleOrDefaultAsync(x => x.Id == request.BranchId && x.IsActive, ct);
        if (branch is null) return "Active branch not found.";
        if (!await db.Customers.AnyAsync(x => x.Id == request.CustomerId, ct)) return "Customer not found.";

        TimeZoneInfo timeZone;
        try
        {
            timeZone = TimeZoneInfo.FindSystemTimeZoneById(branch.TimeZone);
        }
        catch (TimeZoneNotFoundException)
        {
            return $"Branch time zone '{branch.TimeZone}' is invalid or unsupported.";
        }
        catch (InvalidTimeZoneException)
        {
            return $"Branch time zone '{branch.TimeZone}' has invalid time-zone data.";
        }

        var endsAt = request.StartsAt.AddMinutes(service.DurationMinutes);
        var localStart = TimeZoneInfo.ConvertTime(request.StartsAt, timeZone);
        var localDate = DateOnly.FromDateTime(localStart.DateTime);
        var exception = await db.StaffScheduleExceptions.AsNoTracking().Include(x => x.Shifts)
            .SingleOrDefaultAsync(x => x.StaffId == request.StaffId && x.Date == localDate, ct);
        if (exception?.IsDayOff == true)
            return "The staff member is not available on this date (day off).";

        IReadOnlyList<ScheduleTimeRange> shifts;
        if (exception is not null)
        {
            shifts = exception.Shifts.Select(x => new ScheduleTimeRange(x.StartTime, x.EndTime)).ToList();
        }
        else
        {
            var dayOfWeek = ((int)localStart.DayOfWeek + 6) % 7 + 1;
            shifts = await db.WeeklyScheduleShifts.AsNoTracking()
                .Where(x => x.StaffId == request.StaffId && x.DayOfWeek == dayOfWeek)
                .Select(x => new ScheduleTimeRange(x.StartTime, x.EndTime)).ToListAsync(ct);
        }

        if (!StaffScheduleRules.IsAvailable(request.StartsAt, endsAt, timeZone, shifts, out var availabilityError))
            return availabilityError;
        return null;
    }

    private async Task<IActionResult> SaveWithOverlapResponse(Appointment appointment, bool created, CancellationToken ct)
    {
        try
        {
            await db.SaveChangesAsync(ct);
            return created ? Created($"/api/appointments/{appointment.Id}", appointment) : Ok(appointment);
        }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.ExclusionViolation })
        {
            return Conflict(new { error = "The room or staff member already has an appointment during this time." });
        }
    }
}

public sealed record AppointmentRequest(Guid BranchId, Guid ServiceId, Guid StaffId, Guid CustomerId,
    Guid RoomId, DateTimeOffset StartsAt, [StringLength(1000)] string? Notes);
public sealed record AppointmentStatusRequest(string Status);

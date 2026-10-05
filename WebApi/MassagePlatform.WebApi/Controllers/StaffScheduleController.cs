using System.Globalization;
using MassagePlatform.WebApi.Data;
using MassagePlatform.WebApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace MassagePlatform.WebApi.Controllers;

[ApiController, Authorize(Roles = "Owner,Manager,Staff")]
[Route("api/staff/{id:guid}/schedule")]
public sealed class StaffScheduleController(TenantDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetWeekly(Guid id, CancellationToken ct)
    {
        if (!await db.Staff.AnyAsync(x => x.Id == id, ct)) return NotFound();
        var shifts = await db.WeeklyScheduleShifts.AsNoTracking()
            .Where(x => x.StaffId == id).OrderBy(x => x.DayOfWeek).ThenBy(x => x.StartTime).ToListAsync(ct);
        return Ok(new WeeklyScheduleResponse(Enumerable.Range(1, 7)
            .Select(day => new WeeklyScheduleDayResponse(day, shifts.Where(x => x.DayOfWeek == day)
                .Select(FormatShift).ToList())).ToList()));
    }

    [HttpPut]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> PutWeekly(Guid id, WeeklyScheduleRequest request, CancellationToken ct)
    {
        if (!await db.Staff.AnyAsync(x => x.Id == id, ct)) return NotFound();
        if (request.Days is null) return BadRequest(new { error = "Days is required." });
        if (request.Days.Any(x => x.DayOfWeek is < 1 or > 7) ||
            request.Days.Select(x => x.DayOfWeek).Distinct().Count() != request.Days.Count)
            return BadRequest(new { error = "Days must contain unique dayOfWeek values from 1 (Monday) through 7 (Sunday)." });

        var parsed = new List<(int Day, List<ScheduleTimeRange> Shifts)>();
        foreach (var day in request.Days)
        {
            if (day.Shifts is null)
                return BadRequest(new { error = $"Shifts are required for day {day.DayOfWeek}." });
            var ranges = ParseShifts(day.Shifts);
            if (ranges is null || !StaffScheduleRules.AreValidShifts(ranges))
                return BadRequest(new { error = $"Day {day.DayOfWeek} shifts must use valid HH:mm times, end after start, and not overlap." });
            parsed.Add((day.DayOfWeek, ranges));
        }

        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        var existing = await db.WeeklyScheduleShifts.Where(x => x.StaffId == id).ToListAsync(ct);
        db.WeeklyScheduleShifts.RemoveRange(existing);
        await db.SaveChangesAsync(ct);
        db.WeeklyScheduleShifts.AddRange(parsed.SelectMany(day => day.Shifts.Select(shift =>
            new WeeklyScheduleShift
            {
                StaffId = id, DayOfWeek = day.Day,
                StartTime = shift.Start, EndTime = shift.End
            })));
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return await GetWeekly(id, ct);
    }

    [HttpGet("exceptions")]
    public async Task<IActionResult> GetExceptions(Guid id, CancellationToken ct)
    {
        if (!await db.Staff.AnyAsync(x => x.Id == id, ct)) return NotFound();
        var exceptions = await db.StaffScheduleExceptions.AsNoTracking().Include(x => x.Shifts)
            .Where(x => x.StaffId == id).OrderBy(x => x.Date).ToListAsync(ct);
        return Ok(exceptions.Select(ToResponse));
    }

    [HttpPost("exceptions")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> CreateException(Guid id, ScheduleExceptionRequest request, CancellationToken ct)
    {
        if (!await db.Staff.AnyAsync(x => x.Id == id, ct)) return NotFound();
        if (!DateOnly.TryParseExact(request.Date, "yyyy-MM-dd", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var date))
            return BadRequest(new { error = "Date must use YYYY-MM-DD format." });

        var ranges = request.Shifts is null ? null : ParseShifts(request.Shifts);
        if (request.IsDayOff)
        {
            if (request.Shifts is { Count: > 0 })
                return BadRequest(new { error = "A day-off exception cannot include shifts." });
            ranges = [];
        }
        else if (ranges is null || ranges.Count == 0 || !StaffScheduleRules.AreValidShifts(ranges))
        {
            return BadRequest(new { error = "A working-hours exception requires valid, non-overlapping HH:mm shifts." });
        }

        var exception = new StaffScheduleException
        {
            StaffId = id, Date = date, IsDayOff = request.IsDayOff,
            Shifts = ranges.Select(x => new ScheduleExceptionShift { StartTime = x.Start, EndTime = x.End }).ToList()
        };
        db.StaffScheduleExceptions.Add(exception);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            return Conflict(new { error = "An exception already exists for this date." });
        }
        var response = ToResponse(exception);
        return Created($"/api/staff/{id}/schedule/exceptions/{exception.Id}", response);
    }

    [HttpDelete("exceptions/{exceptionId:guid}")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> DeleteException(Guid id, Guid exceptionId, CancellationToken ct)
    {
        var exception = await db.StaffScheduleExceptions
            .SingleOrDefaultAsync(x => x.Id == exceptionId && x.StaffId == id, ct);
        if (exception is null) return NotFound();
        db.StaffScheduleExceptions.Remove(exception);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static List<ScheduleTimeRange>? ParseShifts(IReadOnlyList<ScheduleShiftRequest> shifts)
    {
        var ranges = new List<ScheduleTimeRange>();
        foreach (var shift in shifts)
        {
            if (!StaffScheduleRules.TryParseTimeRange(shift.StartTime, shift.EndTime, out var range)) return null;
            ranges.Add(range);
        }
        return ranges.OrderBy(x => x.Start).ToList();
    }

    private static ScheduleShiftResponse FormatShift(WeeklyScheduleShift shift) =>
        new(shift.StartTime.ToString("HH:mm", CultureInfo.InvariantCulture),
            shift.EndTime.ToString("HH:mm", CultureInfo.InvariantCulture));

    private static ScheduleShiftResponse FormatShift(ScheduleExceptionShift shift) =>
        new(shift.StartTime.ToString("HH:mm", CultureInfo.InvariantCulture),
            shift.EndTime.ToString("HH:mm", CultureInfo.InvariantCulture));

    private static ScheduleExceptionResponse ToResponse(StaffScheduleException exception) =>
        new(exception.Id, exception.Date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), exception.IsDayOff,
            exception.Shifts.OrderBy(x => x.StartTime).Select(FormatShift).ToList());
}

public sealed record ScheduleShiftRequest(string? StartTime, string? EndTime);
public sealed record ScheduleShiftResponse(string StartTime, string EndTime);
public sealed record WeeklyScheduleDayRequest(int DayOfWeek, List<ScheduleShiftRequest>? Shifts);
public sealed record WeeklyScheduleRequest(List<WeeklyScheduleDayRequest>? Days);
public sealed record WeeklyScheduleDayResponse(int DayOfWeek, List<ScheduleShiftResponse> Shifts);
public sealed record WeeklyScheduleResponse(List<WeeklyScheduleDayResponse> Days);
public sealed record ScheduleExceptionRequest(string? Date, bool IsDayOff, List<ScheduleShiftRequest>? Shifts);
public sealed record ScheduleExceptionResponse(Guid Id, string Date, bool IsDayOff, List<ScheduleShiftResponse> Shifts);

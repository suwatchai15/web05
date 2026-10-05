using System.Globalization;

namespace MassagePlatform.WebApi.Services;

public readonly record struct ScheduleTimeRange(TimeOnly Start, TimeOnly End);

public static class StaffScheduleRules
{
    public static bool TryParseTimeRange(string? start, string? end, out ScheduleTimeRange range)
    {
        range = default;
        if (!TimeOnly.TryParseExact(start, "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var startTime) ||
            !TimeOnly.TryParseExact(end, "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var endTime) ||
            endTime <= startTime)
            return false;

        range = new ScheduleTimeRange(startTime, endTime);
        return true;
    }

    public static bool AreValidShifts(IReadOnlyList<ScheduleTimeRange> shifts)
    {
        for (var i = 0; i < shifts.Count; i++)
        {
            if (shifts[i].End <= shifts[i].Start)
                return false;
            if (i > 0 && shifts[i].Start < shifts[i - 1].End)
                return false;
        }
        return true;
    }

    public static bool IsAvailable(DateTimeOffset startsAtUtc, DateTimeOffset endsAtUtc, TimeZoneInfo timeZone,
        IReadOnlyList<ScheduleTimeRange> shifts, out string? error)
    {
        error = null;
        var localStart = TimeZoneInfo.ConvertTime(startsAtUtc, timeZone);
        var localEnd = TimeZoneInfo.ConvertTime(endsAtUtc, timeZone);
        var startWallTime = localStart.DateTime;
        var endWallTime = localEnd.DateTime;

        if (timeZone.IsAmbiguousTime(startWallTime) || timeZone.IsAmbiguousTime(endWallTime) ||
            localStart.Offset != localEnd.Offset)
        {
            error = "Appointments during a daylight-saving time transition are not supported.";
            return false;
        }

        if (DateOnly.FromDateTime(startWallTime) != DateOnly.FromDateTime(endWallTime))
        {
            error = "Appointments must start and end on the same local calendar date.";
            return false;
        }

        var start = TimeOnly.FromDateTime(startWallTime);
        var end = TimeOnly.FromDateTime(endWallTime);
        if (shifts.Any(shift => start >= shift.Start && end <= shift.End))
            return true;

        error = "Appointment must fit wholly within one of the staff member's working shifts.";
        return false;
    }
}

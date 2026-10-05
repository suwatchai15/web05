using MassagePlatform.WebApi.Services;
using Xunit;

namespace MassagePlatform.WebApi.Tests;

public sealed class StaffScheduleRulesTests
{
    [Fact]
    public void Appointment_must_fit_wholly_inside_one_split_shift()
    {
        var zone = TimeZoneInfo.Utc;
        var shifts = new[]
        {
            new ScheduleTimeRange(new TimeOnly(9, 0), new TimeOnly(12, 0)),
            new ScheduleTimeRange(new TimeOnly(13, 0), new TimeOnly(17, 0))
        };

        Assert.True(StaffScheduleRules.IsAvailable(
            Utc(9, 0), Utc(12, 0), zone, shifts, out _));
        Assert.True(StaffScheduleRules.IsAvailable(
            Utc(13, 30), Utc(14, 0), zone, shifts, out _));
        Assert.False(StaffScheduleRules.IsAvailable(
            Utc(12, 30), Utc(13, 30), zone, shifts, out _));
        Assert.False(StaffScheduleRules.IsAvailable(
            Utc(11, 30), Utc(13, 30), zone, shifts, out _));
    }

    [Fact]
    public void Empty_schedule_does_not_allow_bookings()
    {
        Assert.False(StaffScheduleRules.IsAvailable(
            Utc(9, 0), Utc(10, 0), TimeZoneInfo.Utc, [], out var error));
        Assert.Contains("working shifts", error);
    }

    [Fact]
    public void Utc_appointment_times_are_matched_against_branch_local_clock_times()
    {
        var zone = TimeZoneInfo.FindSystemTimeZoneById("America/New_York");
        var shifts = new[] { new ScheduleTimeRange(new TimeOnly(9, 0), new TimeOnly(10, 0)) };

        Assert.True(StaffScheduleRules.IsAvailable(
            new DateTimeOffset(2026, 10, 5, 13, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 10, 5, 14, 0, 0, TimeSpan.Zero),
            zone, shifts, out _));
        Assert.False(StaffScheduleRules.IsAvailable(
            new DateTimeOffset(2026, 10, 5, 12, 0, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 10, 5, 13, 0, 0, TimeSpan.Zero),
            zone, shifts, out _));
    }

    [Fact]
    public void Local_date_boundary_and_dst_transition_are_rejected()
    {
        Assert.False(StaffScheduleRules.IsAvailable(
            new DateTimeOffset(2026, 1, 1, 23, 30, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 1, 2, 0, 30, 0, TimeSpan.Zero),
            TimeZoneInfo.Utc,
            [new ScheduleTimeRange(new TimeOnly(23, 0), new TimeOnly(23, 59))], out var boundaryError));
        Assert.Contains("same local calendar date", boundaryError);

        var zone = TimeZoneInfo.FindSystemTimeZoneById("America/New_York");
        Assert.False(StaffScheduleRules.IsAvailable(
            new DateTimeOffset(2026, 3, 8, 6, 30, 0, TimeSpan.Zero),
            new DateTimeOffset(2026, 3, 8, 7, 30, 0, TimeSpan.Zero),
            zone, [new ScheduleTimeRange(new TimeOnly(1, 0), new TimeOnly(4, 0))], out var dstError));
        Assert.Contains("daylight-saving", dstError);
    }

    [Fact]
    public void Shift_ranges_must_be_ordered_and_non_overlapping()
    {
        Assert.True(StaffScheduleRules.AreValidShifts([
            new(new TimeOnly(9, 0), new TimeOnly(12, 0)),
            new(new TimeOnly(12, 0), new TimeOnly(13, 0))]));
        Assert.False(StaffScheduleRules.AreValidShifts([
            new(new TimeOnly(9, 0), new TimeOnly(12, 0)),
            new(new TimeOnly(11, 30), new TimeOnly(13, 0))]));
    }

    private static DateTimeOffset Utc(int hour, int minute) =>
        new(2026, 10, 5, hour, minute, 0, TimeSpan.Zero);
}

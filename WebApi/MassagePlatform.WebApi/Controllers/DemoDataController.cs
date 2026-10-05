using System.Data;
using MassagePlatform.WebApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MassagePlatform.WebApi.Controllers;

[ApiController, Authorize(Roles = "Owner,Manager")]
[Route("api/demo-data")]
public sealed class DemoDataController(TenantDbContext db, IHostEnvironment environment) : ControllerBase
{
    private const string SeedVersion = "massage-shop-demo-v1";
    private static readonly TimeZoneInfo BangkokTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Bangkok");

    [HttpGet("status")]
    public async Task<DemoDataStatus> GetStatus(CancellationToken ct) =>
        new(environment.IsDevelopment(),
            await db.DemoSeeds.AnyAsync(x => x.Version == SeedVersion, ct));

    [HttpPost]
    public async Task<IActionResult> Seed(CancellationToken ct)
    {
        if (!environment.IsDevelopment())
            return NotFound();

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        if (await db.DemoSeeds.AnyAsync(x => x.Version == SeedVersion, ct))
            return Ok(new DemoDataSeedResult(false, "ข้อมูลตัวอย่างถูกเพิ่มไว้แล้ว", 0, 0, 0, 0, 0, 0, 0));

        var branch = new Branch
        {
            Name = "สาขาตัวอย่าง Sabai Spa",
            Address = "123 ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ",
            TimeZone = "Asia/Bangkok"
        };
        var services = new List<MassageService>
        {
            new() { Name = "นวดไทย 60 นาที", DurationMinutes = 60, Price = 500 },
            new() { Name = "นวดไทย 90 นาที", DurationMinutes = 90, Price = 700 },
            new() { Name = "นวดอโรมาน้ำมัน 60 นาที", DurationMinutes = 60, Price = 800 },
            new() { Name = "นวดฝ่าเท้า 45 นาที", DurationMinutes = 45, Price = 400 },
            new() { Name = "สครับผิวและประคบสมุนไพร", DurationMinutes = 90, Price = 1_200 }
        };
        var staff = new List<StaffMember>
        {
            new() { BranchId = branch.Id, Name = "มะลิ ใจดี", Email = "mali.demo@example.test" },
            new() { BranchId = branch.Id, Name = "แพรว สุขใจ", Email = "praew.demo@example.test" },
            new() { BranchId = branch.Id, Name = "นิดา แสงทอง", Email = "nida.demo@example.test" }
        };
        var rooms = Enumerable.Range(1, 3)
            .Select(number => new Room { BranchId = branch.Id, Name = $"ห้องนวด {number}" })
            .ToList();
        var customers = new List<Customer>
        {
            new() { Name = "คุณอรทัย วัฒนสุข", Phone = "0800000101", Notes = "ลูกค้าตัวอย่าง" },
            new() { Name = "คุณธนพร ใจเย็น", Phone = "0800000102", Notes = "ลูกค้าตัวอย่าง" },
            new() { Name = "คุณกมลชนก สุขสบาย", Phone = "0800000103", Notes = "ลูกค้าตัวอย่าง" },
            new() { Name = "คุณพิมพ์ชนก แก้วใส", Phone = "0800000104", Notes = "ลูกค้าตัวอย่าง" },
            new() { Name = "คุณศิริพร มณี", Phone = "0800000105", Notes = "ลูกค้าตัวอย่าง" }
        };
        db.Branches.Add(branch);
        db.Services.AddRange(services);
        db.Staff.AddRange(staff);
        db.Rooms.AddRange(rooms);
        db.Customers.AddRange(customers);

        var scheduleShifts = staff.SelectMany(member =>
            Enumerable.Range(1, 7).Select(day => new WeeklyScheduleShift
            {
                StaffId = member.Id,
                DayOfWeek = day,
                StartTime = new TimeOnly(9, 0),
                EndTime = new TimeOnly(18, 0)
            })).ToList();
        db.WeeklyScheduleShifts.AddRange(scheduleShifts);

        var now = DateTimeOffset.UtcNow;
        var localNow = TimeZoneInfo.ConvertTime(now, BangkokTimeZone);
        var appointments = new List<Appointment>();
        for (var index = 0; index < staff.Count; index++)
        {
            var localStart = NextAppointmentStart(localNow.DateTime, index);
            var startsAt = TimeZoneInfo.ConvertTimeToUtc(localStart, BangkokTimeZone);
            var service = services[index];
            appointments.Add(new Appointment
            {
                BranchId = branch.Id,
                ServiceId = service.Id,
                StaffId = staff[index].Id,
                CustomerId = customers[index].Id,
                RoomId = rooms[index].Id,
                StartsAt = new DateTimeOffset(startsAt, TimeSpan.Zero),
                EndsAt = new DateTimeOffset(startsAt.AddMinutes(service.DurationMinutes), TimeSpan.Zero),
                Notes = "ข้อมูลตัวอย่างสำหรับทดสอบระบบ"
            });
        }
        var yesterday = localNow.Date.AddDays(-1).AddHours(14);
        var completedStart = TimeZoneInfo.ConvertTimeToUtc(yesterday, BangkokTimeZone);
        appointments.Add(new Appointment
        {
            BranchId = branch.Id,
            ServiceId = services[0].Id,
            StaffId = staff[0].Id,
            CustomerId = customers[3].Id,
            RoomId = rooms[0].Id,
            StartsAt = new DateTimeOffset(completedStart, TimeSpan.Zero),
            EndsAt = new DateTimeOffset(completedStart.AddMinutes(services[0].DurationMinutes), TimeSpan.Zero),
            Status = "Completed",
            Notes = "ข้อมูลตัวอย่างสำหรับทดสอบระบบ"
        });
        db.Appointments.AddRange(appointments);

        var sales = Enumerable.Range(0, 3).Select(index =>
        {
            var service = services[index];
            var sale = new PosSale
            {
                SaleNumber = $"DEMO-{now:yyMMdd}-{Guid.NewGuid():N}",
                BranchId = branch.Id,
                CustomerId = customers[index].Id,
                StaffId = staff[index].Id,
                RoomId = rooms[index].Id,
                PaymentMethod = new[] { "Cash", "BankTransfer", "Card" }[index],
                Subtotal = service.Price,
                Total = service.Price,
                CreatedAt = now.AddMinutes(-index * 45),
                Items =
                [
                    new PosSaleItem
                    {
                        ServiceId = service.Id,
                        ServiceName = service.Name,
                        Quantity = 1,
                        UnitPrice = service.Price,
                        LineTotal = service.Price
                    }
                ]
            };
            return sale;
        }).ToList();
        db.Sales.AddRange(sales);
        db.DemoSeeds.Add(new TenantDemoSeed { Version = SeedVersion, CreatedAt = now });
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Ok(new DemoDataSeedResult(true, "เพิ่มข้อมูลตัวอย่างเรียบร้อยแล้ว",
            1, services.Count, staff.Count, rooms.Count, customers.Count, appointments.Count, sales.Count));
    }

    private static DateTime NextAppointmentStart(DateTime localNow, int index)
    {
        var start = new DateTime(localNow.Year, localNow.Month, localNow.Day, localNow.Hour, localNow.Minute, 0);
        var remainder = start.Minute % 30;
        if (remainder != 0) start = start.AddMinutes(30 - remainder);
        if (start.TimeOfDay < TimeSpan.FromHours(9)) start = start.Date.AddHours(9);
        start = start.AddMinutes(index * 90);
        if (start.AddMinutes(90).TimeOfDay > TimeSpan.FromHours(18))
            start = start.Date.AddDays(1).AddHours(9).AddMinutes(index * 90);
        return start;
    }
}

public sealed record DemoDataStatus(bool Enabled, bool Seeded);

public sealed record DemoDataSeedResult(
    bool Created,
    string Message,
    int Branches,
    int Services,
    int Staff,
    int Rooms,
    int Customers,
    int Appointments,
    int Sales);

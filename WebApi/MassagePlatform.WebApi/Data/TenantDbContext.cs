using Microsoft.EntityFrameworkCore;

namespace MassagePlatform.WebApi.Data;

public sealed class TenantDbContext(DbContextOptions<TenantDbContext> options) : DbContext(options)
{
    public DbSet<TenantUser> Users => Set<TenantUser>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<MassageService> Services => Set<MassageService>();
    public DbSet<StaffMember> Staff => Set<StaffMember>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<PosSale> Sales => Set<PosSale>();
    public DbSet<PosSaleItem> SaleItems => Set<PosSaleItem>();
    public DbSet<WeeklyScheduleShift> WeeklyScheduleShifts => Set<WeeklyScheduleShift>();
    public DbSet<StaffScheduleException> StaffScheduleExceptions => Set<StaffScheduleException>();
    public DbSet<ScheduleExceptionShift> ScheduleExceptionShifts => Set<ScheduleExceptionShift>();
    public DbSet<TenantDemoSeed> DemoSeeds => Set<TenantDemoSeed>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TenantUser>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Email).HasMaxLength(254).IsRequired();
            e.Property(x => x.PasswordHash).IsRequired();
            e.Property(x => x.Role).HasMaxLength(32).IsRequired();
            e.HasIndex(x => x.Email).IsUnique();
        });
        modelBuilder.Entity<Branch>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(160).IsRequired();
            e.Property(x => x.Address).HasMaxLength(500);
        });
        modelBuilder.Entity<MassageService>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(160).IsRequired();
            e.Property(x => x.Price).HasPrecision(10, 2);
            e.ToTable(t => t.HasCheckConstraint("ck_services_duration", "\"DurationMinutes\" BETWEEN 5 AND 1440"));
            e.ToTable(t => t.HasCheckConstraint("ck_services_price", "\"Price\" >= 0"));
        });
        modelBuilder.Entity<StaffMember>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(160).IsRequired();
            e.Property(x => x.Email).HasMaxLength(254);
            e.HasOne<Branch>().WithMany().HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<Customer>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(160).IsRequired();
            e.Property(x => x.Email).HasMaxLength(254);
            e.Property(x => x.Phone).HasMaxLength(40);
            e.Property(x => x.Type).HasMaxLength(24).HasDefaultValue("\u0e17\u0e31\u0e48\u0e27\u0e44\u0e1b").IsRequired();
        });
        modelBuilder.Entity<Room>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(80).IsRequired();
            e.HasIndex(x => new { x.BranchId, x.Name }).IsUnique();
            e.HasOne<Branch>().WithMany().HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<Appointment>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).HasMaxLength(24).IsRequired();
            e.Property(x => x.Notes).HasMaxLength(1000);
            e.HasOne<PosSale>().WithMany().HasForeignKey(x => x.PaidSaleId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne<Branch>().WithMany().HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<MassageService>().WithMany().HasForeignKey(x => x.ServiceId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<StaffMember>().WithMany().HasForeignKey(x => x.StaffId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<Customer>().WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<Room>().WithMany().HasForeignKey(x => x.RoomId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => x.StartsAt);
        });
        modelBuilder.Entity<PosSale>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.SaleNumber).HasMaxLength(48).IsRequired();
            e.Property(x => x.PaymentMethod).HasMaxLength(24).IsRequired();
            e.Property(x => x.Status).HasMaxLength(24).IsRequired();
            e.Property(x => x.Subtotal).HasPrecision(10, 2);
            e.Property(x => x.Discount).HasPrecision(10, 2);
            e.Property(x => x.Total).HasPrecision(10, 2);
            e.HasIndex(x => x.SaleNumber).IsUnique();
            e.HasIndex(x => x.CreatedAt);
            e.HasIndex(x => x.AppointmentId).IsUnique();
            e.ToTable(t =>
            {
                t.HasCheckConstraint("ck_sales_amounts", "\"Subtotal\" >= 0 AND \"Discount\" >= 0 AND \"Total\" >= 0 AND \"Total\" = \"Subtotal\" - \"Discount\"");
                t.HasCheckConstraint("ck_sales_payment_method", "\"PaymentMethod\" IN ('Cash', 'BankTransfer', 'Card')");
                t.HasCheckConstraint("ck_sales_status", "\"Status\" = 'Paid'");
            });
            e.HasOne<Branch>().WithMany().HasForeignKey(x => x.BranchId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<Customer>().WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne<StaffMember>().WithMany().HasForeignKey(x => x.StaffId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne<Room>().WithMany().HasForeignKey(x => x.RoomId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne<Appointment>().WithMany().HasForeignKey(x => x.AppointmentId).OnDelete(DeleteBehavior.SetNull);
        });
        modelBuilder.Entity<PosSaleItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.ServiceName).HasMaxLength(160).IsRequired();
            e.Property(x => x.UnitPrice).HasPrecision(10, 2);
            e.Property(x => x.LineTotal).HasPrecision(10, 2);
            e.ToTable(t =>
            {
                t.HasCheckConstraint("ck_sale_items_quantity", "\"Quantity\" BETWEEN 1 AND 99");
                t.HasCheckConstraint("ck_sale_items_amounts", "\"UnitPrice\" >= 0 AND \"LineTotal\" = \"UnitPrice\" * \"Quantity\"");
            });
            e.HasOne<PosSale>().WithMany(x => x.Items).HasForeignKey(x => x.SaleId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne<MassageService>().WithMany().HasForeignKey(x => x.ServiceId).OnDelete(DeleteBehavior.SetNull);
        });
        modelBuilder.Entity<WeeklyScheduleShift>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.StaffId, x.DayOfWeek, x.StartTime }).IsUnique();
            e.ToTable(t =>
            {
                t.HasCheckConstraint("ck_staff_schedule_weekday", "\"DayOfWeek\" BETWEEN 1 AND 7");
                t.HasCheckConstraint("ck_staff_schedule_times", "\"EndTime\" > \"StartTime\"");
            });
            e.HasOne<StaffMember>().WithMany().HasForeignKey(x => x.StaffId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<StaffScheduleException>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.StaffId, x.Date }).IsUnique();
            e.HasOne<StaffMember>().WithMany().HasForeignKey(x => x.StaffId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<ScheduleExceptionShift>(e =>
        {
            e.HasKey(x => x.Id);
            e.ToTable(t => t.HasCheckConstraint("ck_staff_schedule_exception_times", "\"EndTime\" > \"StartTime\""));
            e.HasOne<StaffScheduleException>().WithMany(x => x.Shifts).HasForeignKey(x => x.ScheduleExceptionId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<TenantDemoSeed>(e =>
        {
            e.HasKey(x => x.Version);
            e.Property(x => x.Version).HasMaxLength(64);
        });
    }
}

public sealed class TenantUser
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "Staff";
    public bool IsActive { get; set; } = true;
}

public sealed class Branch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public string? Address { get; set; }
    public string TimeZone { get; set; } = "UTC";
    public bool IsActive { get; set; } = true;
}

public sealed class MassageService
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class StaffMember
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BranchId { get; set; }
    public string Name { get; set; } = "";
    public string? Email { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "";
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Notes { get; set; }
    public string Type { get; set; } = "\u0e17\u0e31\u0e48\u0e27\u0e44\u0e1b";
}

public sealed class Room
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BranchId { get; set; }
    public string Name { get; set; } = "";
    public bool IsActive { get; set; } = true;
}

public sealed class Appointment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BranchId { get; set; }
    public Guid ServiceId { get; set; }
    public Guid StaffId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid RoomId { get; set; }
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset EndsAt { get; set; }
    public string Status { get; set; } = "Scheduled";
    public Guid? PaidSaleId { get; set; }
    public string? Notes { get; set; }
}

public sealed class PosSale
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string SaleNumber { get; set; } = "";
    public Guid BranchId { get; set; }
    public Guid? CustomerId { get; set; }
    public Guid? StaffId { get; set; }
    public Guid? RoomId { get; set; }
    public Guid? AppointmentId { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
    public string Status { get; set; } = "Paid";
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public List<PosSaleItem> Items { get; set; } = [];
}

public sealed class PosSaleItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SaleId { get; set; }
    public Guid? ServiceId { get; set; }
    public string ServiceName { get; set; } = "";
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }
}

public sealed class WeeklyScheduleShift
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StaffId { get; set; }
    public int DayOfWeek { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}

public sealed class StaffScheduleException
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid StaffId { get; set; }
    public DateOnly Date { get; set; }
    public bool IsDayOff { get; set; }
    public List<ScheduleExceptionShift> Shifts { get; set; } = [];
}

public sealed class ScheduleExceptionShift
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ScheduleExceptionId { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}

public sealed class TenantDemoSeed
{
    public string Version { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

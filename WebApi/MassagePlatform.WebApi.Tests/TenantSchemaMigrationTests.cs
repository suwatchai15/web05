using System.Reflection;
using MassagePlatform.WebApi.Data.Migrations.Tenant;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Xunit;

namespace MassagePlatform.WebApi.Tests;

public sealed class TenantSchemaMigrationTests
{
    [Fact]
    public void Tenant_migration_enforces_staff_and_room_overlap_constraints()
    {
        var migrationBuilder = new MigrationBuilder("Npgsql.EntityFrameworkCore.PostgreSQL");
        var up = typeof(InitialTenantSchema).GetMethod("Up", BindingFlags.Instance | BindingFlags.NonPublic)!;
        up.Invoke(new InitialTenantSchema(), [migrationBuilder]);

        var sql = string.Join(Environment.NewLine,
            migrationBuilder.Operations.OfType<SqlOperation>().Select(operation => operation.Sql));

        Assert.Contains("ex_appointments_staff_schedule", sql);
        Assert.Contains("ex_appointments_room_schedule", sql);
        Assert.Contains("tstzrange", sql);
        Assert.Contains("Status\" <> 'Cancelled'", sql);
    }

    [Fact]
    public void Staff_schedule_migration_stores_weekly_shifts_and_date_overrides()
    {
        var migrationBuilder = new MigrationBuilder("Npgsql.EntityFrameworkCore.PostgreSQL");
        var up = typeof(AddStaffSchedules).GetMethod("Up", BindingFlags.Instance | BindingFlags.NonPublic)!;
        up.Invoke(new AddStaffSchedules(), [migrationBuilder]);

        var sql = string.Join(Environment.NewLine,
            migrationBuilder.Operations.OfType<SqlOperation>().Select(operation => operation.Sql));

        Assert.Contains("\"WeeklyScheduleShifts\"", sql);
        Assert.Contains("\"DayOfWeek\" BETWEEN 1 AND 7", sql);
        Assert.Contains("time without time zone", sql);
        Assert.Contains("\"StaffScheduleExceptions\"", sql);
        Assert.Contains("\"Date\" date NOT NULL", sql);
        Assert.Contains("\"IsDayOff\" boolean NOT NULL", sql);
        Assert.Contains("\"ScheduleExceptionShifts\"", sql);
        Assert.Contains("ON DELETE CASCADE", sql);
        Assert.Contains("UNIQUE INDEX \"IX_StaffScheduleExceptions_StaffId_Date\"", sql);
    }

    [Fact]
    public void Pos_sales_migration_persists_sales_and_historical_service_prices()
    {
        var migrationBuilder = new MigrationBuilder("Npgsql.EntityFrameworkCore.PostgreSQL");
        var up = typeof(AddPosSales).GetMethod("Up", BindingFlags.Instance | BindingFlags.NonPublic)!;
        up.Invoke(new AddPosSales(), [migrationBuilder]);

        var tables = migrationBuilder.Operations.OfType<CreateTableOperation>().ToDictionary(x => x.Name);
        var sales = tables["Sales"];
        var saleItems = tables["SaleItems"];

        Assert.Contains(sales.Columns, column => column.Name == "PaymentMethod");
        Assert.Contains(sales.Columns, column => column.Name == "Total");
        Assert.Contains(sales.CheckConstraints, constraint => constraint.Name == "ck_sales_payment_method");
        Assert.Contains(sales.CheckConstraints, constraint => constraint.Name == "ck_sales_amounts");
        Assert.Contains(saleItems.Columns, column => column.Name == "ServiceName");
        Assert.Contains(saleItems.Columns, column => column.Name == "UnitPrice");
        Assert.Contains(saleItems.Columns, column => column.Name == "Quantity");
        Assert.Contains(saleItems.CheckConstraints, constraint => constraint.Name == "ck_sale_items_quantity");
    }

    [Fact]
    public void Demo_seed_migration_adds_an_idempotency_marker_table()
    {
        var migrationBuilder = new MigrationBuilder("Npgsql.EntityFrameworkCore.PostgreSQL");
        var up = typeof(AddTenantDemoSeed).GetMethod("Up", BindingFlags.Instance | BindingFlags.NonPublic)!;
        up.Invoke(new AddTenantDemoSeed(), [migrationBuilder]);

        var table = Assert.Single(migrationBuilder.Operations.OfType<CreateTableOperation>());
        Assert.Equal("DemoSeeds", table.Name);
        Assert.Contains(table.Columns, column => column.Name == "Version");
        Assert.Contains(table.Columns, column => column.Name == "CreatedAt");
    }
}

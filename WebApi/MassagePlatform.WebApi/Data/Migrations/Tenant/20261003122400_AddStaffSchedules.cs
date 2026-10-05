using MassagePlatform.WebApi.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MassagePlatform.WebApi.Data.Migrations.Tenant;

[DbContext(typeof(TenantDbContext))]
[Migration("20261003122400_AddStaffSchedules")]
public sealed class AddStaffSchedules : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE TABLE "WeeklyScheduleShifts" (
                "Id" uuid NOT NULL,
                "StaffId" uuid NOT NULL,
                "DayOfWeek" integer NOT NULL,
                "StartTime" time without time zone NOT NULL,
                "EndTime" time without time zone NOT NULL,
                CONSTRAINT "PK_WeeklyScheduleShifts" PRIMARY KEY ("Id"),
                CONSTRAINT "ck_staff_schedule_weekday" CHECK ("DayOfWeek" BETWEEN 1 AND 7),
                CONSTRAINT "ck_staff_schedule_times" CHECK ("EndTime" > "StartTime"),
                CONSTRAINT "FK_WeeklyScheduleShifts_Staff_StaffId" FOREIGN KEY ("StaffId")
                    REFERENCES "Staff" ("Id") ON DELETE CASCADE
            );
            CREATE UNIQUE INDEX "IX_WeeklyScheduleShifts_StaffId_DayOfWeek_StartTime"
                ON "WeeklyScheduleShifts" ("StaffId", "DayOfWeek", "StartTime");

            CREATE TABLE "StaffScheduleExceptions" (
                "Id" uuid NOT NULL,
                "StaffId" uuid NOT NULL,
                "Date" date NOT NULL,
                "IsDayOff" boolean NOT NULL,
                CONSTRAINT "PK_StaffScheduleExceptions" PRIMARY KEY ("Id"),
                CONSTRAINT "FK_StaffScheduleExceptions_Staff_StaffId" FOREIGN KEY ("StaffId")
                    REFERENCES "Staff" ("Id") ON DELETE CASCADE
            );
            CREATE UNIQUE INDEX "IX_StaffScheduleExceptions_StaffId_Date"
                ON "StaffScheduleExceptions" ("StaffId", "Date");

            CREATE TABLE "ScheduleExceptionShifts" (
                "Id" uuid NOT NULL,
                "ScheduleExceptionId" uuid NOT NULL,
                "StartTime" time without time zone NOT NULL,
                "EndTime" time without time zone NOT NULL,
                CONSTRAINT "PK_ScheduleExceptionShifts" PRIMARY KEY ("Id"),
                CONSTRAINT "ck_staff_schedule_exception_times" CHECK ("EndTime" > "StartTime"),
                CONSTRAINT "FK_ScheduleExceptionShifts_StaffScheduleExceptions_ScheduleExceptionId"
                    FOREIGN KEY ("ScheduleExceptionId") REFERENCES "StaffScheduleExceptions" ("Id") ON DELETE CASCADE
            );
            CREATE INDEX "IX_ScheduleExceptionShifts_ScheduleExceptionId"
                ON "ScheduleExceptionShifts" ("ScheduleExceptionId");
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP TABLE "ScheduleExceptionShifts";
            DROP TABLE "StaffScheduleExceptions";
            DROP TABLE "WeeklyScheduleShifts";
            """);
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MassagePlatform.WebApi.Data.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class AddTenantDemoSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DemoSeeds",
                columns: table => new
                {
                    Version = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DemoSeeds", x => x.Version);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DemoSeeds");
        }
    }
}

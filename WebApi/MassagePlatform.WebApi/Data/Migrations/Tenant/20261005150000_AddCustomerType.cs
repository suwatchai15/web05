using MassagePlatform.WebApi.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MassagePlatform.WebApi.Data.Migrations.Tenant;

[DbContext(typeof(TenantDbContext))]
[Migration("20261005150000_AddCustomerType")]
public partial class AddCustomerType : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder) => migrationBuilder.AddColumn<string>(
        name: "Type", table: "Customers", type: "character varying(24)", maxLength: 24,
        nullable: false, defaultValue: "\u0e17\u0e31\u0e48\u0e27\u0e44\u0e1b");

    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropColumn(name: "Type", table: "Customers");
}

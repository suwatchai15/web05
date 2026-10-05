using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MassagePlatform.WebApi.Data.Migrations.Tenant
{
    /// <inheritdoc />
    public partial class BookingPaymentTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AppointmentId",
                table: "Sales",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PaidSaleId",
                table: "Appointments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sales_AppointmentId",
                table: "Sales",
                column: "AppointmentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_PaidSaleId",
                table: "Appointments",
                column: "PaidSaleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Sales_PaidSaleId",
                table: "Appointments",
                column: "PaidSaleId",
                principalTable: "Sales",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Sales_Appointments_AppointmentId",
                table: "Sales",
                column: "AppointmentId",
                principalTable: "Appointments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Sales_PaidSaleId",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Sales_Appointments_AppointmentId",
                table: "Sales");

            migrationBuilder.DropIndex(
                name: "IX_Sales_AppointmentId",
                table: "Sales");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_PaidSaleId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "AppointmentId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "PaidSaleId",
                table: "Appointments");
        }
    }
}

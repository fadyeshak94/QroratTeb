using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QroratTeb.Migrations
{
    /// <inheritdoc />
    public partial class AddParentsDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HusbandAge",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HusbandConfessorName",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HusbandDateOfBirth",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HusbandJob",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HusbandPhoneNumber",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WifeAge",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WifeConfessorName",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WifeDateOfBirth",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WifeJob",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WifePhoneNumber",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HusbandAge",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "HusbandConfessorName",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "HusbandDateOfBirth",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "HusbandJob",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "HusbandPhoneNumber",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "WifeAge",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "WifeConfessorName",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "WifeDateOfBirth",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "WifeJob",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "WifePhoneNumber",
                table: "Families");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QroratTeb.Migrations
{
    /// <inheritdoc />
    public partial class AddIsResolvedToVisit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsResolved",
                table: "Visits",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsResolved",
                table: "Visits");
        }
    }
}

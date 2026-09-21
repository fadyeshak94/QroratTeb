using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QroratTeb.Migrations
{
    /// <inheritdoc />
    public partial class AddFamilyEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Area",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "BuildingNo",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "Floor",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "Landmark",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "PrimaryContactName",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "Street",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "WhatsAppNumber",
                table: "Visits");

            migrationBuilder.AddColumn<int>(
                name: "FamilyId",
                table: "Visits",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Families",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PrimaryContactName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WhatsAppNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Area = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Street = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BuildingNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Floor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Landmark = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Families", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Visits_FamilyId",
                table: "Visits",
                column: "FamilyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Visits_Families_FamilyId",
                table: "Visits",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Visits_Families_FamilyId",
                table: "Visits");

            migrationBuilder.DropTable(
                name: "Families");

            migrationBuilder.DropIndex(
                name: "IX_Visits_FamilyId",
                table: "Visits");

            migrationBuilder.DropColumn(
                name: "FamilyId",
                table: "Visits");

            migrationBuilder.AddColumn<string>(
                name: "Area",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BuildingNo",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Floor",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Landmark",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PrimaryContactName",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppNumber",
                table: "Visits",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QroratTeb.Migrations
{
    /// <inheritdoc />
    public partial class AddFamilyMembersFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DateOfBirth",
                table: "VisitIndividuals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeceased",
                table: "VisitIndividuals",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHeadOfFamily",
                table: "VisitIndividuals",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "VisitIndividuals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Relation",
                table: "VisitIndividuals",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "VisitIndividuals");

            migrationBuilder.DropColumn(
                name: "IsDeceased",
                table: "VisitIndividuals");

            migrationBuilder.DropColumn(
                name: "IsHeadOfFamily",
                table: "VisitIndividuals");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "VisitIndividuals");

            migrationBuilder.DropColumn(
                name: "Relation",
                table: "VisitIndividuals");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QroratTeb.Migrations
{
    /// <inheritdoc />
    public partial class AddDateOfBirthBack : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeceased",
                table: "VisitIndividuals");

            migrationBuilder.DropColumn(
                name: "IsHeadOfFamily",
                table: "VisitIndividuals");

            migrationBuilder.AddColumn<string>(
                name: "Age",
                table: "VisitIndividuals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ConfessorName",
                table: "VisitIndividuals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtherChurchName",
                table: "VisitIndividuals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HusbandName",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsHusbandDeceased",
                table: "Families",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsWifeDeceased",
                table: "Families",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "WifeName",
                table: "Families",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Age",
                table: "VisitIndividuals");

            migrationBuilder.DropColumn(
                name: "ConfessorName",
                table: "VisitIndividuals");

            migrationBuilder.DropColumn(
                name: "OtherChurchName",
                table: "VisitIndividuals");

            migrationBuilder.DropColumn(
                name: "HusbandName",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "IsHusbandDeceased",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "IsWifeDeceased",
                table: "Families");

            migrationBuilder.DropColumn(
                name: "WifeName",
                table: "Families");

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
        }
    }
}

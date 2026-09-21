using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QroratTeb.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Servants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Committee = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Servants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Visits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VisitDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ServantId = table.Column<int>(type: "int", nullable: true),
                    WasPriestPresent = table.Column<bool>(type: "bit", nullable: false),
                    PriestName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OriginatingCommittee = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PrimaryContactName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WhatsAppNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Area = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Street = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BuildingNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Floor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Landmark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PriorityFlag = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SpiritualServiceType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HasConfessor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConfessorName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsBedridden = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SpiritualUrgency = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HealthCategory = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HealthcareAssistanceTypes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CaregiverAvailable = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SupportLevel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SocialSupportCategories = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Visits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Visits_Servants_ServantId",
                        column: x => x.ServantId,
                        principalTable: "Servants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "VisitIndividuals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VisitId = table.Column<int>(type: "int", nullable: false),
                    ChildName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EducationalStage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SchoolCollegeName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NonAttendanceReason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitIndividuals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VisitIndividuals_Visits_VisitId",
                        column: x => x.VisitId,
                        principalTable: "Visits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VisitNeeds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VisitId = table.Column<int>(type: "int", nullable: false),
                    NeedCategory = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VisitNeeds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VisitNeeds_Visits_VisitId",
                        column: x => x.VisitId,
                        principalTable: "Visits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Servants",
                columns: new[] { "Id", "Committee", "Name", "Phone" },
                values: new object[] { 1, "المنطقة الأولى", "خادم تجريبي", "01000000000" });

            migrationBuilder.CreateIndex(
                name: "IX_VisitIndividuals_VisitId",
                table: "VisitIndividuals",
                column: "VisitId");

            migrationBuilder.CreateIndex(
                name: "IX_VisitNeeds_VisitId",
                table: "VisitNeeds",
                column: "VisitId");

            migrationBuilder.CreateIndex(
                name: "IX_Visits_ServantId",
                table: "Visits",
                column: "ServantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VisitIndividuals");

            migrationBuilder.DropTable(
                name: "VisitNeeds");

            migrationBuilder.DropTable(
                name: "Visits");

            migrationBuilder.DropTable(
                name: "Servants");
        }
    }
}

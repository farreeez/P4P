using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatbotBackend.Migrations
{
    /// <inheritdoc />
    public partial class fix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuestionResult_DementiaAssessmentState_DementiaAssessmentStateId",
                table: "QuestionResult");

            migrationBuilder.DropTable(
                name: "DementiaAssessmentState");

            migrationBuilder.DropIndex(
                name: "IX_QuestionResult_DementiaAssessmentStateId",
                table: "QuestionResult");

            migrationBuilder.DropColumn(
                name: "DementiaAssessmentStateId",
                table: "QuestionResult");

            migrationBuilder.AddColumn<bool>(
                name: "AssessementStarted",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AssessmentCompleted",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "CurrentAssessmentQuestionIndex",
                table: "Users",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "QuestionResult",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuestionResult_UserId",
                table: "QuestionResult",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionResult_Users_UserId",
                table: "QuestionResult",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_QuestionResult_Users_UserId",
                table: "QuestionResult");

            migrationBuilder.DropIndex(
                name: "IX_QuestionResult_UserId",
                table: "QuestionResult");

            migrationBuilder.DropColumn(
                name: "AssessementStarted",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AssessmentCompleted",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CurrentAssessmentQuestionIndex",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "QuestionResult");

            migrationBuilder.AddColumn<int>(
                name: "DementiaAssessmentStateId",
                table: "QuestionResult",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DementiaAssessmentState",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Completed = table.Column<bool>(type: "INTEGER", nullable: false),
                    CurrentQuestionIndex = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DementiaAssessmentState", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DementiaAssessmentState_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuestionResult_DementiaAssessmentStateId",
                table: "QuestionResult",
                column: "DementiaAssessmentStateId");

            migrationBuilder.CreateIndex(
                name: "IX_DementiaAssessmentState_UserId",
                table: "DementiaAssessmentState",
                column: "UserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_QuestionResult_DementiaAssessmentState_DementiaAssessmentStateId",
                table: "QuestionResult",
                column: "DementiaAssessmentStateId",
                principalTable: "DementiaAssessmentState",
                principalColumn: "Id");
        }
    }
}

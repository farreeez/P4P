using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChatbotBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileFactsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CognitiveActivityPreference",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentMedications",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContact",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FamilyHistoryDementia",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastInteractionDate",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastKnownLocation",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LifestyleHabits",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MedicalConditions",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferredCommunicationStyle",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryBrainHealthConcern",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SleepPatterns",
                table: "Users",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StressLevels",
                table: "Users",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CognitiveActivityPreference",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CurrentMedications",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "EmergencyContact",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "FamilyHistoryDementia",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastInteractionDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastKnownLocation",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LifestyleHabits",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MedicalConditions",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PreferredCommunicationStyle",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PrimaryBrainHealthConcern",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SleepPatterns",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StressLevels",
                table: "Users");
        }
    }
}

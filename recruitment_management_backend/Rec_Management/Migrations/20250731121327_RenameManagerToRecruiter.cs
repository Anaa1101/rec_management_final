using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Rec_Management.Migrations
{
    /// <inheritdoc />
    public partial class RenameManagerToRecruiter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ManagerId",
                table: "Interviews",
                newName: "recruiter_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "recruiter_id",
                table: "Interviews",
                newName: "ManagerId");
        }
    }
}

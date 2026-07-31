using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyShoppingApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImageProcessingColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasThumbnail",
                table: "ItemImages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompressed",
                table: "ItemImages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "ItemImages",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasThumbnail",
                table: "ItemImages");

            migrationBuilder.DropColumn(
                name: "IsCompressed",
                table: "ItemImages");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "ItemImages");
        }
    }
}

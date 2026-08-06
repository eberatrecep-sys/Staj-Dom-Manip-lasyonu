using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyShoppingApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsFavoriteToShoppingList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFavorite",
                table: "ShoppingLists",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFavorite",
                table: "ShoppingLists");
        }
    }
}

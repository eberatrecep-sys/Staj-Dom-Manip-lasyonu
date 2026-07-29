using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MyShoppingApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddShareFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ListShareRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ListId = table.Column<int>(type: "integer", nullable: false),
                    SenderId = table.Column<int>(type: "integer", nullable: false),
                    ReceiverId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false, defaultValue: "Pending"),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListShareRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListShareRequests_ShoppingLists_ListId",
                        column: x => x.ListId,
                        principalTable: "ShoppingLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListShareRequests_Users_ReceiverId",
                        column: x => x.ReceiverId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ListShareRequests_Users_SenderId",
                        column: x => x.SenderId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SharedShoppingLists",
                columns: table => new
                {
                    SharedListsId = table.Column<int>(type: "integer", nullable: false),
                    SharedWithUsersId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SharedShoppingLists", x => new { x.SharedListsId, x.SharedWithUsersId });
                    table.ForeignKey(
                        name: "FK_SharedShoppingLists_ShoppingLists_SharedListsId",
                        column: x => x.SharedListsId,
                        principalTable: "ShoppingLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SharedShoppingLists_Users_SharedWithUsersId",
                        column: x => x.SharedWithUsersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ListShareRequests_ListId",
                table: "ListShareRequests",
                column: "ListId");

            migrationBuilder.CreateIndex(
                name: "IX_ListShareRequests_ReceiverId",
                table: "ListShareRequests",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_ListShareRequests_SenderId",
                table: "ListShareRequests",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedShoppingLists_SharedWithUsersId",
                table: "SharedShoppingLists",
                column: "SharedWithUsersId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ListShareRequests");

            migrationBuilder.DropTable(
                name: "SharedShoppingLists");
        }
    }
}

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY ["src/MyShoppingApp.API/MyShoppingApp.API.csproj", "src/MyShoppingApp.API/"]
COPY ["src/MyShoppingApp.Application/MyShoppingApp.Application.csproj", "src/MyShoppingApp.Application/"]
COPY ["src/MyShoppingApp.Domain/MyShoppingApp.Domain.csproj", "src/MyShoppingApp.Domain/"]
COPY ["src/MyShoppingApp.Infrastructure/MyShoppingApp.Infrastructure.csproj", "src/MyShoppingApp.Infrastructure/"]

RUN dotnet restore "src/MyShoppingApp.API/MyShoppingApp.API.csproj"

COPY . .
WORKDIR "/app/src/MyShoppingApp.API"
RUN dotnet build "MyShoppingApp.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MyShoppingApp.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MyShoppingApp.API.dll"]

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копируем решение и проекты
COPY ["MiniCrm.sln", "./"]
COPY ["backend/Domain/Domain.csproj", "backend/Domain/"]
COPY ["backend/Application/Application.csproj", "backend/Application/"]
COPY ["backend/Infrastructure/Infrastructure.csproj", "backend/Infrastructure/"]
COPY ["backend/WebAPI/WebAPI.csproj", "backend/WebAPI/"]
COPY ["backend/tests/Application.UnitTests/Application.UnitTests.csproj", "backend/tests/Application.UnitTests/"]

RUN dotnet restore "MiniCrm.sln"

# Копируем остальной код
COPY . .

WORKDIR "/src/backend/WebAPI"
RUN dotnet build "WebAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WebAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WebAPI.dll"]


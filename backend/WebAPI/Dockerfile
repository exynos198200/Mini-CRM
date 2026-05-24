# Stage 1: Runtime Base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

# Stage 2: SDK Build Environment
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копируем файлы проектов для восстановления зависимостей
COPY ["backend/Domain/Domain.csproj", "backend/Domain/"]
COPY ["backend/Application/Application.csproj", "backend/Application/"]
COPY ["backend/Infrastructure/Infrastructure.csproj", "backend/Infrastructure/"]
COPY ["backend/WebAPI/WebAPI.csproj", "backend/WebAPI/"]
COPY ["MiniCrm.sln", "./"]

RUN dotnet restore "MiniCrm.sln"

# Копируем оставшийся исходный код
COPY ["backend/Domain/", "backend/Domain/"]
COPY ["backend/Application/", "backend/Application/"]
COPY ["backend/Infrastructure/", "backend/Infrastructure/"]
COPY ["backend/WebAPI/", "backend/WebAPI/"]

WORKDIR "/backend/backend/WebAPI"
RUN dotnet build "WebAPI.csproj" -c Release -o /app/build

# Stage 3: Publish App
FROM build AS publish
RUN dotnet publish "WebAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 4: Final Image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WebAPI.dll"]

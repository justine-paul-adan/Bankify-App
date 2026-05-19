# Multi-stage build for ASP.NET Core (.NET 8)
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["WebAPI/WebAPI.csproj", "WebAPI/"]
RUN dotnet restore "WebAPI/WebAPI.csproj"

# Copy everything and build/publish
COPY . .
WORKDIR /src/WebAPI
RUN dotnet publish "WebAPI.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Let the app listen on port 80 inside the container. Render will provide the
# PORT environment variable at runtime; Program.cs already reads PORT and binds
# to 0.0.0.0:${PORT}. Setting ASPNETCORE_URLS ensures Kestrel will accept
# requests on the container port if no PORT is provided locally.
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["dotnet", "WebAPI.dll"]

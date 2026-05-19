# 💳 Bankify App Setup Guide

## 📌 Steps to Start the Bankify App

### 1. Create the Solution and API Project

1. Open Visual Studio
2. Create a **Blank Solution**
3. Add a new **ASP.NET Core Web API** project named `Bankify`

---

## ⚛️ Setup React + TypeScript Client App

Run the following command in the terminal:

```bash
npx create-react-app clientapp --template typescript
```

Create a `.gitignore` file:

```bash
touch .gitignore
```

Paste the following into the `.gitignore` file:

```gitignore
# .NET
bin/
obj/
*.user
*.suo
*.vs/
.vscode/

# React / Node
node_modules/
build/
.env
.DS_Store

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

---

# 🗂️ Backend Setup

## 1. Create Required Folders

Create the following folders in the API project:

- `Models`
- `Data`
- `DTOs`
- `Services`
- `Controllers`

---

## 2. Create Model Classes

Inside the `Models` folder, create your class models and properties.

Example:

```csharp
public class Account
{
    public int Id { get; set; }
    public string AccountName { get; set; }
}
```

---

## 3. Create the DbContext

Inside the `Data` folder, create your `DbContext`.

Example:

```csharp
public class BankifyDbContext : DbContext
{
    public BankifyDbContext(DbContextOptions<BankifyDbContext> options)
        : base(options)
    {
    }

    public DbSet<Account> Accounts { get; set; }
}
```

---

## 4. Update `appsettings.json`

Add your database connection string:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=BankifyDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

---

## 5. Update `Program.cs`

Register the connection string and `DbContext`:

```csharp
builder.Services.AddDbContext<BankifyDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));
```

---

# 🛠️ Run Entity Framework Migrations

Run the following commands in the terminal:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

If it says **"No project selected"**, try:

```bash
dotnet ef migrations add InitialCreate --project Bankify.API --startup-project Bankify.API

dotnet ef database update --project Bankify.API --startup-project Bankify.API
```

---

## ✅ Verify the Database

Check your database and confirm that the tables were successfully created.

---

# 🧩 Create DTOs, Services, and Controllers

Create:

- DTO classes
- Service interfaces
- Service implementations
- API controllers

---

## Register Services in `Program.cs`

Example:

```csharp
builder.Services.AddScoped<IAccountService, AccountService>();
```

---

# 🎨 Add Frontend UI Packages

Check the official Chakra UI guide:

https://v2.chakra-ui.com/getting-started

Install the required packages:

```bash
npm i @chakra-ui/react@2 @emotion/react @emotion/styled framer-motion

npm install react-router-dom

npm install axios

npm install @chakra-ui/icons

npm install react-icons

npm install sass

npm install recharts
```

---

# 🚀 Recommended Next Steps

After setup, you can continue with:

- JWT Authentication
- Role-based Authorization
- React Routing
- API Integration using Axios
- Dashboard UI
- Charts using Recharts
- Deployment to Production
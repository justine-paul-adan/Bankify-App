using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Models;
using WebAPI.Services.Interfaces;

namespace WebAPI.Services
{
    public class AccountService : IAccountService
    {
        private readonly BankifyDbContext _context;
        private readonly ILogger<AccountService> _logger;
        private readonly IHttpContextAccessor _http;

        public AccountService(
            BankifyDbContext context,
            ILogger<AccountService> logger,
            IHttpContextAccessor http)
        {
            _context = context;
            _logger = logger;
            _http = http;
        }

        public async Task<AccountDto> CreateAccountAsync(CreateAccountDto dto)
        {
            _logger.LogInformation("Creating account...");

            var currentUser = GetCurrentUser() 
                ?? throw new UnauthorizedAccessException();

            // Block normal users
            if (currentUser.Role == Roles.User)
                throw new UnauthorizedAccessException("Only Admin or Teller can create accounts.");

            if (string.IsNullOrWhiteSpace(dto?.Email))
                throw new ArgumentException("Email is required.");

            if (await _context.Accounts.AnyAsync(a => a.Email == dto.Email))
                throw new ArgumentException("Email already exists.");

            var accountNumber = await GenerateUniqueAccountNumberAsync();

            var account = new Account
            {
                AccountRef = Guid.NewGuid().ToString(),
                AccountNumber = accountNumber,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                MiddleName = dto.MiddleName,
                Email = dto.Email,
                Location = dto.Location,
                PhoneNumber = dto.PhoneNumber,
                AvailableBalance = dto.AvailableBalance ?? 0,

                PinCode = BCryptPin("000000"),
                RequirePinChange = true,

                FailedPinAttempts = 0,
                LockoutEnd = null,

                Status = "Active",
                CreatedDate = DateTime.UtcNow
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return MapToDto(account);
        }

        public async Task<List<AccountDto>> GetAllAccountsAsync()
        {
            _logger.LogInformation("Getting all accounts...");

            var currentUser = GetCurrentUser()
                ?? throw new UnauthorizedAccessException();

            // Only Admin/Teller can view all
            if (currentUser.Role == Roles.User)
                throw new UnauthorizedAccessException("Access denied.");

            var accounts = await _context.Accounts
                .AsNoTracking()
                .ToListAsync();

            return accounts.Select(MapToDto).ToList();
        }

        public async Task<AccountDto?> GetAccountByNumberAsync(int accountNumber)
        {
            _logger.LogInformation("Getting account...");

            await EnsureAccountAccess(accountNumber);

            var account = await _context.Accounts
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);

            if (account == null)
                throw new KeyNotFoundException("Account not found");

            return MapToDto(account);
        }

        public async Task<AccountDto> UpdateAccountAsync(AccountDto dto)
        {
            _logger.LogInformation("Updating account...");

            await EnsureAccountAccess(dto.AccountNumber);

            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountNumber == dto.AccountNumber);

            if (account == null)
                throw new KeyNotFoundException("Account not found");

            UpdateAccountFields(account, dto);

            await _context.SaveChangesAsync();

            return MapToDto(account);
        }

        public async Task<bool> DeleteAccountAsync(int accountNumber)
        {
            _logger.LogInformation("Deleting account...");

            await EnsureAccountAccess(accountNumber);

            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);

            if (account == null)
                throw new KeyNotFoundException("Account not found");

            account.Status = "Deleted";

            _context.Accounts.Remove(account);

            await _context.SaveChangesAsync();

            return true;
        }
        private void UpdateAccountFields(Account account, AccountDto dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.FirstName))
                account.FirstName = dto.FirstName;

            if (!string.IsNullOrWhiteSpace(dto.LastName))
                account.LastName = dto.LastName;

            if (!string.IsNullOrWhiteSpace(dto.MiddleName))
                account.MiddleName = dto.MiddleName;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                account.Email = dto.Email;

            if (!string.IsNullOrWhiteSpace(dto.Location))
                account.Location = dto.Location;

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
                account.PhoneNumber = dto.PhoneNumber;

            if (!string.IsNullOrWhiteSpace(dto.Status))
                account.Status = dto.Status;
        }

        private string BCryptPin(string pin)
        {
            return BCrypt.Net.BCrypt.HashPassword(pin);
        }

        private async Task<int> GenerateUniqueAccountNumberAsync()
        {
            int accountNumber;

            do
            {
                accountNumber = GenerateSecureAccountNumber();
            }
            while (await _context.Accounts.AnyAsync(a => a.AccountNumber == accountNumber));

            return accountNumber;
        }

        private int GenerateSecureAccountNumber()
        {
            var bytes = new byte[5];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(bytes);

            var number = BitConverter.ToInt32(bytes, 0);
            number = Math.Abs(number);

            return (number % 900_000_000) + 100_000_000;
        }

        private AccountDto MapToDto(Account account)
        {
            return new AccountDto
            {
                AccountNumber = account.AccountNumber,
                FirstName = account.FirstName,
                MiddleName = account.MiddleName,
                LastName = account.LastName,
                Email = account.Email,
                Location = account.Location,
                PhoneNumber = account.PhoneNumber,
                AvailableBalance = account.AvailableBalance,
                Status = account.Status,
                RequirePinChange = account.RequirePinChange,
                FailedPinAttempts = account.FailedPinAttempts,
                LockoutEnd = account.LockoutEnd,
                LastFailedAttempt = account.LastFailedAttempt,
                CreatedDate = account.CreatedDate
            };
        }

        private BankifyUserDto? GetCurrentUser()
        {
            var user = _http.HttpContext?.User;

            if (user == null || !user.Identity!.IsAuthenticated)
                return null;

            return new BankifyUserDto
            {
                UserRef = user.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                Email = user.FindFirst(ClaimTypes.Email)?.Value,
                Role = user.FindFirst(ClaimTypes.Role)?.Value
            };
        }

        private async Task EnsureAccountAccess(int accountNumber)
        {
            var currentUser = GetCurrentUser()
                ?? throw new UnauthorizedAccessException();

            // Admin & Teller → full access
            if (currentUser.Role == Roles.Admin || currentUser.Role == Roles.Teller)
                return;

            // Normal User → only own account
            var user = await _context.BankifyUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserRef == currentUser.UserRef);

            if (user == null || user.AccountNumber != accountNumber)
                throw new UnauthorizedAccessException("Access denied.");
        }
    }
}
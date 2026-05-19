using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.RegularExpressions;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Models;
using WebAPI.Services.Interfaces;

namespace WebAPI.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly BankifyDbContext _context;
        private readonly ILogger<TransactionService> _logger;
        private readonly IHttpContextAccessor _http;

        private const int MaxFailedAttempts = 5;
        private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(45);
        public TransactionService(BankifyDbContext context, ILogger<TransactionService> logger, IHttpContextAccessor http)
        {
            _context = context;
            _logger = logger;
            _http = http;
        }

        public async Task<TransactionDto> ChangePinAsync(RequestTransactionDto request)
        {
            _logger.LogInformation("Changing account pin...");
            await EnsureAccountAccess(request.AccountNumber);

            ValidatePin(request.NewPin);

            var account = await AuthenticateForPinChangeAsync(
                request.AccountNumber,
                request.CurrentPin
            );

            if (account.Status != "Active")
                throw new InvalidOperationException("Account is not active");

            account.PinCode = HashPin(request.NewPin);
            account.RequirePinChange = false;

            await ResetAuthState(account);

            var transaction = CreateTransaction(
                request.AccountNumber,
                "Change PIN",
                0m,
                account.Email
            );

            using var dbTransaction = await _context.Database.BeginTransactionAsync();

            _context.Accounts.Update(account);
            _context.Transactions.Add(transaction);

            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return MapDto(transaction);
        }

        public async Task<TransactionDto> DepositAsync(RequestTransactionDto request)
        {
            _logger.LogInformation("Depositing funds...");
            await EnsureAccountAccess(request.AccountNumber);

            ValidateAmount(request.Amount ?? 0);

            var account = await AuthenticateOrThrowAsync(request.AccountNumber, request.CurrentPin);

            if (account.Status != "Active")
                throw new InvalidOperationException("Account is not active");

            using var dbTransaction = await _context.Database.BeginTransactionAsync();

            account.AvailableBalance += request.Amount ?? 0;

            var transaction = CreateTransaction(
                request.AccountNumber,
                "Deposit",
                request.Amount ?? 0,
                account.Email
            );

            _context.Accounts.Update(account);
            _context.Transactions.Add(transaction);

            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return MapDto(transaction);
        }

        public async Task<TransactionDto> WithdrawAsync(RequestTransactionDto request)
        {
            _logger.LogInformation("Withdrawing funds...");
            await EnsureAccountAccess(request.AccountNumber);

            if (request.Amount < 100)
                throw new ArgumentException("Minimum withdrawal is 100");

            var account = await AuthenticateOrThrowAsync(request.AccountNumber, request.CurrentPin);

            if (account.Status != "Active")
                throw new InvalidOperationException("Account is not active");

            if (account.AvailableBalance < request.Amount)
                throw new InvalidOperationException("Insufficient funds");

            using var dbTransaction = await _context.Database.BeginTransactionAsync();

            account.AvailableBalance -= request.Amount ?? 0;

            var transaction = CreateTransaction(
                request.AccountNumber,
                "Withdraw",
                request.Amount ?? 0,
                account.Email
            );

            _context.Accounts.Update(account);
            _context.Transactions.Add(transaction);

            await _context.SaveChangesAsync();
            await dbTransaction.CommitAsync();

            return MapDto(transaction);
        }

        public async Task<TransactionDto> GetBalanceAsync(int accountNumber, string pin)
        {
            _logger.LogInformation("Getting account balance...");
            await EnsureAccountAccess(accountNumber);

            var account = await AuthenticateOrThrowAsync(accountNumber, pin);

            if (account.Status != "Active")
                throw new InvalidOperationException("Account is not active");

            var transaction = CreateTransaction(
                accountNumber,
                "Balance Inquiry",
                account.AvailableBalance,
                account.Email
            );

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return MapDto(transaction);
        }

        public async Task<List<TransactionDto>> GetTransactionHistoryAsync(int accountNumber)
        {
            _logger.LogInformation("Getting transaction history...");
            await EnsureAccountAccess(accountNumber);

            return await _context.Transactions
                .AsNoTracking()
                .Where(t => t.AccountNumber == accountNumber)
                .OrderByDescending(t => t.CreatedDate)
                .Select(t => new TransactionDto
                {
                    TransactionRef = t.TransactionRef,
                    AccountNumber = t.AccountNumber,
                    Amount = t.Amount,
                    Type = t.Type,
                    CreatedDate = t.CreatedDate
                })
                .ToListAsync();
        }

        private async Task<Account> AuthenticateOrThrowAsync(int accountNumber, string pin)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);

            if (account == null || !VerifyPin(pin, account.PinCode))
            {
                await HandleFailedAttempt(account);
                throw new InvalidOperationException("Invalid credentials");
            }

            if (account.LockoutEnd.HasValue && account.LockoutEnd > DateTime.UtcNow)
                throw new InvalidOperationException("Account is temporarily locked");

            if (account.RequirePinChange)
                throw new InvalidOperationException("PIN change required");

            await ResetAuthState(account);

            return account;
        }

        private async Task<Account> AuthenticateForPinChangeAsync(int accountNumber, string pin)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber);

            if (account == null || !VerifyPin(pin, account.PinCode))
            {
                await HandleFailedAttempt(account);
                throw new InvalidOperationException("Invalid credentials");
            }

            if (account.LockoutEnd.HasValue && account.LockoutEnd > DateTime.UtcNow)
                throw new InvalidOperationException("Account is temporarily locked");

            return account;
        }

        private async Task HandleFailedAttempt(Account? account)
        {
            if (account == null) return;

            account.FailedPinAttempts++;
            account.LastFailedAttempt = DateTime.UtcNow;

            if (account.FailedPinAttempts >= MaxFailedAttempts)
            {
                account.LockoutEnd = DateTime.UtcNow.Add(LockoutDuration);
                account.FailedPinAttempts = 0;
            }

            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
        }

        private async Task ResetAuthState(Account account)
        {
            account.FailedPinAttempts = 0;
            account.LockoutEnd = null;
            account.LastFailedAttempt = null;

            _context.Accounts.Update(account);
            await _context.SaveChangesAsync();
        }

        private Transaction CreateTransaction(int accountNumber, string type, decimal amount, string email)
        {
            return new Transaction
            {
                TransactionRef = Guid.NewGuid().ToString(),
                AccountNumber = accountNumber,
                Type = type,
                Amount = amount,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = email
            };
        }

        private TransactionDto MapDto(Transaction t)
        {
            return new TransactionDto
            {
                TransactionRef = t.TransactionRef,
                AccountNumber = t.AccountNumber,
                Type = t.Type,
                Amount = t.Amount,
                CreatedDate = t.CreatedDate
            };
        }

        private string HashPin(string pin)
        {
            return BCrypt.Net.BCrypt.HashPassword(pin);
        }

        private bool VerifyPin(string pin, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(pin, hash);
        }

        private void ValidateAmount(decimal amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Amount must be greater than zero");
        }

        private void ValidatePin(string pin)
        {
            if (string.IsNullOrWhiteSpace(pin) || !Regex.IsMatch(pin, @"^\d{6}$"))
                throw new ArgumentException("PIN must be exactly 6 digits");
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

            // User → only own account
            var user = await _context.BankifyUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserRef == currentUser.UserRef);

            if (user == null || user.AccountNumber != accountNumber)
                throw new UnauthorizedAccessException("Access denied.");
        }
    }
}

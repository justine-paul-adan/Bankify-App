using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Models;
using WebAPI.Services.Interfaces;

namespace WebAPI.Services
{
    public class BankifyUserService : IBankifyUserService
    {
        private readonly BankifyDbContext _context;
        private readonly IHttpContextAccessor _http;
        private readonly IConfiguration _config;
        private readonly IPasswordHasher<BankifyUser> _hasher;
        private readonly ILogger<BankifyUserService> _logger;

        public BankifyUserService(BankifyDbContext context, IHttpContextAccessor http, IConfiguration config, IPasswordHasher<BankifyUser> hasher, ILogger<BankifyUserService> logger)
        {
            _context = context;
            _http = http;
            _config = config;
            _hasher = hasher;
            _logger = logger;
        }

        public async Task<BankifyUserDto> CreateBankifyUserAsync(CreateBankifyUserDto dto)
        {
            _logger.LogInformation("Creating account...");

            var currentUser = GetCurrentUser();

            var role = string.IsNullOrWhiteSpace(dto.Role) ? Roles.User : dto.Role;

            var allowedRoles = new[] { Roles.User, Roles.Admin, Roles.Teller };
            if (!allowedRoles.Contains(role))
                throw new InvalidOperationException("Invalid role.");

            // Only admin can create Admin/Teller
            if ((role == Roles.Admin || role == Roles.Teller) &&
                (currentUser == null || currentUser.Role != Roles.Admin))
                throw new UnauthorizedAccessException("Only admin can create privileged users.");

            var email = dto.Email.Trim().ToLowerInvariant();

            if (await _context.BankifyUsers
                .AnyAsync(u => u.Email == email))
                throw new InvalidOperationException("Email already exists.");

            if (role == Roles.User)
            {
                if (dto.AccountNumber <= 0)
                    throw new InvalidOperationException("Account number required.");

                //var account = await _context.Accounts
                //    .FirstOrDefaultAsync(a => a.AccountNumber == dto.AccountNumber)
                //    ?? throw new KeyNotFoundException("Account not found.");

                //if (await _context.BankifyUsers
                //    .AnyAsync(u => u.AccountNumber == dto.AccountNumber))
                //    throw new InvalidOperationException("Account already linked.");
            }

            var user = new BankifyUser
            {
                UserRef = Guid.NewGuid().ToString(),
                Email = email,
                PhoneNumber = dto.PhoneNumber,
                Role = role,
                AccountNumber = role == Roles.User ? dto.AccountNumber : 0,
                CreatedDate = DateTime.UtcNow
            };

            user.Password = _hasher.HashPassword(user, dto.Password);

            _context.BankifyUsers.Add(user);
            await _context.SaveChangesAsync();

            return Map(user);
        }

        public async Task<bool> DeleteBankifyUserAsync(string userRef)
        {
            _logger.LogInformation("Deleting account...");

            var currentUser = GetCurrentUser()
                ?? throw new UnauthorizedAccessException();

            if (currentUser.Role != Roles.Admin && currentUser.UserRef != userRef)
                throw new UnauthorizedAccessException();

            var user = await _context.BankifyUsers
                .FirstOrDefaultAsync(u => u.UserRef == userRef)
                ?? throw new KeyNotFoundException("User not found.");

            _context.BankifyUsers.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<BankifyUserDto>> GetAllBankifyUserAsync()
        {
            _logger.LogInformation("Getting all accounts...");

            return await _context.BankifyUsers
                .AsNoTracking()
                .Select(u => Map(u))
                .ToListAsync();
        }

        public async Task<LoginResponseDto> VerifyLogin(LoginDto dto)
        {
            _logger.LogInformation("Verifying login...");

            var user = await _context.BankifyUsers
                .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower())
                ?? throw new UnauthorizedAccessException("Invalid credentials.");

            var result = _hasher.VerifyHashedPassword(user, user.Password, dto.Password);

            if (result == PasswordVerificationResult.Failed)
                throw new UnauthorizedAccessException("Invalid credentials.");

            return new LoginResponseDto
            {
                Token = GenerateToken(user),
                User = Map(user)
            };
        }

        private string GenerateToken(BankifyUser user)
        {
            _logger.LogInformation("Generating token for account...");

            var jwtKey = _config["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT Key missing.");

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "30");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserRef),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
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

        private static BankifyUserDto Map(BankifyUser u) => new()
        {
            UserRef = u.UserRef,
            Email = u.Email,
            Role = u.Role,
            AccountNumber = u.AccountNumber,
            PhoneNumber = u.PhoneNumber,
            CreatedDate = u.CreatedDate
        };
    }
}

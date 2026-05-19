using WebAPI.DTOs;

namespace WebAPI.Services.Interfaces
{
    public interface IBankifyUserService
    {
        Task<BankifyUserDto> CreateBankifyUserAsync(CreateBankifyUserDto createBankifyUserDto);
        Task<List<BankifyUserDto>> GetAllBankifyUserAsync();
        Task<LoginResponseDto> VerifyLogin(LoginDto loginDto);
        Task<bool> DeleteBankifyUserAsync(string userRef);
    }
}

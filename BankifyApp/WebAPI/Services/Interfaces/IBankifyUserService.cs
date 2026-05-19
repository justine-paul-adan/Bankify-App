using WebAPI.DTOs;

namespace WebAPI.Services.Interfaces
{
    public interface IBankifyUserService
    {
        Task<BankifyUserDto> CreateBankifyUserAsync(CreateBankifyUserDto createBankifyUserDto);
        Task<List<BankifyUserDto>> GetAllBankifyUserAsync();
        Task<BankifyUserDto?> GetBankifyUserByUserRefAsync(string userRef);
        Task<BankifyUserDto> UpdateBankifyUserAsync(UpdateBankifyUserDto updateBankifyUserDto);
        Task<LoginResponseDto> VerifyLogin(LoginDto loginDto);
        Task<bool> DeleteBankifyUserAsync(string userRef);
    }
}

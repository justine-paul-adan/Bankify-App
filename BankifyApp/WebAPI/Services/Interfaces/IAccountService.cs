using WebAPI.DTOs;

namespace WebAPI.Services.Interfaces
{
    public interface IAccountService
    {
        Task<AccountDto> CreateAccountAsync(CreateAccountDto createAccountDto);
        Task<List<AccountDto>> GetAllAccountsAsync();
        Task<AccountDto?> GetAccountByNumberAsync(int accountNumber);
        Task<AccountDto> UpdateAccountAsync(AccountDto accountDto);
        Task<bool> DeleteAccountAsync(int accountNumber);
    }
}

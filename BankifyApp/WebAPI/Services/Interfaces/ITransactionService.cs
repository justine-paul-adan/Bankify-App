using WebAPI.DTOs;

namespace WebAPI.Services.Interfaces
{
    public interface ITransactionService
    {
        Task<TransactionDto> DepositAsync(RequestTransactionDto requestTransaction);
        Task<TransactionDto> WithdrawAsync(RequestTransactionDto requestTransaction);
        Task<TransactionDto> GetBalanceAsync(int accountNumber, string pin);
        Task<TransactionDto> ChangePinAsync(RequestTransactionDto requestTransaction);
        Task<List<TransactionDto>> GetTransactionHistoryAsync(int accountNumber);
    }
}

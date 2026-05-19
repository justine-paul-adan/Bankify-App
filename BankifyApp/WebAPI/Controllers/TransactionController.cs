using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Services.Interfaces;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet("Balance")]
        public async Task<ActionResult<ResponseDto<TransactionDto>>> GetBalance(int accountNumber, string pin)
        {
            var transaction = await _transactionService.GetBalanceAsync(accountNumber, pin);

            return Ok(new ResponseDto<TransactionDto>
            {
                IsSuccess = true,
                Data = transaction
            });
        }

        [HttpGet("History")]
        public async Task<ActionResult<TransactionDto>> GetTransactionHistory(int accountNumber)
        {
            var transactions = await _transactionService.GetTransactionHistoryAsync(accountNumber);

            return Ok(new ResponseDto<List<TransactionDto>>
            {
                IsSuccess = true,
                Data = transactions
            });
        }

        [HttpPut("Deposit")]
        public async Task<ActionResult<TransactionDto>> Deposit([FromBody] RequestTransactionDto requestTransaction)
        {
            var transaction = await _transactionService.DepositAsync(requestTransaction);

            return Ok(new ResponseDto<TransactionDto>
            {
                IsSuccess = true,
                Data = transaction
            });
        }

        [HttpPut("Withdraw")]
        public async Task<ActionResult<TransactionDto>> Withdraw([FromBody] RequestTransactionDto requestTransaction)
        {
            var transaction = await _transactionService.WithdrawAsync(requestTransaction);

            return Ok(new ResponseDto<TransactionDto>
            {
                IsSuccess = true,
                Data = transaction
            });
        }

        [HttpPut("ChangePin")]
        public async Task<ActionResult<TransactionDto>> ChangePin([FromBody] RequestTransactionDto requestTransaction)
        {
            var transaction = await _transactionService.ChangePinAsync(requestTransaction);

            return Ok(new ResponseDto<TransactionDto>
            {
                IsSuccess = true,
                Data = transaction
            });
        }
    }
}

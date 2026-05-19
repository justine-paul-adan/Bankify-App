using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Services.Interfaces;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("GetAllAccount")]
        public async Task<ActionResult<ResponseDto<AccountDto>>> GetAllAccounts()
        {
            var accounts = await _accountService.GetAllAccountsAsync();

            return Ok(new ResponseDto<List<AccountDto>>
            {
                IsSuccess = true,
                Data = accounts
            });
        }

        [Authorize(Roles = "Admin,Teller")]
        [HttpGet("GetAccountByNumber/{accountNumber}")]
        public async Task<ActionResult<ResponseDto<AccountDto>>> GetAccountByNumber(int accountNumber)
        {
            var account = await _accountService.GetAccountByNumberAsync(accountNumber);

            return Ok(new ResponseDto<AccountDto>
            {
                IsSuccess = true,
                Data = account
            });
        }

        [Authorize(Roles = "Admin,Teller")]
        [HttpPost("CreateAccount")]
        public async Task<ActionResult<ResponseDto<AccountDto>>> CreateAccount([FromBody] CreateAccountDto createAccountDto)
        {
            var account = await _accountService.CreateAccountAsync(createAccountDto);

            return Ok(new ResponseDto<AccountDto>
            {
                IsSuccess = true,
                Data = account
            });
        }

        [Authorize(Roles = "Admin,Teller")]
        [HttpPut("UpdateAccount")]
        public async Task<ActionResult<ResponseDto<AccountDto>>> UpdateAccount([FromBody] AccountDto accountDto)
        {
            var account = await _accountService.UpdateAccountAsync(accountDto);

            return Ok(new ResponseDto<AccountDto>
            {
                IsSuccess = true,
                Data = account
            });
        }

        [Authorize(Roles = "Admin,Teller")]
        [HttpDelete("DeleteAccount/{accountNumber}")]
        public async Task<ActionResult<ResponseDto<AccountDto>>> DeleteAccount(int accountNumber)
        {
            var result = await _accountService.DeleteAccountAsync(accountNumber);

            return Ok(new ResponseDto<AccountDto>
            {
                IsSuccess = true,
                Data = null
            });
        }
    }
}

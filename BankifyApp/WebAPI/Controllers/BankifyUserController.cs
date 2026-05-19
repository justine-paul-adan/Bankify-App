using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Services.Interfaces;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BankifyUserController : ControllerBase
    {
        private readonly IBankifyUserService _bankifyUserService;

        public BankifyUserController(IBankifyUserService bankifyUserService )
        {
            _bankifyUserService = bankifyUserService;
        }

        [AllowAnonymous]
        [HttpPost("CreateBankifyUser")]
        public async Task<IActionResult> CreateBankifyUser(CreateBankifyUserDto dto)
        {
            var result = await _bankifyUserService.CreateBankifyUserAsync(dto);
            return Ok(new ResponseDto<BankifyUserDto>
            {
                IsSuccess = true,
                Data = result
            });
        }

        // 🔓 PUBLIC: login
        [AllowAnonymous]
        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var result = await _bankifyUserService.VerifyLogin(dto);
            return Ok(new ResponseDto<LoginResponseDto>
            {
                IsSuccess = true,
                Data = result
            });
        }

        // 👑 ADMIN ONLY
        [Authorize(Roles = "Admin")]
        [HttpGet("GetAllBankifyUser")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _bankifyUserService.GetAllBankifyUserAsync();
            return Ok(new ResponseDto<List<BankifyUserDto>>
            {
                IsSuccess = true,
                Data = users
            });
        }

        [Authorize]
        [HttpDelete("DeleteBankifyUser/{userRef}")]
        public async Task<IActionResult> Delete(string userRef)
        {
            await _bankifyUserService.DeleteBankifyUserAsync(userRef);

            return Ok(new ResponseDto<string>
            {
                IsSuccess = true,
                Data = null
            });
        }
    }
}

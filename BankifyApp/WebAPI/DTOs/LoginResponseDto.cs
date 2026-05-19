namespace WebAPI.DTOs
{
    public class LoginResponseDto
    {
        public string Token { get; set; }
        public BankifyUserDto User { get; set; }
    }
}

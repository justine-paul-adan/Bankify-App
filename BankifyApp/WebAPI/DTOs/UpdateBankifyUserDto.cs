namespace WebAPI.DTOs
{
    public class UpdateBankifyUserDto
    {
        public string UserRef { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? NewPassword { get; set; } = string.Empty;
        public string? Role { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }
}

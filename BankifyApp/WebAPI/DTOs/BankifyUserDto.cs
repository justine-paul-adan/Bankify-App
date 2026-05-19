namespace WebAPI.DTOs
{
    public class BankifyUserDto
    {
        public string UserRef { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int AccountNumber { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
    }
}

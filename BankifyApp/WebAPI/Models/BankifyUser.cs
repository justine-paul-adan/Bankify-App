namespace WebAPI.Models
{
    public class BankifyUser
    {
        public int UserId { get; set; }
        public string UserRef { get; set; } = string.Empty;
        public int AccountNumber { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
    }
}

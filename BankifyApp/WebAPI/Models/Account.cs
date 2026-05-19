namespace WebAPI.Models
{
    public class Account
    {
        public int AccountId { get; set; }
        public string AccountRef { get; set; } = string.Empty;
        public int AccountNumber { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public decimal AvailableBalance { get; set; }
        public string PinCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool RequirePinChange { get; set; } = true;
        public int FailedPinAttempts { get; set; } = 0;
        public DateTime? LockoutEnd { get; set; }
        public DateTime? LastFailedAttempt { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}

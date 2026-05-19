namespace WebAPI.DTOs
{
    public class AccountDto
    {
        public int AccountNumber { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public decimal? AvailableBalance { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool RequirePinChange { get; set; } = true;
        public int FailedPinAttempts { get; set; } = 0;
        public DateTime? LockoutEnd { get; set; }
        public DateTime? LastFailedAttempt { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}

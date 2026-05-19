namespace WebAPI.Models
{
    public class AuthenticationResult
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public Account? Account { get; set; }
    }
}

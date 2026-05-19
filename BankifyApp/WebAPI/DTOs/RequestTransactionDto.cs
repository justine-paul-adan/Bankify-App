namespace WebAPI.DTOs
{
    public class RequestTransactionDto
    {
        public int AccountNumber { get; set; }
        public decimal? Amount { get; set; }
        public string CurrentPin { get; set; } = string.Empty;
        public string? NewPin { get; set; }
    }
}
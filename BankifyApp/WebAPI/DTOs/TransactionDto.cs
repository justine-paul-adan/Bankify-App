namespace WebAPI.DTOs
{
    public class TransactionDto
    {
        public string TransactionRef { get; set; } = string.Empty;
        public int AccountNumber { get; set; }
        public decimal? Amount { get; set; }
        public string Type { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
    }
}

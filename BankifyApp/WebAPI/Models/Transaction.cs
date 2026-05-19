namespace WebAPI.Models
{
    public class Transaction
    {
        public int TransactionId { get; set; }
        public string TransactionRef { get; set; } = string.Empty;
        public int AccountNumber { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
    }
}

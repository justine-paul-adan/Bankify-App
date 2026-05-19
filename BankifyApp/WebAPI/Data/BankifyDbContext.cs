using Microsoft.EntityFrameworkCore;
using WebAPI.Models;

namespace WebAPI.Data
{
    public class BankifyDbContext : DbContext
    {
        public BankifyDbContext(DbContextOptions<BankifyDbContext> options) : base(options)
        {
        }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<BankifyUser> BankifyUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Account entity
            modelBuilder.Entity<Account>()
                .HasKey(a => a.AccountId);
            modelBuilder.Entity<Account>()
                .Property(a => a.AccountRef)
                .IsRequired()
                .HasMaxLength(50);
            modelBuilder.Entity<Account>()
                .Property(a => a.Email)
                .IsRequired()
                .HasMaxLength(100); ;
            modelBuilder.Entity<Account>()
                .Property(a => a.AvailableBalance)
                .HasPrecision(18, 2);

            // Configure Transaction entity
            modelBuilder.Entity<Transaction>()
                .HasKey(t => t.TransactionId);
            modelBuilder.Entity<Transaction>()
                .Property(t => t.TransactionRef)
                .IsRequired()
                .HasMaxLength(50);
            modelBuilder.Entity<Transaction>()
                .Property(t => t.CreatedBy)
                .IsRequired()
                .HasMaxLength(100);
            modelBuilder.Entity<Transaction>()
                .Property(t => t.Amount)
                .HasPrecision(18, 2);

            // Configure BankifyUser entity
            modelBuilder.Entity<BankifyUser>()
                .HasKey(u => u.UserId);
            modelBuilder.Entity<BankifyUser>()
                .Property(u => u.UserRef)
                .IsRequired()
                .HasMaxLength(50);
            modelBuilder.Entity<BankifyUser>()
                .Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(100);
        }
    }
}
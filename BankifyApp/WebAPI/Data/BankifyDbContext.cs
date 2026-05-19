using Microsoft.EntityFrameworkCore;
using WebAPI.Models;

namespace WebAPI.Data
{
    public class BankifyDbContext : DbContext
    {
        public BankifyDbContext(DbContextOptions<BankifyDbContext> options) : base(options)
        {
        }
        public DbSet<BankifyUser> BankifyUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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
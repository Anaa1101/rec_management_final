using Microsoft.EntityFrameworkCore;
using RecruitmentManagement.Models;

namespace RecruitmentManagement.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Job> Jobs { get; set; }
        public DbSet<Candidate> Candidates { get; set; }
        public DbSet<Interview> Interviews { get; set; }
        public DbSet<Evaluator> Evaluators { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Seed default evaluators
            modelBuilder.Entity<Evaluator>().HasData(
                new Evaluator
                {
                    EvaluatorId = 1,
                    Name = "Manager User",
                    Email = "manager@company.com",
                    Password = "Manager123",
                    Designation = "Manager"
                },
                new Evaluator
                {
                    EvaluatorId = 2,
                    Name = "HR User",
                    Email = "hr@company.com",
                    Password = "Hr123",
                    Designation = "HR"
                },
                new Evaluator
                {
                    EvaluatorId = 3,
                    Name = "Super User",
                    Email = "superuser@company.com",
                    Password = "Super123",
                    Designation = "SuperUser"
                }
            );
        }
    }
}

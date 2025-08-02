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
    }
}

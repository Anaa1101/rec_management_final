using RecruitmentManagement.Data;
using RecruitmentManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace RecruitmentManagement.Services
{
    public class JobService
    {
        private readonly AppDbContext _context;

        public JobService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Job>> GetJobsAsync()
        {
            return await _context.Jobs.ToListAsync();
        }

        public async Task<Job> AddJobAsync(Job job)
        {
            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();
            return job;
        }
    }
}

using RecruitmentManagement.Data;
using RecruitmentManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace RecruitmentManagement.Services
{
    public class InterviewService
    {
        private readonly AppDbContext _context;

        public InterviewService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Interview>> GetInterviewsAsync()
        {
            return await _context.Interviews
                .Include(i => i.Candidate)
                .ToListAsync();
        }

        public async Task<Interview?> GetInterviewByIdAsync(int id)
        {
            return await _context.Interviews
                .Include(i => i.Candidate)
                .FirstOrDefaultAsync(i => i.InterviewId == id);
        }

        public async Task<Interview> AddInterviewAsync(Interview interview)
        {
            _context.Interviews.Add(interview);
            await _context.SaveChangesAsync();
            return interview;
        }

        public async Task<bool> DeleteInterviewAsync(int id)
        {
            var interview = await _context.Interviews.FindAsync(id);
            if (interview == null) return false;

            _context.Interviews.Remove(interview);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

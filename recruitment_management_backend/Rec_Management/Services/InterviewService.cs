using RecruitmentManagement.Data;
using RecruitmentManagement.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

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
            // Remove .Include() since Candidate is [NotMapped]
            return await _context.Interviews.ToListAsync();
        }

        public async Task<Interview?> GetInterviewByIdAsync(int id)
        {
            // Remove .Include() since Candidate is [NotMapped]
            return await _context.Interviews
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

        // Add this method to update interview details
        public async Task<Interview> UpdateInterviewAsync(Interview interview)
        {
            var existingInterview = await _context.Interviews.FindAsync(interview.InterviewId);
            if (existingInterview == null)
            {
                throw new Exception("Interview not found");
            }

            existingInterview.Status = interview.Status;
            existingInterview.Notes = interview.Notes;
            existingInterview.Date = interview.Date;
            existingInterview.RoundNumber = interview.RoundNumber;
            existingInterview.RecruiterId = interview.RecruiterId;

            await _context.SaveChangesAsync();

            return existingInterview;
        }
    }
}
using RecruitmentManagement.Data;
using RecruitmentManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace RecruitmentManagement.Services
{
    public class EvaluatorService
    {
        private readonly AppDbContext _context;

        public EvaluatorService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Evaluator>> GetEvaluatorsAsync()
        {
            return await _context.Evaluators.ToListAsync();
        }

        public async Task<Evaluator?> GetEvaluatorByIdAsync(int id)
        {
            return await _context.Evaluators.FindAsync(id);
        }

        public async Task<Evaluator> AddEvaluatorAsync(Evaluator evaluator)
        {
            _context.Evaluators.Add(evaluator);
            await _context.SaveChangesAsync();
            return evaluator;
        }

        public async Task<bool> DeleteEvaluatorAsync(int id)
        {
            var evaluator = await _context.Evaluators.FindAsync(id);
            if (evaluator == null) return false;

            _context.Evaluators.Remove(evaluator);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

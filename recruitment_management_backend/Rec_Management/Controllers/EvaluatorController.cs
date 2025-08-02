using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentManagement.Data;
using RecruitmentManagement.Models;

namespace Rec_Management.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvaluatorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EvaluatorController(AppDbContext context)
        {
            _context = context;
        }

        // Get all evaluators
        [HttpGet]
        public async Task<IActionResult> GetEvaluators()
        {
            return Ok(await _context.Evaluators.ToListAsync());
        }

        // Create new evaluator
        [HttpPost]
        public async Task<IActionResult> CreateEvaluator(Evaluator evaluator)
        {
            _context.Evaluators.Add(evaluator);
            await _context.SaveChangesAsync();
            return Ok(evaluator);
        }

        // Update evaluator
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvaluator(int id, Evaluator evaluator)
        {
            var existing = await _context.Evaluators.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = evaluator.Name;
            existing.Email = evaluator.Email;
            existing.Password = evaluator.Password;
            existing.Designation = evaluator.Designation;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // Delete evaluator
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvaluator(int id)
        {
            var evaluator = await _context.Evaluators.FindAsync(id);
            if (evaluator == null) return NotFound();

            _context.Evaluators.Remove(evaluator);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Evaluator deleted" });
        }
    }
}

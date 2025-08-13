using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentManagement.Data;
using RecruitmentManagement.Models;
using RecruitmentManagement.DTOs;

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

        // GET: api/Evaluator
        [HttpGet]
        public async Task<IActionResult> GetEvaluators()
        {
            return Ok(await _context.Evaluators.ToListAsync());
        }

        // POST: api/Evaluator
        [HttpPost]
        public async Task<IActionResult> CreateEvaluator([FromBody] Evaluator evaluator)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Evaluators.Add(evaluator);
            await _context.SaveChangesAsync();
            return Ok(evaluator);
        }

        // PUT: api/Evaluator/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvaluator(int id, [FromBody] Evaluator evaluator)
        {
            var existing = await _context.Evaluators.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Name = evaluator.Name;
            existing.Email = evaluator.Email;
            existing.Password = evaluator.Password;
            existing.Designation = evaluator.Designation;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/Evaluator/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvaluator(int id)
        {
            var evaluator = await _context.Evaluators.FindAsync(id);
            if (evaluator == null)
                return NotFound();

            _context.Evaluators.Remove(evaluator);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Evaluator deleted" });
        }

        // POST: api/Evaluator/login
        [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequestDTO loginRequest)
    {
        var user = _context.Evaluators
            .FirstOrDefault(u => u.Email == loginRequest.Email && u.Password == loginRequest.Password);

        if (user == null)
        {
            return Unauthorized("Invalid credentials");
        }

        return Ok(new
        {
            user.EvaluatorId,
            user.Name,
            user.Email,
            user.Designation
        });
        }
    }
}

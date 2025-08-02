using Microsoft.AspNetCore.Mvc;
using RecruitmentManagement.Models;
using RecruitmentManagement.Services;

namespace RecruitmentManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CandidateController : ControllerBase
    {
        private readonly CandidateService _candidateService;

        public CandidateController(CandidateService candidateService)
        {
            _candidateService = candidateService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCandidates()
        {
            return Ok(await _candidateService.GetCandidatesAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCandidate(int id)
        {
            var candidate = await _candidateService.GetCandidateByIdAsync(id);
            if (candidate == null) return NotFound();
            return Ok(candidate);
        }

        [HttpPost]
        public async Task<IActionResult> AddCandidate(Candidate candidate)
        {
            var newCandidate = await _candidateService.AddCandidateAsync(candidate);
            return CreatedAtAction(nameof(GetCandidate), new { id = newCandidate.CandidateId }, newCandidate);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCandidate(int id)
        {
            var result = await _candidateService.DeleteCandidateAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}

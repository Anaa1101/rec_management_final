using Microsoft.AspNetCore.Mvc;
using RecruitmentManagement.Models;
using RecruitmentManagement.Services;

namespace RecruitmentManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InterviewController : ControllerBase
    {
        private readonly InterviewService _interviewService;

        public InterviewController(InterviewService interviewService)
        {
            _interviewService = interviewService;
        }

        [HttpGet]
        public async Task<IActionResult> GetInterviews()
        {
            return Ok(await _interviewService.GetInterviewsAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInterview(int id)
        {
            var interview = await _interviewService.GetInterviewByIdAsync(id);
            if (interview == null) return NotFound();
            return Ok(interview);
        }

        [HttpPost]
        public async Task<IActionResult> AddInterview(Interview interview)
        {
            var newInterview = await _interviewService.AddInterviewAsync(interview);
            return CreatedAtAction(nameof(GetInterview), new { id = newInterview.InterviewId }, newInterview);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInterview(int id)
        {
            var result = await _interviewService.DeleteInterviewAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}

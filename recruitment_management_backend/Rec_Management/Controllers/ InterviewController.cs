using Microsoft.AspNetCore.Mvc;
using RecruitmentManagement.Models;
using RecruitmentManagement.Services;
using RecruitmentManagement.DTOs;
using System;
using System.Threading.Tasks;

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
        public async Task<IActionResult> AddInterview([FromBody] CreateInterviewDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Create the Interview entity from DTO
                var interview = new Interview
                {
                    CandidateId = dto.CandidateId,
                    Date = dto.InterviewDate, // maps to Date in model
                    Status = "Scheduled",     // string instead of enum
                    RoundNumber = dto.Round,  // maps to RoundNumber in model
                    RecruiterId = dto.ScheduledById, // maps to RecruiterId in model
                    Notes = dto.Notes ?? string.Empty
                };

                var newInterview = await _interviewService.AddInterviewAsync(interview);
                return CreatedAtAction(nameof(GetInterview), new { id = newInterview.InterviewId }, newInterview);
            }
            catch (Exception ex)
            {
                // Log error details to console
                Console.WriteLine("Error creating interview: " + ex.Message);
                if (ex.InnerException != null)
                {
                    Console.WriteLine("Inner exception: " + ex.InnerException.Message);
                    if (ex.InnerException.InnerException != null)
                    {
                        Console.WriteLine("Inner-inner exception: " + ex.InnerException.InnerException.Message);
                    }
                }

                return BadRequest(new
                {
                    message = "Failed to create interview",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    deeperError = ex.InnerException?.InnerException?.Message
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInterview(int id)
        {
            var result = await _interviewService.DeleteInterviewAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInterview(int id, [FromBody] UpdateInterviewDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != dto.InterviewId)
            {
                return BadRequest("Interview ID mismatch");
            }

            try
            {
                var interview = await _interviewService.GetInterviewByIdAsync(id);
                if (interview == null)
                    return NotFound();

                // Update fields from DTO
                interview.Status = dto.Status;
                interview.Notes = dto.Notes;
                interview.CandidateId = dto.CandidateId;
                interview.RecruiterId = dto.RecruiterId;
                interview.Date = dto.Date;
                interview.RoundNumber = dto.RoundNumber;

                var updated = await _interviewService.UpdateInterviewAsync(interview);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Failed to update interview",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    deeperError = ex.InnerException?.InnerException?.Message
                });
            }
        }
    }
}
using Microsoft.AspNetCore.Mvc;
using RecruitmentManagement.Models;
using RecruitmentManagement.Services;

namespace RecruitmentManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobController : ControllerBase
    {
        private readonly JobService _jobService;

        public JobController(JobService jobService)
        {
            _jobService = jobService;
        }

        [HttpGet]
        public async Task<IActionResult> GetJobs()
        {
            var jobs = await _jobService.GetJobsAsync();
            return Ok(jobs);
        }

        [HttpPost]
        public async Task<IActionResult> AddJob(Job job)
        {
            var createdJob = await _jobService.AddJobAsync(job);
            return CreatedAtAction(nameof(GetJobs), new { id = createdJob.JobId }, createdJob);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecruitmentManagement.Data;

namespace RecruitmentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidatesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CandidatesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Candidates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetCandidates()
        {
            return await _context.Candidates.ToListAsync();
        }

        // GET: api/Candidates/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Candidate>> GetCandidate(int id)
        {
            var candidate = await _context.Candidates.FindAsync(id);

            if (candidate == null)
            {
                return NotFound();
            }

            return candidate;
        }

        // PUT: api/Candidates/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCandidate(int id, Candidate candidate)
        {
            if (id != candidate.CandidateId)
            {
                return BadRequest();
            }

            _context.Entry(candidate).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CandidateExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

       

        [HttpPost]
        public async Task<ActionResult<Candidate>> PostCandidate(
     [FromForm] string Name,
     [FromForm] string Email,
     [FromForm] string Phone,
     [FromForm] int Experience,
     [FromForm] string College,
     [FromForm] string Skills,
     [FromForm] int JobId,
     IFormFile resumeFile)
        {
            try
            {
                string? resumePath = null;

                if (resumeFile != null && resumeFile.Length > 0)
                {
                    var uploadsFolder = Path.Combine("wwwroot", "resumes");
                    Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(resumeFile.FileName);
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await resumeFile.CopyToAsync(stream);
                    }

                    resumePath = "/resumes/" + uniqueFileName;
                }

                var candidate = new Candidate
                {
                    Name = Name,
                    Email = Email,
                    Phone = Phone,
                    Experience = Experience,
                    College = College,
                    Skills = Skills,
                    JobId = JobId,
                    ResumeFilePath = resumePath
                };

                // Check ModelState manually
                if (!TryValidateModel(candidate))
                {
                    return BadRequest(ModelState);
                }

                _context.Candidates.Add(candidate);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetCandidate", new { id = candidate.CandidateId }, candidate);
            }
            catch (Exception ex)
            {
                // Log the error or return for debugging
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



        // DELETE: api/Candidates/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCandidate(int id)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null)
            {
                return NotFound();
            }

            _context.Candidates.Remove(candidate);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CandidateExists(int id)
        {
            return _context.Candidates.Any(e => e.CandidateId == id);
        }
    }
}
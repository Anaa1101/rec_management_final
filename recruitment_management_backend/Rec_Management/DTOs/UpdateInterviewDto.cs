using System;
using System.ComponentModel.DataAnnotations;

namespace RecruitmentManagement.DTOs
{
    public class UpdateInterviewDto
    {
        [Required]
        public int InterviewId { get; set; }

        [Required]
        public int CandidateId { get; set; }

        [Required]
        public int? RecruiterId { get; set; }

        [Required]
        public string Status { get; set; }

        public string Notes { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int RoundNumber { get; set; }
    }
}
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RecruitmentManagement.Models
{
    public class Interview
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("interview_id")]
        public int InterviewId { get; set; }

        [Column("candidate_id")]
        public int CandidateId { get; set; }

        [ForeignKey("CandidateId")]
        [NotMapped]                  // <-- Add this attribute here
        public Candidate Candidate { get; set; }  // <-- Remove = new Candidate()

        [Column("scheduled_date")]
        public DateTime Date { get; set; } = DateTime.Now;

        [Column("status")]
        public string Status { get; set; } = string.Empty;

        [Column("recruiter_id")]
        public int? RecruiterId { get; set; }

        [NotMapped]                 // <-- Add this attribute here
        public Evaluator Recruiter { get; set; }  // <-- Remove = new Evaluator()

        [Column("round_number")]
        public int RoundNumber { get; set; }

        [Column("notes")]
        public string Notes { get; set; } = string.Empty;
    }
}

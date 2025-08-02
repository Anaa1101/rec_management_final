using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RecruitmentManagement.Models
{
    public class Interview
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int InterviewId { get; set; }

        public int CandidateId { get; set; }
        [ForeignKey("CandidateId")]
        public Candidate Candidate { get; set; }

        public DateTime Date { get; set; }

        public string Status { get; set; }

       [Column("recruiter_id")]  // Optional: To set exact DB column name
public int RecruiterId { get; set; } // Foreign key to Evaluator (Manager)
    }
}

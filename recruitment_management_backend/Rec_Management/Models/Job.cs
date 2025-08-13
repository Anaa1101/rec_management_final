using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RecruitmentManagement.Models
{
    public class Job
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int JobId { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "Job name cannot exceed 100 characters.")]
        public string JobName { get; set; }

        [Required]
        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters.")]
        public string Description { get; set; }

        [Required]
        [StringLength(50, ErrorMessage = "Type cannot exceed 50 characters.")]
        public string Type { get; set; }

        [Required]
        [StringLength(50, ErrorMessage = "Work mode cannot exceed 50 characters.")]
        public string WorkMode { get; set; }
    }
}
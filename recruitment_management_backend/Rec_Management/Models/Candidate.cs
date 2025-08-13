using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RecruitmentManagement.Models;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding;

public class Candidate
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CandidateId { get; set; }

    [Required]
    public string Name { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    public string? Phone { get; set; }

    [Required]
    public int Experience { get; set; }

    public string? College { get; set; }

    [Required]
    public string Skills { get; set; }

    public string? ResumeFilePath { get; set; } // <-- make this nullable

    [Required]
    public int JobId { get; set; }

    [ForeignKey("JobId")]
    [BindNever]
    [JsonIgnore]

    public Job? Job { get; set; }
}
// CreateInterviewDto.cs
// Create this file in a new folder called "DTOs" in your project root
// Path: DTOs/CreateInterviewDto.cs

using System;
using System.ComponentModel.DataAnnotations;

namespace RecruitmentManagement.DTOs
{
    public class CreateInterviewDto
{
    public int CandidateId { get; set; }
    public DateTime InterviewDate { get; set; }
    public int Round { get; set; }
    public int? ScheduledById { get; set; }
    public string? Notes { get; set; }
}

}
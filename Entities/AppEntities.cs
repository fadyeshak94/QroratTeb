using System;
using System.Collections.Generic;

namespace QroratTeb.Entities
{
    public class Servant
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Committee { get; set; }
    }

    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Servant"; // "Admin" or "Servant"
        
        public int? ServantId { get; set; }
        public Servant? Servant { get; set; }
    }

    public class Family
    {
        public int Id { get; set; }
        public string PrimaryContactName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string WhatsAppNumber { get; set; } = string.Empty;

        public string? HusbandName { get; set; }
        public bool IsHusbandDeceased { get; set; } = false;
        public string? HusbandPhoneNumber { get; set; }
        public string? HusbandAge { get; set; }
        public string? HusbandDateOfBirth { get; set; }
        public string? HusbandConfessorName { get; set; }
        public string? HusbandJob { get; set; }

        public string? WifeName { get; set; }
        public bool IsWifeDeceased { get; set; } = false;
        public string? WifePhoneNumber { get; set; }
        public string? WifeAge { get; set; }
        public string? WifeDateOfBirth { get; set; }
        public string? WifeConfessorName { get; set; }
        public string? WifeJob { get; set; }

        // Address
        public string Area { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string BuildingNo { get; set; } = string.Empty;
        public string? Floor { get; set; }
        public string? Landmark { get; set; }

        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    }

    public class Visit
    {
        public int Id { get; set; }
        public DateTime VisitDate { get; set; } = DateTime.Now;
        
        // Servant Information
        public int? ServantId { get; set; }
        public Servant? Servant { get; set; }
        
        // Priest Information
        public bool WasPriestPresent { get; set; } = false;
        public string? PriestName { get; set; }

        public string OriginatingCommittee { get; set; } = string.Empty;
        
        // Family Link
        public int? FamilyId { get; set; }
        public Family? Family { get; set; }

        // AI Flagging
        public string PriorityFlag { get; set; } = "GREEN"; // RED, YELLOW, GREEN
        public bool IsResolved { get; set; } = false;

        // Relationships
        public ICollection<VisitNeed> Needs { get; set; } = new List<VisitNeed>();
        public ICollection<VisitIndividual> Individuals { get; set; } = new List<VisitIndividual>();

        // Optional Sections Details stored as JSON or simple strings for now
        // Spiritual
        public string? SpiritualServiceType { get; set; }
        public string? HasConfessor { get; set; }
        public string? ConfessorName { get; set; }
        public string? IsBedridden { get; set; }
        public string? SpiritualUrgency { get; set; }

        // Healthcare
        public string? HealthCategory { get; set; }
        public string? HealthcareAssistanceTypes { get; set; } // Comma separated
        public string? CaregiverAvailable { get; set; }
        public string? HealthcarePatientName { get; set; }

        // Social
        public string? SupportLevel { get; set; }
        public string? SocialSupportCategories { get; set; } // Comma separated
    }

    public class VisitNeed
    {
        public int Id { get; set; }
        public int VisitId { get; set; }
        public Visit? Visit { get; set; }
        
        public string NeedCategory { get; set; } = string.Empty; 
        // e.g. "spiritual", "sunday_school", "healthcare", "social_support", "general_visit"
    }

    public class VisitIndividual
    {
        public int Id { get; set; }
        public int VisitId { get; set; }
        public Visit? Visit { get; set; }

        public string ChildName { get; set; } = string.Empty; // Used as generic Name now
        public string? PhoneNumber { get; set; }
        public string? Age { get; set; }
        public string? DateOfBirth { get; set; }
        public string? Relation { get; set; } // Father, Mother, Son, etc.
        public string? ConfessorName { get; set; }

        public string EducationalStage { get; set; } = string.Empty;
        public string? SchoolCollegeName { get; set; }
        public string NonAttendanceReason { get; set; } = string.Empty;
        public string? OtherChurchName { get; set; }
    }
}

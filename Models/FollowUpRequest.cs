using System.Collections.Generic;

namespace QroratTeb.Models
{
    public class FollowUpRequest
    {
        public int? ServantId { get; set; }
        public bool WasPriestPresent { get; set; } = false;
        public string? PriestName { get; set; }
        
        public string OriginatingCommittee { get; set; } = string.Empty;
        public string PrimaryContactName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string WhatsAppNumber { get; set; } = string.Empty;
        
        public AddressDto Address { get; set; } = new();
        public List<string> PrimaryNeeds { get; set; } = new();

        // Spiritual
        public string? ServiceType { get; set; }
        public string? HasConfessor { get; set; }
        public string? ConfessorName { get; set; }
        public string? IsBedridden { get; set; }
        public string? SpiritualUrgency { get; set; }

        // Sunday School
        public List<IndividualDto> IndividualsList { get; set; } = new();

        // Healthcare
        public string? HealthCategory { get; set; }
        public List<string> AssistanceType { get; set; } = new();
        public string? CaregiverAvailable { get; set; }

        // Social Support
        public string? SupportLevel { get; set; }
        public List<string> SupportCategory { get; set; } = new();
    }

    public class AddressDto
    {
        public string Area { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string BuildingNo { get; set; } = string.Empty;
        public string? Floor { get; set; }
        public string? Landmark { get; set; }
    }

    public class IndividualDto
    {
        public long Id { get; set; }
        public string ChildName { get; set; } = string.Empty;
        public string EducationalStage { get; set; } = string.Empty;
        public string? SchoolCollegeName { get; set; }
        public string NonAttendanceReason { get; set; } = string.Empty;
    }

    public class FollowUpResponse
    {
        public string Flag { get; set; } = "GREEN";
        public string FlagAr { get; set; } = "روتيني / عادي 🟢";
        public List<string> Targets { get; set; } = new();
        public bool Success { get; set; } = true;
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QroratTeb.Data;
using QroratTeb.Entities;
using QroratTeb.Models;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Authorization;

namespace QroratTeb.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FollowUpController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FollowUpController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/followup
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Visit>>> GetVisits([FromQuery] string? priorityFlag, [FromQuery] int? servantId)
        {
            var query = _context.Visits
                .Include(v => v.Servant)
                .Include(v => v.Family)
                .Include(v => v.Needs)
                .Include(v => v.Individuals)
                .OrderByDescending(v => v.VisitDate)
                .AsQueryable();

            if (!string.IsNullOrEmpty(priorityFlag))
            {
                query = query.Where(v => v.PriorityFlag == priorityFlag);
            }

            if (servantId.HasValue && servantId.Value > 0)
            {
                query = query.Where(v => v.ServantId == servantId.Value);
            }

            var visits = await query.ToListAsync();
            return Ok(visits);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Visit>> GetVisit(int id)
        {
            var visit = await _context.Visits
                .Include(v => v.Servant)
                .Include(v => v.Family)
                .Include(v => v.Needs)
                .Include(v => v.Individuals)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (visit == null)
            {
                return NotFound();
            }

            return Ok(visit);
        }

        [HttpPost]
        public async Task<ActionResult<FollowUpResponse>> Submit([FromBody] FollowUpRequest request)
        {
            if (request == null)
                return BadRequest("Invalid request.");

            var response = new FollowUpResponse
            {
                Targets = new List<string> { "لوحة التحكم الرئيسية" }
            };

            // AI Priority Logic
            bool isRed = false;
            bool isYellow = false;

            if (request.ServiceType == "تناول مرضى بالمنزل" || 
                request.HealthCategory == "جراحة عاجلة" ||
                request.SupportLevel == "🔴 عاجل جداً" ||
                request.SpiritualUrgency == "🔴 عاجل خلال 24 ساعة")
            {
                isRed = true;
            }
            else if (request.ServiceType == "سر الاعتراف" || 
                     request.SupportLevel == "🟡 متوسط" ||
                     request.IndividualsList.Any(i => i.NonAttendanceReason == "أسباب نفسية/اجتماعية"))
            {
                isYellow = true;
            }

            string flag = "GREEN";
            if (isRed)
            {
                flag = "RED";
                response.Flag = flag;
                response.FlagAr = "حالة طارئة وعاجلة 🔴";
            }
            else if (isYellow)
            {
                flag = "YELLOW";
                response.Flag = flag;
                response.FlagAr = "متابعة قريبة (متوسط) 🟡";
            }

            // Data Routing Matrix Logic
            if (request.PrimaryNeeds.Contains("spiritual")) response.Targets.Add("أب الكاهن (عبر واتساب)");
            if (request.PrimaryNeeds.Contains("sunday_school")) response.Targets.Add("أمين مدارس الأحد (عبر التطبيق)");
            if (request.PrimaryNeeds.Contains("healthcare")) response.Targets.Add("أمين خدمة المرضى (إشعار طارئ)");
            if (request.PrimaryNeeds.Contains("social_support")) response.Targets.Add("إخوة الرب (متابعة الدعم)");

            // Find or Create Family
            var family = await _context.Families
                .FirstOrDefaultAsync(f => f.PhoneNumber == request.PhoneNumber);

            if (family == null)
            {
                family = new Family
                {
                    PrimaryContactName = request.PrimaryContactName,
                    PhoneNumber = request.PhoneNumber,
                    WhatsAppNumber = request.WhatsAppNumber,
                    HusbandName = request.HusbandName,
                    IsHusbandDeceased = request.IsHusbandDeceased,
                    HusbandPhoneNumber = request.HusbandPhoneNumber,
                    HusbandAge = request.HusbandAge,
                    HusbandDateOfBirth = request.HusbandDateOfBirth,
                    HusbandConfessorName = request.HusbandConfessorName,
                    HusbandJob = request.HusbandJob,
                    WifeName = request.WifeName,
                    IsWifeDeceased = request.IsWifeDeceased,
                    WifePhoneNumber = request.WifePhoneNumber,
                    WifeAge = request.WifeAge,
                    WifeDateOfBirth = request.WifeDateOfBirth,
                    WifeConfessorName = request.WifeConfessorName,
                    WifeJob = request.WifeJob,
                    Area = request.Address.Area,
                    Street = request.Address.Street,
                    BuildingNo = request.Address.BuildingNo,
                    Floor = request.Address.Floor,
                    Landmark = request.Address.Landmark
                };
                _context.Families.Add(family);
            }
            else
            {
                family.PrimaryContactName = request.PrimaryContactName;
                family.WhatsAppNumber = request.WhatsAppNumber;
                family.HusbandName = request.HusbandName;
                family.IsHusbandDeceased = request.IsHusbandDeceased;
                family.HusbandPhoneNumber = request.HusbandPhoneNumber;
                family.HusbandAge = request.HusbandAge;
                family.HusbandDateOfBirth = request.HusbandDateOfBirth;
                family.HusbandConfessorName = request.HusbandConfessorName;
                family.HusbandJob = request.HusbandJob;
                family.WifeName = request.WifeName;
                family.IsWifeDeceased = request.IsWifeDeceased;
                family.WifePhoneNumber = request.WifePhoneNumber;
                family.WifeAge = request.WifeAge;
                family.WifeDateOfBirth = request.WifeDateOfBirth;
                family.WifeConfessorName = request.WifeConfessorName;
                family.WifeJob = request.WifeJob;
                family.Area = request.Address.Area;
                family.Street = request.Address.Street;
                family.BuildingNo = request.Address.BuildingNo;
                family.Floor = request.Address.Floor;
                family.Landmark = request.Address.Landmark;
            }

            // Save to DB
            var visit = new Visit
            {
                ServantId = request.ServantId,
                WasPriestPresent = request.WasPriestPresent,
                PriestName = request.PriestName,
                OriginatingCommittee = request.OriginatingCommittee,
                Family = family,
                PriorityFlag = flag,
                
                SpiritualServiceType = request.ServiceType,
                HasConfessor = request.HasConfessor,
                ConfessorName = request.ConfessorName,
                IsBedridden = request.IsBedridden,
                SpiritualUrgency = request.SpiritualUrgency,
                
                HealthCategory = request.HealthCategory,
                HealthcareAssistanceTypes = request.AssistanceType != null ? string.Join(",", request.AssistanceType) : "",
                CaregiverAvailable = request.CaregiverAvailable,
                HealthcarePatientName = request.HealthcarePatientName,
                
                SupportLevel = request.SupportLevel,
                SocialSupportCategories = string.Join(",", request.SupportCategory),
                
                VisitDate = System.DateTime.Now
            };

            foreach(var need in request.PrimaryNeeds)
            {
                visit.Needs.Add(new VisitNeed { NeedCategory = need });
            }

            foreach(var ind in request.IndividualsList)
            {
                visit.Individuals.Add(new VisitIndividual
                {
                    ChildName = ind.ChildName,
                    PhoneNumber = ind.PhoneNumber,
                    Age = ind.Age,
                    DateOfBirth = ind.DateOfBirth,
                    Relation = ind.Relation,
                    ConfessorName = ind.ConfessorName,
                    EducationalStage = ind.EducationalStage,
                    SchoolCollegeName = ind.SchoolCollegeName,
                    NonAttendanceReason = ind.NonAttendanceReason,
                    OtherChurchName = ind.OtherChurchName
                });
            }

            _context.Visits.Add(visit);
            await _context.SaveChangesAsync();

            return Ok(response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVisit(int id, [FromBody] FollowUpRequest request)
        {
            var visit = await _context.Visits
                .Include(v => v.Family)
                .Include(v => v.Needs)
                .Include(v => v.Individuals)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (visit == null)
                return NotFound("الزيارة غير موجودة");

            // Update family
            if (visit.Family != null)
            {
                visit.Family.PrimaryContactName = request.PrimaryContactName;
                visit.Family.PhoneNumber = request.PhoneNumber;
                visit.Family.WhatsAppNumber = request.WhatsAppNumber;
                visit.Family.HusbandName = request.HusbandName;
                visit.Family.IsHusbandDeceased = request.IsHusbandDeceased;
                visit.Family.HusbandPhoneNumber = request.HusbandPhoneNumber;
                visit.Family.HusbandAge = request.HusbandAge;
                visit.Family.HusbandDateOfBirth = request.HusbandDateOfBirth;
                visit.Family.HusbandConfessorName = request.HusbandConfessorName;
                visit.Family.HusbandJob = request.HusbandJob;
                visit.Family.WifeName = request.WifeName;
                visit.Family.IsWifeDeceased = request.IsWifeDeceased;
                visit.Family.WifePhoneNumber = request.WifePhoneNumber;
                visit.Family.WifeAge = request.WifeAge;
                visit.Family.WifeDateOfBirth = request.WifeDateOfBirth;
                visit.Family.WifeConfessorName = request.WifeConfessorName;
                visit.Family.WifeJob = request.WifeJob;
                visit.Family.Area = request.Address.Area;
                visit.Family.Street = request.Address.Street;
                visit.Family.BuildingNo = request.Address.BuildingNo;
                visit.Family.Floor = request.Address.Floor;
                visit.Family.Landmark = request.Address.Landmark;
            }

            // Update Visit Basic Info
            visit.ServantId = request.ServantId;
            visit.WasPriestPresent = request.WasPriestPresent;
            visit.PriestName = request.PriestName;
            visit.OriginatingCommittee = request.OriginatingCommittee;

            visit.SpiritualServiceType = request.ServiceType;
            visit.HasConfessor = request.HasConfessor;
            visit.ConfessorName = request.ConfessorName;
            visit.IsBedridden = request.IsBedridden;
            visit.SpiritualUrgency = request.SpiritualUrgency;
            
            visit.HealthCategory = request.HealthCategory;
            visit.HealthcareAssistanceTypes = request.AssistanceType != null ? string.Join(",", request.AssistanceType) : "";
            visit.CaregiverAvailable = request.CaregiverAvailable;
            visit.HealthcarePatientName = request.HealthcarePatientName;
            
            visit.SupportLevel = request.SupportLevel;
            visit.SocialSupportCategories = string.Join(",", request.SupportCategory);

            // Re-evaluate Priority Flag
            bool isRed = request.ServiceType == "تناول مرضى بالمنزل" || request.HealthCategory == "جراحة عاجلة" || request.SupportLevel == "🔴 عاجل جداً" || request.SpiritualUrgency == "🔴 عاجل خلال 24 ساعة";
            bool isYellow = request.ServiceType == "سر الاعتراف" || request.SupportLevel == "🟡 متوسط" || request.IndividualsList.Any(i => i.NonAttendanceReason == "أسباب نفسية/اجتماعية");
            visit.PriorityFlag = isRed ? "RED" : (isYellow ? "YELLOW" : "GREEN");

            // Update Needs
            _context.Set<VisitNeed>().RemoveRange(visit.Needs);
            visit.Needs.Clear();
            foreach(var need in request.PrimaryNeeds)
                visit.Needs.Add(new VisitNeed { NeedCategory = need });

            // Update Individuals
            _context.Set<VisitIndividual>().RemoveRange(visit.Individuals);
            visit.Individuals.Clear();
            foreach(var ind in request.IndividualsList)
            {
                visit.Individuals.Add(new VisitIndividual
                {
                    ChildName = ind.ChildName,
                    PhoneNumber = ind.PhoneNumber,
                    Age = ind.Age,
                    DateOfBirth = ind.DateOfBirth,
                    Relation = ind.Relation,
                    ConfessorName = ind.ConfessorName,
                    EducationalStage = ind.EducationalStage,
                    SchoolCollegeName = ind.SchoolCollegeName,
                    NonAttendanceReason = ind.NonAttendanceReason,
                    OtherChurchName = ind.OtherChurchName
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "تم تعديل الزيارة بنجاح" });
        }

        [HttpPut("{id}/resolve")]
        public async Task<IActionResult> ResolveVisit(int id)
        {
            var visit = await _context.Visits.FindAsync(id);
            if (visit == null)
            {
                return NotFound("Visit not found.");
            }

            visit.IsResolved = true;
            // Optionally change priority to GREEN when resolved, or just use the flag IsResolved
            
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم تحديث حالة الزيارة إلى محلولة/تمت المتابعة بنجاح." });
        }
    }
}

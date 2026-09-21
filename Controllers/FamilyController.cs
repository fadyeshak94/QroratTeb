using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QroratTeb.Data;
using System.Threading.Tasks;
using System.Linq;

using Microsoft.AspNetCore.Authorization;

namespace QroratTeb.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FamilyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FamilyController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchByPhone([FromQuery] string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return BadRequest("رقم الهاتف مطلوب.");

            var family = await _context.Families
                .Include(f => f.Visits)
                .ThenInclude(v => v.Servant)
                .FirstOrDefaultAsync(f => f.PhoneNumber == phone);

            if (family == null)
            {
                return NotFound("لم يتم العثور على عائلة بهذا الرقم.");
            }

            // Project data to avoid circular references and send clean data to frontend
            var result = new
            {
                family.Id,
                family.PrimaryContactName,
                family.PhoneNumber,
                family.WhatsAppNumber,
                family.Area,
                family.Street,
                family.BuildingNo,
                family.Floor,
                family.Landmark,
                VisitHistory = family.Visits.OrderByDescending(v => v.VisitDate).Select(v => new {
                    v.Id,
                    v.VisitDate,
                    ServantName = v.Servant != null ? v.Servant.Name : "غير محدد",
                    v.PriorityFlag,
                    v.IsResolved
                })
            };

            return Ok(result);
        }
    }
}

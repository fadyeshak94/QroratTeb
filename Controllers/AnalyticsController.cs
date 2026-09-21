using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QroratTeb.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Authorization;

namespace QroratTeb.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardStats()
        {
            var visits = await _context.Visits.Include(v => v.Needs).Include(v => v.Family).ToListAsync();
            var totalVisits = visits.Count;
            var resolvedVisits = visits.Count(v => v.IsResolved);
            var pendingVisits = totalVisits - resolvedVisits;

            var priorityStats = new Dictionary<string, int>
            {
                { "RED", visits.Count(v => v.PriorityFlag == "RED") },
                { "YELLOW", visits.Count(v => v.PriorityFlag == "YELLOW") },
                { "GREEN", visits.Count(v => v.PriorityFlag == "GREEN") }
            };

            var needStats = new Dictionary<string, int>();
            foreach (var visit in visits)
            {
                foreach (var need in visit.Needs)
                {
                    if (needStats.ContainsKey(need.NeedCategory))
                        needStats[need.NeedCategory]++;
                    else
                        needStats[need.NeedCategory] = 1;
                }
            }

            var recentVisits = visits
                .OrderByDescending(v => v.VisitDate)
                .Take(5)
                .Select(v => new {
                    v.Id,
                    PrimaryContactName = v.Family?.PrimaryContactName ?? "غير محدد",
                    v.PriorityFlag,
                    v.VisitDate,
                    v.IsResolved
                })
                .ToList();

            return Ok(new
            {
                totalVisits,
                resolvedVisits,
                pendingVisits,
                priorityStats,
                needStats,
                recentVisits
            });
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QroratTeb.Data;
using QroratTeb.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QroratTeb.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServantsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServantsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/servants
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Servant>>> GetServants()
        {
            return await _context.Servants.ToListAsync();
        }

        // POST: api/servants
        [HttpPost]
        public async Task<ActionResult<Servant>> CreateServant([FromBody] Servant servant)
        {
            if (string.IsNullOrEmpty(servant.Name))
                return BadRequest("Name is required");

            _context.Servants.Add(servant);
            await _context.SaveChangesAsync();

            return Ok(servant);
        }
    }
}

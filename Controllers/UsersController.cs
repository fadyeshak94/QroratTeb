using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QroratTeb.Data;
using QroratTeb.Entities;

namespace QroratTeb.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Servant)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Role,
                    ServantName = u.Servant != null ? u.Servant.Name : "غير مرتبط"
                })
                .ToListAsync();

            return Ok(users);
        }

        // POST: api/users
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("اسم المستخدم وكلمة المرور مطلوبان.");

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (existingUser != null)
                return BadRequest("اسم المستخدم مستخدم بالفعل.");

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = dto.Password, // In a real app, hash this!
                Role = dto.Role,
                ServantId = dto.ServantId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "تم إنشاء المستخدم بنجاح" });
        }
    }

    public class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Servant"; // Admin or Servant
        public int? ServantId { get; set; }
    }
}

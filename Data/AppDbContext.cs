using Microsoft.EntityFrameworkCore;
using QroratTeb.Entities;

namespace QroratTeb.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Servant> Servants { get; set; }
        public DbSet<Visit> Visits { get; set; }
        public DbSet<VisitNeed> VisitNeeds { get; set; }
        public DbSet<VisitIndividual> VisitIndividuals { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Seed a default servant for easy testing
            modelBuilder.Entity<Servant>().HasData(
                new Servant { Id = 1, Name = "خادم تجريبي", Phone = "01000000000", Committee = "المنطقة الأولى" }
            );
        }
    }
}

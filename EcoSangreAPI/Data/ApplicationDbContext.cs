using Microsoft.EntityFrameworkCore;
using EcoSangreAPI.Models;

namespace EcoSangreAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<BloodRequest> BloodRequests { get; set; }
    }
}

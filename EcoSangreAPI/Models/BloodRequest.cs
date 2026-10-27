namespace EcoSangreAPI.Models
{
    // Enumerador para asegurar consistencia en los tipos de sangre
    public enum BloodType
    {
        APositivo, ANegativo,
        BPositivo, BNegativo,
        ABPositivo, ABNegativo,
        OPositivo, ONegativo
    }

    // Modelo para las solicitudes de donantes
    public class BloodRequest
    {
        public int Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public BloodType RequiredBloodType { get; set; }
        public int DonorsNeeded { get; set; }
        public int DonorsJoined { get; set; } = 0; // Cuántos dadores ya se sumaron
        public string HospitalName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}

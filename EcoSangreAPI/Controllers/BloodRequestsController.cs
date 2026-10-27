using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoSangreAPI.Data;
using EcoSangreAPI.Models;

namespace EcoSangreAPI.Controllers
{
    /// <summary>
    /// Controlador para la gestión de solicitudes y alertas comunitarias de donación de sangre.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class BloodRequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BloodRequestsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Crear una nueva solicitud urgente de donación de sangre en la comunidad.
        /// </summary>
        /// <param name="request">Datos de la solicitud (paciente, tipo de sangre, hospital, etc.).</param>
        /// <returns>La solicitud creada con su ID asignado.</returns>
        [HttpPost]
        public async Task<ActionResult<BloodRequest>> CreateRequest(BloodRequest request)
        {
            request.CreatedAt = DateTime.UtcNow;
            request.IsActive = true;
            
            _context.BloodRequests.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRequestById), new { id = request.Id }, request);
        }

        /// <summary>
        /// Listar todos los pedidos de donación que se encuentran activos. Permite filtrar los resultados.
        /// </summary>
        /// <param name="bloodType">Filtro opcional por grupo y factor sanguíneo.</param>
        /// <param name="city">Filtro opcional por nombre de la localidad o ciudad.</param>
        /// <returns>Lista de alertas de donación activas que coinciden con la búsqueda.</returns>
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<BloodRequest>>> GetActiveRequests(
            [FromQuery] BloodType? bloodType, 
            [FromQuery] string? city)
        {
            var query = _context.BloodRequests.Where(r => r.IsActive);

            if (bloodType.HasValue)
                query = query.Where(r => r.RequiredBloodType == bloodType.Value);

            if (!string.IsNullOrEmpty(city))
                query = query.Where(r => r.City.ToLower().Contains(city.ToLower()));

            return await query.ToListAsync();
        }

        /// <summary>
        /// Obtener el detalle específico de un pedido de donación de sangre mediante su identificador único (ID).
        /// </summary>
        /// <param name="id">ID de la solicitud a consultar.</param>
        /// <returns>Los datos detallados de la solicitud pedida.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<BloodRequest>> GetRequestById(int id)
        {
            var request = await _context.BloodRequests.FindAsync(id);
            if (request == null) return NotFound();
            return request;
        }

        /// <summary>
        /// Postularse como donante voluntario para un pedido específico. Incrementa el contador de dadores en tiempo real.
        /// </summary>
        /// <remarks>
        /// Lógica de negocio: Si al sumarse el donante se alcanza el cupo total requerido, la alerta cambia de estado automáticamente a Inactiva.
        /// </remarks>
        /// <param name="id">ID del pedido de donación al que te quieres postular.</param>
        /// <returns>Mensaje de éxito y el contador actualizado de dadores confirmados.</returns>
        [HttpPut("{id}/join")]
        public async Task<IActionResult> JoinAsDonor(int id)
        {
            var request = await _context.BloodRequests.FindAsync(id);
            if (request == null || !request.IsActive) 
                return NotFound("Pedido no encontrado o ya inactivo.");

            request.DonorsJoined++;
            
            if (request.DonorsJoined >= request.DonorsNeeded)
            {
                request.IsActive = false;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "¡Te has postulado como donante con éxito!", currentDonors = request.DonorsJoined });
        }

        /// <summary>
        /// Dar de baja o dar por finalizado un pedido de donación de forma manual.
        /// </summary>
        /// <remarks>
        /// Aplica un "borrado lógico" (soft-delete), desactivando la alerta de la vista pública pero conservando los datos para el historial estadístico.
        /// </remarks>
        /// <param name="id">ID del pedido que se desea cerrar o retirar.</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> CloseRequest(int id)
        {
            var request = await _context.BloodRequests.FindAsync(id);
            if (request == null) return NotFound();

            request.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

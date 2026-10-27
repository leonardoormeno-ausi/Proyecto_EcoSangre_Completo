# Manual Técnico y de Integración: Proyecto EcoSangre
... (Aquí se guardará todo el texto que viste arriba) ...
# Manual Técnico y de Integración: Proyecto EcoSangre

Plataforma orientada a la salud comunitaria que centraliza y gestiona solicitudes urgentes de donantes de sangre en centros de salud y hospitales. Desarrollada bajo una arquitectura acoplada moderna (Full-Stack Decoupled) utilizando .NET 8 Web API para el Backend y React con Vite para el Frontend.

---

## 1. Arquitectura y Estructura del Entorno

El proyecto se encuentra organizado en un Área de Trabajo unificada, separando la lógica del servidor de la interfaz del cliente para garantizar la portabilidad entre sistemas operativos (Linux / Windows).

```text
EcoSangre (Área de Trabajo)
├── EcoSangreAPI/             --> Directorio del Backend (C# / .NET 8)
│   ├── Controllers/
│   │   └── BloodRequestsController.cs  --> Endpoints documentados en Castellano
│   ├── Data/
│   │   └── ApplicationDbContext.cs     --> Contexto de Entity Framework Core
│   ├── Models/
│   │   └── BloodRequest.cs             --> Modelo de datos y Enums de factores
│   ├── EcoSangre.db            --> Base de datos física relacional (SQLite)
│   └── Program.cs              --> Configuración central, dependencias y CORS
│
└── ecosangre-frontend/       --> Directorio del Frontend (React / Vite 5)
    ├── src/
    │   ├── services/
    │   │   └── api.js          --> Conector Axios con puertos sincronizados
    │   ├── App.css             --> Estilos visuales con estética biomédica
    │   ├── App.jsx             --> Pantalla principal, filtros y formulario
    │   └── main.jsx
    └── vite.config.js          --> Configuración de compilación local
```

---

## 2. Código Fuente Consolidado del Backend (`EcoSangreAPI`)

### A. Configuración Central y Escudo CORS (`Program.cs`)
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using EcoSangreAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Registro de la Base de Datos SQLite (Portable en archivo local)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=EcoSangre.db"));

// Configuración de Controladores con flexibilización de nombres y enums string
builder.Services.AddControllers()
    .AddJsonOptions(options => 
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = null; 
    });

// Configuración Global de CORS para permitir la conexión de navegadores locales
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "EcoSangre API", Version = "v1" });
    var xmlFile = \$"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(c => { c.SerializeAsV2 = true; });
    app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "EcoSangreAPI v1"); });
}

app.UseCors("PermitirFrontend");
app.UseAuthorization();
app.MapControllers();

// Inicialización automática de Base de Datos y Estructura de Tablas
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.EnsureCreated();
    } catch (Exception) { /* Manejo de logs en desarrollo */ }
}

app.Run();
```

### B. Controlador e Interacciones Comunitarias (`BloodRequestsController.cs`)
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EcoSangreAPI.Data;
using EcoSangreAPI.Models;

namespace EcoSangreAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BloodRequestsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public BloodRequestsController(ApplicationDbContext context) { _context = context; }

        /// <summary>Crear una nueva solicitud urgente de donación de sangre.</summary>
        [HttpPost]
        public async Task<ActionResult<BloodRequest>> CreateRequest(BloodRequest request)
        {
            request.CreatedAt = DateTime.UtcNow;
            request.IsActive = true;
            _context.BloodRequests.Add(request);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetRequestById), new { id = request.Id }, request);
        }

        /// <summary>Listar pedidos activos con soporte de filtros por Tipo de Sangre y Ciudad.</summary>
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<BloodRequest>>> GetActiveRequests([FromQuery] BloodType? bloodType, [FromQuery] string? city)
        {
            var query = _context.BloodRequests.Where(r => r.IsActive);
            if (bloodType.HasValue) query = query.Where(r => r.RequiredBloodType == bloodType.Value);
            if (!string.IsNullOrEmpty(city)) query = query.Where(r => r.City.ToLower().Contains(city.ToLower()));
            return await query.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BloodRequest>> GetRequestById(int id)
        {
            var request = await _context.BloodRequests.FindAsync(id);
            if (request == null) return NotFound();
            return request;
        }

        /// <summary>Postularse como donante voluntario (Incrementa contador en tiempo real).</summary>
        [HttpPut("{id}/join")]
        public async Task<IActionResult> JoinAsDonor(int id)
        {
            var request = await _context.BloodRequests.FindAsync(id);
            if (request == null || !request.IsActive) return NotFound("Pedido inactivo o no encontrado.");

            request.DonorsJoined++;
            if (request.DonorsJoined >= request.DonorsNeeded) request.IsActive = false; // Cierre automático por cupo lleno

            await _context.SaveChangesAsync();
            return Ok(new { message = "¡Te has postulado como donante con éxito!", currentDonors = request.DonorsJoined });
        }
    }
}
```

---

## 3. Código Fuente Consolidado del Frontend (`ecosangre-frontend`)

### A. Conector de Servicios de Red (`src/services/api.js`)
```javascript
import axios from 'axios';

// URL sintonizada con el puerto nativo de la API
const API_URL = 'http://localhost:5195/api/bloodrequests';

export const bloodRequestService = {
  getActiveRequests: function(bloodType, city) {
    return axios.get(API_URL + '/active', {
      params: { bloodType: bloodType || '', city: city || '' }
    }).then(function(res) { return res.data; });
  },

  createRequest: function(requestData) {
    return axios.post(API_URL, requestData).then(function(res) { return res.data; });
  },

  joinAsDonor: function(id) {
    return axios.put(API_URL + '/' + id + '/join').then(function(res) { return res.data; });
  }
};
```

---

## 4. Guía de Ejecución y Despliegue Rápido

### En Linux (Entorno de Desarrollo Actual)
Para encender el ecosistema completo, abrir el archivo `.code-workspace` en VS Code y ejecutar en las pestañas divididas de la terminal:
*   **Terminal Izquierda (Frontend):** `NODE_OPTIONS="--dns-result-order=ipv4first" npm run dev`
*   **Terminal Derecha (Backend):** `dotnet run`

### Portabilidad a Windows (Visual Studio 2022)
El sistema es 100% multiplataforma y portable en pendrive:
1.  **Backend:** El profesor puede abrir el archivo `EcoSangreAPI.csproj` directamente en Visual Studio 2022. SQLite mantendrá los registros guardados de forma local (archivo `EcoSangre.db`).
2.  **Sincronización de Puerto:** Si Visual Studio asigna un puerto diferente al arrancar (ej: `7124`), abrir el archivo `src/services/api.js` en el Frontend y actualizar la constante `API_URL` con el nuevo número.
3.  **Frontend:** Desde una terminal CMD o PowerShell de Windows en la carpeta del cliente, ejecutar `npm run dev` (En Windows no requiere el parámetro de DNS intermedio).


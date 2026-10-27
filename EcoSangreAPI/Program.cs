using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using EcoSangreAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. REGISTRO DE SERVICIOS (DEPENDENCIAS)
// ==========================================

// PASO CLAVE: Registramos PRIMERO la base de datos para que el Controlador la pueda encontrar al arrancar
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=EcoSangre.db"));

// Configuramos los Controladores flexibles (mayúsculas/minúsculas y texto en Enums)
builder.Services.AddControllers()
    .AddJsonOptions(options => 
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = null; 
    });

// Habilitamos el permiso de CORS abierto total para evitar bloqueos del navegador
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

// Configuración de Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "EcoSangre API", 
        Version = "v1",
        Description = "Web API para Gestión Comunitaria de Donación de Sangre"
    });
});

var app = builder.Build();

// ==========================================
// 2. CONFIGURACIÓN DEL PIPELINE (MIDDLEWARES)
// ==========================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(c => { c.SerializeAsV2 = true; });
    app.UseSwaggerUI(c => { c.SwaggerEndpoint("/swagger/v1/swagger.json", "EcoSangreAPI v1"); });
}

// Activamos CORS antes de Authorization (Secuencia estricta de .NET)
app.UseCors("PermitirFrontend");

app.UseAuthorization();

app.MapControllers();

// Forzamos la creación automática del archivo SQLite y las tablas de datos
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error al crear la base de datos.");
    }
}

app.Run();

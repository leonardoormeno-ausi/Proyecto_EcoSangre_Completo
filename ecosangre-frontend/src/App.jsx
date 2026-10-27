import React, { useState, useEffect } from 'react';
import { bloodRequestService } from './services/api';
import './App.css';

function App() {
  const [requests, setRequests] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');

  const [patientName, setPatientName] = useState('');
  const [requiredBloodType, setRequiredBloodType] = useState('OPositivo');
  const [donorsNeeded, setDonorsNeeded] = useState(1);
  const [hospitalName, setHospitalName] = useState('');
  const [city, setCity] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const loadRequests = function() {
    bloodRequestService.getActiveRequests(bloodFilter, cityFilter)
      .then(function(data) { setRequests(data); })
      .catch(function(err) { console.error("Error al cargar:", err); });
  };

  useEffect(function() {
    loadRequests();
  }, [cityFilter, bloodFilter]);

  const handleCreateRequest = function(e) {
    e.preventDefault();

    const newRequest = {
      PatientName: patientName,
      RequiredBloodType: requiredBloodType,
      DonorsNeeded: parseInt(donorsNeeded),
      HospitalName: hospitalName,
      City: city,
      ContactPhone: contactPhone
    };

    bloodRequestService.createRequest(newRequest)
      .then(function() {
        alert("¡Alerta de donación publicada con éxito!");
        setPatientName('');
        setHospitalName('');
        setCity('');
        setContactPhone('');
        setDonorsNeeded(1);
        loadRequests();
      })
      .catch(function() {
        alert("Error al publicar la solicitud. Revisa la conexión con la API.");
      });
  };

  const handleJoin = function(id) {
    bloodRequestService.joinAsDonor(id)
      .then(function(result) {
        alert(result.message);
        loadRequests();
      })
      .catch(function() {
        alert("No se pudo registrar la postulación.");
      });
  };

  return (
    <div className="container">
      <header className="header">
        <h1>EcoSangre</h1>
        <p>Red de Alertas Comunitarias para Donación de Sangre Urgente</p>
      </header>

      <section style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h2 style={{ color: '#d32f2f', marginTop: 0, fontSize: '1.4rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
          Nueva Solicitud de Donantes
        </h2>
        <form onSubmit={handleCreateRequest} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Nombre del Paciente</label>
            <input type="text" required value={patientName} onChange={function(e) { setPatientName(e.target.value); }} placeholder="Ej: Juan Pérez" style={{ width: '90%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Tipo de Sangre</label>
            <select value={requiredBloodType} onChange={function(e) { setRequiredBloodType(e.target.value); }} style={{ width: '98%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="APositivo">A+</option>
              <option value="ANegativo">A-</option>
              <option value="BPositivo">B+</option>
              <option value="BNegativo">B-</option>
              <option value="ABPositivo">AB+</option>
              <option value="ABNegativo">AB-</option>
              <option value="OPositivo">O+</option>
              <option value="ONegativo">O-</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Dadores Necesarios</label>
            <input type="number" min="1" required value={donorsNeeded} onChange={function(e) { setDonorsNeeded(e.target.value); }} style={{ width: '90%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Centro de Salud / Hospital</label>
            <input type="text" required value={hospitalName} onChange={function(e) { setHospitalName(e.target.value); }} placeholder="Ej: Hospital Central" style={{ width: '90%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Ciudad</label>
            <input type="text" required value={city} onChange={function(e) { setCity(e.target.value); }} placeholder="Ej: Córdoba" style={{ width: '90%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Teléfono de Contacto</label>
            <input type="text" required value={contactPhone} onChange={function(e) { setContactPhone(e.target.value); }} placeholder="Ej: 351123456" style={{ width: '90%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ gridColumn: '1 / -1', textAlign: 'right', marginTop: '10px' }}>
            <button type="submit" style={{ backgroundColor: '#2e7d32', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
              + Publicar Alerta Urgente
            </button>
          </div>
        </form>
      </section>

      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="Filtrar por Ciudad o Localidad..." 
          value={cityFilter}
          onChange={function(e) { setCityFilter(e.target.value); }}
        />
        
        <select 
          value={bloodFilter} 
          onChange={function(e) { setBloodFilter(e.target.value); }}
        >
          <option value="">Todos los Tipos de Sangre</option>
          <option value="APositivo">A+</option>
          <option value="ANegativo">A-</option>
          <option value="BPositivo">B+</option>
          <option value="BNegativo">B-</option>
          <option value="ABPositivo">AB+</option>
          <option value="ABNegativo">AB-</option>
          <option value="OPositivo">O+</option>
          <option value="ONegativo">O-</option>
        </select>
      </div>

      <h2 style={{ color: '#333', fontSize: '1.3rem', marginBottom: '15px' }}>Alertas Comunitarias Activas</h2>
      <div className="grid">
        {requests.length > 0 ? (
          requests.map(function(req) {
            return (
              <div className="card" key={req.Id || req.id}>
                <div>
                  <div className="card-header">
                    <h3 className="patient-name">{req.PatientName || req.patientName}</h3>
                    <span className="blood-badge">{req.RequiredBloodType || req.requiredBloodType}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Hospital:</strong> {req.HospitalName || req.hospitalName}</p>
                    <p><strong>Ciudad:</strong> {req.City || req.city}</p>
                    <p><strong>Contacto:</strong> {req.ContactPhone || req.contactPhone}</p>
                  </div>
                </div>

                <div>
                  <div className="donor-progress">
                    Donantes: {req.DonorsJoined ?? req.donorsJoined ?? 0} / {req.DonorsNeeded || req.donorsNeeded}
                  </div>
                  <button 
                    className="btn-join"
                    onClick={function() { handleJoin(req.Id || req.id); }}
                  >
                    ♥ Postularse como Donante
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-requests">
            No se encontraron alertas activas que coincidan con los filtros.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

import React from 'react';
import { FileStack } from 'lucide-react'; // Icono opcional para decorar

const GeneralSummaryTable = ({ data }) => {
  if (!data || data.length === 0) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return '#22c55e'; 
    if (score >= 70) return '#f59e0b'; 
    return '#ef4444'; 
  };

  return (
    <div className="animate-fade-in" style={{ marginBottom: '40px', overflowX: 'auto' }}>
      <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px', borderLeft: '4px solid #3b82f6', paddingLeft: '10px' }}>
        Resumen General de Calidad (Matriz)
      </h3>
      
      <div style={{ 
          background: '#1e293b', 
          borderRadius: '12px', 
          border: '1px solid #334155',
          overflow: 'hidden' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#cbd5e1' }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '2px solid #334155', textAlign: 'center' }}>
              <th style={{ padding: '15px', textAlign: 'left', color: '#94a3b8' }}>DESARROLLADOR</th>
              <th style={{ padding: '15px', color: '#fff', background: '#1e293b' }}>REQUERIMIENTOS</th> {/* NUEVA COLUMNA */}
              <th style={{ padding: '15px', color: '#94a3b8' }}>METRICA</th>
              <th style={{ padding: '15px', background: 'rgba(59, 130, 246, 0.1)' }}>P. FUNCIONALES</th>
              <th style={{ padding: '15px' }}>P. INTEGRACIÓN</th>
              <th style={{ padding: '15px', background: 'rgba(59, 130, 246, 0.1)' }}>P. REGRESIÓN</th>
              <th style={{ padding: '15px' }}>P. UNITARIAS</th>
            </tr>
          </thead>
          <tbody>
            {data.map((dev) => (
              <React.Fragment key={dev.id}>
                <tr style={{ borderTop: '1px solid #334155' }}>
                  
                  {/* 1. COLUMNA NOMBRE (Ocupa 3 filas) */}
                  <td rowSpan="3" style={{ 
                      padding: '15px', 
                      fontWeight: 'bold', 
                      color: '#fff', 
                      borderRight: '1px solid #334155',
                      verticalAlign: 'middle',
                      background: '#162032'
                  }}>
                    {dev.name}
                  </td>

                  {/* 2. NUEVA COLUMNA: TOTAL REQUERIMIENTOS (Ocupa 3 filas) */}
                  <td rowSpan="3" style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      fontWeight: 'bold', 
                      color: '#3b82f6', // Color azul para resaltar
                      fontSize: '1.1rem',
                      borderRight: '1px solid #334155',
                      verticalAlign: 'middle',
                      background: '#162032'
                  }}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'}}>
                        <FileStack size={16}/> {dev.total_reqs}
                    </div>
                  </td>

                  {/* 3. METRICAS Y DATOS (Fila 1: TOTAL) */}
                  <td style={{ padding: '8px', textAlign: 'center', color: '#94a3b8', fontWeight: 'bold' }}>Total Casos</td>
                  <td style={{ padding: '8px', textAlign: 'center', background: 'rgba(59, 130, 246, 0.05)' }}>{dev.functional_total}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{dev.integration_total}</td>
                  <td style={{ padding: '8px', textAlign: 'center', background: 'rgba(59, 130, 246, 0.05)' }}>{dev.regression_total}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{dev.unit_total}</td>
                </tr>

                {/* Fila 2: BUGS */}
                <tr>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#ef4444', fontWeight: 'bold' }}>Bugs/Fallos</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: dev.functional_bugs > 0 ? '#ef4444' : '#64748b', background: 'rgba(59, 130, 246, 0.05)' }}>{dev.functional_bugs}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: dev.integration_bugs > 0 ? '#ef4444' : '#64748b' }}>{dev.integration_bugs}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: dev.regression_bugs > 0 ? '#ef4444' : '#64748b', background: 'rgba(59, 130, 246, 0.05)' }}>{dev.regression_bugs}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: dev.unit_bugs > 0 ? '#ef4444' : '#64748b' }}>{dev.unit_bugs}</td>
                </tr>

                {/* Fila 3: % ÉXITO */}
                <tr style={{ borderBottom: '2px solid #334155' }}>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#22c55e', fontWeight: 'bold' }}>% Éxito</td>
                  
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: getScoreColor(dev.functional_pct), background: 'rgba(59, 130, 246, 0.05)' }}>
                    {dev.functional_pct}%
                  </td>
                  
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: getScoreColor(dev.integration_pct) }}>
                    {dev.integration_pct}%
                  </td>
                  
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: getScoreColor(dev.regression_pct), background: 'rgba(59, 130, 246, 0.05)' }}>
                    {dev.regression_pct}%
                  </td>
                  
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: getScoreColor(dev.unit_pct) }}>
                    {dev.unit_pct}%
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeneralSummaryTable;
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const RequirementsTable = ({ requirements }) => {
  if (!requirements || requirements.length === 0) return <p style={{color: '#94a3b8'}}>No hay requerimientos para mostrar.</p>;

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', marginTop: '20px', overflowX: 'auto' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#fff' }}>Detalle de Requerimientos</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
            <th style={{ padding: '10px' }}>Ticket</th>
            <th style={{ padding: '10px' }}>Pruebas Unitarias</th>
            <th style={{ padding: '10px' }}>Bugs QA</th>
            <th style={{ padding: '10px' }}>Rechazos</th>
            <th style={{ padding: '10px' }}>Esfuerzo (Est / Real)</th>
            <th style={{ padding: '10px' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {requirements.map((req) => (
            <tr key={req.id} style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#3b82f6' }}>{req.jira_ticket}</td>
              
              <td style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                   {/* Barra de progreso visual */}
                   <div style={{ width: '50px', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${req.unit_test_success_rate}%`, height: '100%', background: req.unit_test_success_rate > 80 ? '#22c55e' : '#f59e0b' }}></div>
                   </div>
                   <span>{req.unit_test_success_rate}%</span>
                </div>
              </td>

              <td style={{ padding: '12px' }}>
                {req.functional_bugs + req.integration_bugs + req.regression_bugs > 0 ? (
                    <span style={{ color: '#f59e0b' }}>{req.functional_bugs + req.integration_bugs + req.regression_bugs} bugs</span>
                ) : (
                    <span style={{ color: '#94a3b8' }}>0</span>
                )}
              </td>

              <td style={{ padding: '12px', textAlign: 'center' }}>
                 {req.rejection_count > 0 ? <span style={{color: '#ef4444', fontWeight:'bold'}}>{req.rejection_count}</span> : '-'}
              </td>

              <td style={{ padding: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                    <span>E: {req.estimated_effort_hours}h</span>
                    <span style={{ color: req.deviation_hours < 0 ? '#ef4444' : '#22c55e' }}>
                        R: {req.real_effort_hours}h
                    </span>
                </div>
              </td>

              <td style={{ padding: '12px' }}>
                {req.is_qa_approved ? (
                    <span style={{ display: 'flex', alignItems: 'center', color: '#22c55e', gap: '5px' }}><CheckCircle size={16}/> Aprobado</span>
                ) : (
                    <span style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', gap: '5px' }}><AlertTriangle size={16}/> Revisión</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequirementsTable;
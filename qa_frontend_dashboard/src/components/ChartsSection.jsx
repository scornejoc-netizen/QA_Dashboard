import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

// Colores para gráficos
const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'];

const ChartsSection = ({ report }) => {
  if (!report) return null;

  // Datos para gráfico de Bugs (QA vs Prod)
  const bugsData = [
    { name: 'Capturados por QA', value: report.total_bugs_qa },
    { name: 'Escapados a Prod', value: report.total_bugs_prod },
  ];

  // Datos para gráfico de Barras (Tiempo) - Últimos 5 requerimientos para no saturar
  const timeData = report.requerimientos_lista.slice(0, 7).map(req => ({
    name: req.jira_ticket,
    Estimado: parseFloat(req.estimated_effort_hours),
    Real: parseFloat(req.real_effort_hours),
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
      
      {/* GRÁFICO 1: Calidad y DDE */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#94a3b8' }}>Detección de Defectos (DDE)</h3>
        <div style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={bugsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#22c55e" /> {/* QA = Verde */}
                <Cell fill="#ef4444" /> {/* Prod = Rojo */}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ textAlign: 'center', marginTop: '-140px', marginBottom: '100px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{report.dde_score}%</span>
            <br/><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Eficacia QA</span>
        </div>
      </div>

      {/* GRÁFICO 2: Estimación vs Realidad */}
      <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1rem', color: '#94a3b8' }}>Precisión de Estimación (Últimos Tickets)</h3>
        <div style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip cursor={{fill: '#334155', opacity: 0.4}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Legend />
              <Bar dataKey="Estimado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Real" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default ChartsSection;
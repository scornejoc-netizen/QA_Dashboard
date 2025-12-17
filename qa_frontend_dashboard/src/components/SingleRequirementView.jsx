import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts';
import { CheckCircle, AlertTriangle, Clock, Activity, Bug, AlertOctagon } from 'lucide-react';

const SingleRequirementView = ({ req }) => {
  if (!req) return null;

  // --- PREPARACIÓN DE DATOS ---

  // 1. Gráfico Tiempo
  const estimated = parseFloat(req.estimated_effort_hours);
  const real = parseFloat(req.real_effort_hours);
  const timeColor = real > estimated ? '#ef4444' : '#22c55e';
  const timeChartData = [{ name: 'Horas', Estimado: estimated, Real: real }];

  // 2. Gráfico Unitarias
  const unitData = [
    { name: 'Pasadas', value: req.unit_tests_passed },
    { name: 'Fallidas', value: req.unit_tests_failed },
  ];

  // 3. NUEVO: Gráfico Casos vs Bugs (Eficiencia de Pruebas)
  const testingEfficiencyData = [
    { name: 'Funcional', Casos: req.functional_cases, Bugs: req.functional_bugs },
    { name: 'Integración', Casos: req.integration_cases, Bugs: req.integration_bugs },
    { name: 'Regresión', Casos: req.regression_cases, Bugs: req.regression_bugs },
  ];

  // 4. NUEVO: Gráfico Impacto en Producción
  const totalBugsTicket = req.functional_bugs + req.integration_bugs + req.regression_bugs + req.production_bugs;
  const prodBugs = req.production_bugs;
  const qaBugs = totalBugsTicket - prodBugs;

  // Calculamos porcentaje de escape a producción
  const prodPercentage = totalBugsTicket > 0 ? ((prodBugs / totalBugsTicket) * 100).toFixed(1) : 0;

  const prodImpactData = [
    { name: 'Capturados QA', value: qaBugs },
    { name: 'Escapados Prod', value: prodBugs },
  ];

  return (
    <div className="animate-fade-in" style={{ marginTop: '20px', paddingBottom: '40px' }}>
      
      {/* --- ENCABEZADO (Igual que antes) --- */}
      <div style={{ background: '#1e293b', padding: '25px', borderRadius: '12px', marginBottom: '25px', borderLeft: req.is_qa_approved ? '6px solid #22c55e' : '6px solid #f59e0b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#fff', display:'flex', alignItems:'center', gap:'10px' }}>{req.jira_ticket}</h2>
                <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '1rem', maxWidth: '800px' }}>{req.description}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <span style={{ background: req.is_qa_approved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: req.is_qa_approved ? '#22c55e' : '#f59e0b', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px', border: req.is_qa_approved ? '1px solid #22c55e' : '1px solid #f59e0b' }}>
                    {req.is_qa_approved ? <><CheckCircle size={20}/> APROBADO QA</> : <><AlertTriangle size={20}/> EN REVISIÓN</>}
                </span>
            </div>
        </div>

        {/* NÚMEROS CLAROS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', background: '#0f172a', padding: '20px', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>TIEMPO ESTIMADO</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{estimated} h</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #334155', paddingLeft: '20px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>TIEMPO TOMADO</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: timeColor }}>{real} h</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #334155', paddingLeft: '20px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>IMPACTO TIEMPO</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: req.deviation_hours >= 0 ? '#22c55e' : '#ef4444' }}>
                    {req.deviation_hours >= 0 ? `AHORRO: ${parseFloat(req.deviation_hours).toFixed(1)} h` : `RETRASO: ${Math.abs(parseFloat(req.deviation_hours)).toFixed(1)} h`}
                </span>
            </div>
             <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #334155', paddingLeft: '20px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>TOTAL BUGS</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{totalBugsTicket}</span>
            </div>
        </div>
      </div>

      {/* --- SECCIÓN DE GRÁFICOS (4 PANELES) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        {/* 1. COMPARATIVA TIEMPO */}
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#3b82f6"/> Comparativa Horas
            </h3>
            <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeChartData} barSize={50}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={false} />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip cursor={{fill: '#334155', opacity: 0.2}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                        <Legend verticalAlign="top"/>
                        <Bar dataKey="Estimado" fill="#3b82f6" radius={[4, 4, 0, 0]}><LabelList dataKey="Estimado" position="top" fill="#fff" /></Bar>
                        <Bar dataKey="Real" fill={timeColor} radius={[4, 4, 0, 0]}><LabelList dataKey="Real" position="top" fill="#fff" /></Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 2. EFICACIA DE PRUEBAS (CASOS vs BUGS) - EL NUEVO */}
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="#f59e0b"/> Cobertura vs Defectos
            </h3>
            <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={testingEfficiencyData} margin={{top: 20}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip cursor={{fill: '#334155', opacity: 0.2}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                        <Legend verticalAlign="top"/>
                        {/* Casos en Azul Transparente */}
                        <Bar dataKey="Casos" fill="#3b82f6" fillOpacity={0.6} radius={[4, 4, 0, 0]}>
                             <LabelList dataKey="Casos" position="top" fill="#3b82f6" fontSize={10} formatter={(val) => `Casos: ${val}`}/>
                        </Bar>
                        {/* Bugs en Naranja Fuerte */}
                        <Bar dataKey="Bugs" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                             <LabelList dataKey="Bugs" position="top" fill="#f59e0b" fontSize={12} fontWeight="bold"/>
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 3. COBERTURA UNITARIA */}
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
             <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={20} color="#22c55e"/> Pruebas Unitarias
            </h3>
            <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={unitData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                            <Cell fill="#22c55e" />
                            <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Legend verticalAlign="bottom" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>{req.unit_test_success_rate}% Éxito</div>
        </div>

        {/* 4. IMPACTO EN PRODUCCIÓN - EL NUEVO */}
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
             <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertOctagon size={20} color="#ef4444"/> Fugas a Producción
            </h3>
            {totalBugsTicket === 0 ? (
                <div style={{height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#22c55e'}}>
                    <CheckCircle size={48} style={{marginBottom: '10px'}}/>
                    <p>¡Lanzamiento Limpio!</p>
                </div>
            ) : (
                <>
                <div style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={prodImpactData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                <Cell fill="#22c55e" /> {/* Capturados QA */}
                                <Cell fill="#ef4444" /> {/* Escapados Prod */}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                            <Legend verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: prodBugs > 0 ? '#ef4444' : '#22c55e' }}>
                        {prodBugs} Bugs
                    </span>
                    <span style={{ color: '#94a3b8', marginLeft: '10px' }}>({prodPercentage}% del total)</span>
                </div>
                </>
            )}
        </div>

      </div>
    </div>
  );
};

export default SingleRequirementView;
import { useState, useEffect, useRef } from 'react'; // Agregamos useRef
import { getDevelopers, getDeveloperReport, getGeneralSummary } from './services/api';
import SingleRequirementView from './components/SingleRequirementView';
import GeneralSummaryTable from './components/GeneralSummaryTable';
import { User, FileCode, Search, BarChart2, RefreshCw } from 'lucide-react'; // Icono de refresh

function App() {
  // --- ESTADOS ---
  const [developers, setDevelopers] = useState([]);
  const [summaryData, setSummaryData] = useState([]); 
  
  const [selectedDevId, setSelectedDevId] = useState('');
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedReqId, setSelectedReqId] = useState('');
  const [selectedReqData, setSelectedReqData] = useState(null);
  
  // Estado para indicar visualmente que se está actualizando (opcional)
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- LÓGICA DE ACTUALIZACIÓN AUTOMÁTICA (POLLING) ---
  
  // Función maestra de carga de datos
  const fetchAllData = async (isBackgroundRefresh = false) => {
    if (isBackgroundRefresh) setIsRefreshing(true);

    try {
        // 1. Siempre cargamos el Resumen General y la lista de Devs
        const [summary, devs] = await Promise.all([
            getGeneralSummary(),
            getDevelopers()
        ]);
        
        setSummaryData(summary);
        setDevelopers(devs);

        // 2. Si hay un dev seleccionado, recargamos su reporte también
        if (selectedDevId) {
            const devReport = await getDeveloperReport(selectedDevId);
            setReport(devReport);
        }

    } catch (error) {
        console.error("Error actualizando datos:", error);
    } finally {
        if (isBackgroundRefresh) {
            // Pequeño delay para que se note el parpadeo del icono (feedback visual)
            setTimeout(() => setIsRefreshing(false), 500); 
        }
    }
  };

  // EFECTO 1: Carga inicial y configuración del Intervalo
  useEffect(() => {
    // 1. Carga inicial (con loading spinner grande si quisieras)
    setLoading(true);
    fetchAllData().then(() => setLoading(false));

    // 2. Configurar el "Timer" para actualizar cada 5 segundos (5000 ms)
    const intervalId = setInterval(() => {
        fetchAllData(true); // true indica que es una actualización de fondo
    }, 5000); 

    // 3. Limpieza: Si el usuario cierra la pestaña, matamos el timer
    return () => clearInterval(intervalId);
  }, [selectedDevId]); // Se reinicia el timer si cambias de Dev para traer sus datos rápido

  // EFECTO 2: Actualizar la vista del requerimiento específico cuando llega nueva data en 'report'
  useEffect(() => {
    if (selectedReqId && report) {
      const req = report.requerimientos_lista.find(r => r.id === parseInt(selectedReqId));
      // Solo actualizamos si encontramos el requerimiento (por si se borró)
      if (req) setSelectedReqData(req);
    } else {
      setSelectedReqData(null);
    }
  }, [selectedReqId, report]); // Escucha cambios en 'report' (que viene del polling)

  // --- MANEJADORES ---
  const handleDevChange = (e) => {
      const newId = e.target.value;
      setSelectedDevId(newId);
      setSelectedReqId(''); 
      setSelectedReqData(null);
      setReport(null);
      // Al cambiar, el useEffect arriba se disparará y cargará los datos
  };

  // --- RENDERIZADO ---

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', color: '#cbd5e1' }}>
      
      {/* HEADER CON INDICADOR DE ESTADO */}
      <header style={{ marginBottom: '40px', textAlign: 'center', position: 'relative' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#fff' }}>
          <span style={{ color: '#3b82f6' }}>QA</span> Metrics Dashboard
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Sistema de Evaluación de Calidad y Rendimiento
        </p>

        {/* Indicador de "En Vivo" */}
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isRefreshing ? '#3b82f6' : '#64748b' }}>
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Actualizando..." : "Live"}
        </div>
      </header>

      {/* TABLA RESUMEN GENERAL */}
      {summaryData.length > 0 && (
         <GeneralSummaryTable data={summaryData} />
      )}

      {/* FILTROS */}
      <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px', 
          background: '#1e293b', 
          padding: '25px', 
          borderRadius: '12px',
          border: '1px solid #334155',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        
        {/* SELECTOR DESARROLLADOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#3b82f6" /> 1. Selecciona Desarrollador
          </label>
          <select 
            value={selectedDevId} 
            onChange={handleDevChange}
            style={{ 
                width: '100%', height: '45px', fontSize: '1rem', padding: '0 10px', borderRadius: '6px',
                background: '#0f172a', color: '#fff', border: '1px solid #475569'
            }}
          >
            <option value="">-- Seleccionar Miembro del Equipo --</option>
            {developers.map(dev => (
              <option key={dev.id} value={dev.id}>
                {dev.name} ({dev.rol_display})
              </option>
            ))}
          </select>
        </div>

        {/* SELECTOR REQUERIMIENTO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={18} color={!report ? "#64748b" : "#3b82f6"} /> 2. Selecciona Requerimiento
          </label>
          <select 
            value={selectedReqId} 
            onChange={(e) => setSelectedReqId(e.target.value)}
            disabled={!report || report.requerimientos_lista.length === 0}
            style={{ 
                width: '100%', height: '45px', fontSize: '1rem', padding: '0 10px', borderRadius: '6px',
                background: '#0f172a', color: '#fff', border: '1px solid #475569',
                opacity: (!report) ? 0.5 : 1,
                cursor: (!report) ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">
                {(!selectedDevId 
                        ? "Primero selecciona un dev" 
                        : (report?.requerimientos_lista.length === 0 ? "Sin requerimientos" : "-- Ver Detalle de Ticket --")
                      )
                }
            </option>
            {report && report.requerimientos_lista.map(req => (
              <option key={req.id} value={req.id}>
                {req.jira_ticket} | {req.is_qa_approved ? '✅ Aprobado' : '⚠️ Revisión'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <main style={{ marginTop: '30px', minHeight: '400px' }}>
        
        {loading && !report && (
            <div style={{textAlign:'center', padding: '50px', color:'#3b82f6'}}>
                <p>Cargando métricas...</p>
            </div>
        )}

        {/* ESTADO INICIAL */}
        {!selectedDevId && !loading && (
            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '60px' }}>
                <Search size={80} style={{ opacity: 0.1, marginBottom: '20px' }} />
                <p style={{fontSize: '1.2rem'}}>Monitorizando cambios en tiempo real...</p>
            </div>
        )}

        {/* RESUMEN DEV */}
        {selectedDevId && !selectedReqId && report && (
            <div style={{ 
                textAlign: 'center', color: '#94a3b8', marginTop: '40px', 
                border: '2px dashed #334155', borderRadius:'12px', padding:'50px',
                background: 'rgba(30, 41, 59, 0.3)'
            }}>
                <h2 style={{color: '#fff', marginBottom:'10px', fontSize: '1.5rem'}}>Resumen Individual</h2>
                <p>Desarrollador seleccionado con <strong>{report.total_requerimientos} tickets</strong> registrados.</p>
                
                <div style={{display:'flex', justifyContent:'center', gap:'40px', margin:'40px 0'}}>
                    <div style={{textAlign:'center'}}>
                        <div style={{fontSize:'3rem', fontWeight:'bold', color: report.dde_score > 90 ? '#22c55e':'#f59e0b'}}>
                            {report.dde_score}%
                        </div>
                        <div style={{fontSize:'0.9rem', color: '#fff'}}>Calidad en Producción</div>
                    </div>
                    {/* Agrega más métricas aquí si quieres */}
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '10px 20px', borderRadius: '30px' }}>
                    <BarChart2 size={20} />
                    <span>Selecciona un <strong>Requerimiento</strong> arriba para ver gráficos.</span>
                </div>
            </div>
        )}

        {/* VISTA DETALLADA */}
        {selectedReqData && (
            <SingleRequirementView req={selectedReqData} />
        )}

      </main>

        {/* CSS para la animación de rotación del icono de carga */}
        <style>{`
            @keyframes spin { 
                from { transform: rotate(0deg); } 
                to { transform: rotate(360deg); } 
            }
            .animate-spin {
                animation: spin 1s linear infinite;
            }
        `}</style>
    </div>
  );
}

export default App;
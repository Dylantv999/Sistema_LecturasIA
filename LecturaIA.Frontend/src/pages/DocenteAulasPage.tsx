import { alertaError, alertaInformativa } from '../utils/alerts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aulasService, type AulaDetalle } from '../services/aulasService';
import CrearAulaModal from '../components/docente/CrearAulaModal';

export default function DocenteAulasPage() {
  const [aulas, setAulas] = useState<AulaDetalle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [aulaEliminar, setAulaEliminar] = useState<number | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    cargarAulas();
  }, []);

  const cargarAulas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await aulasService.obtenerMisAulas();
      setAulas(data);
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al cargar las aulas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEliminarAula = async (id: number) => {
    try {
      await aulasService.eliminarAula(id);
      setAulaEliminar(null);
      cargarAulas(); // Recargar la lista
    } catch (err: any) {
      alertaError(err.response?.data?.mensaje || 'Error al eliminar el aula');
    }
  };

  const handleIngresarAula = (id: number) => {
    navigate(`/docente/aula/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Mis Aulas de Clases</h1>
              <p className="text-sm font-semibold text-slate-400 mt-0.5">Gestiona tus aulas y realiza el seguimiento de estudiantes</p>
            </div>
            <button
              onClick={() => navigate('/docente')}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition self-start sm:self-center"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>Volver al Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowCrearModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold text-sm shadow-md shadow-emerald-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Crear Nueva Aula</span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-slate-100 shadow-3xs">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-3"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Cargando aulas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-3 text-red-800">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-sm">{error}</span>
            </div>
          </div>
        ) : aulas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-16 text-center max-w-xl mx-auto">
            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-3xs">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">No tienes aulas creadas</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Crea tu primera aula de clases para comenzar a gestionar tus lecturas y estudiantes.</p>
            <button
              onClick={() => setShowCrearModal(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold text-sm shadow-md shadow-emerald-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Crear Primera Aula</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aulas.map((aula) => (
              <div key={aula.id} className="bg-white rounded-3xl shadow-2xs border border-slate-100 hover:shadow-xs hover:translate-y-[-2px] transition-all duration-200 overflow-hidden flex flex-col justify-between">
                {/* Header de la card */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-5">
                  <h3 className="text-lg font-black tracking-tight truncate mb-1">{aula.nombre}</h3>
                  <p className="text-emerald-100/90 text-xs font-semibold line-clamp-2 h-8 leading-relaxed">
                    {aula.descripcion || 'Sin descripción detallada asignada.'}
                  </p>
                </div>

                {/* Contenido */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Código de vinculación */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Código de Vinculación</label>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xl font-mono font-black text-slate-800 tracking-wider">{aula.codigoVinculacion}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aula.codigoVinculacion);
                          alertaInformativa('¡Código copiado al portapapeles!');
                        }}
                        className="p-1.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition shadow-3xs"
                        title="Copiar código"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3 font-semibold text-slate-700">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-black text-slate-800">{aula.cantidadEstudiantes}</span>
                      <span className="text-slate-400 text-xs font-bold">Estudiantes</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Creada</span>
                      <span className="text-slate-600 font-bold text-xs">
                        {new Date(aula.fechaCreacion).toLocaleDateString('es-PE', { 
                          day: '2-digit', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => handleIngresarAula(aula.id)}
                      className="flex-1 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition font-bold text-xs flex items-center justify-center space-x-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Ingresar Aula</span>
                    </button>
                    <button
                      onClick={() => setAulaEliminar(aula.id)}
                      className="px-3 py-2.5 bg-slate-50 text-slate-400 border border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl transition"
                      title="Eliminar aula"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear aula */}
      <CrearAulaModal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onAulaCreada={cargarAulas}
      />

      {/* Modal de confirmación de eliminación */}
      {aulaEliminar !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex items-start space-x-3.5 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900">Confirmar eliminación</h3>
                <p className="text-sm font-semibold text-slate-400 mt-0.5">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar esta aula? Todos los estudiantes vinculados serán removidos de la lista de clases de inmediato.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setAulaEliminar(null)}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminarAula(aulaEliminar)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold text-xs shadow-sm transition"
              >
                Eliminar Aula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
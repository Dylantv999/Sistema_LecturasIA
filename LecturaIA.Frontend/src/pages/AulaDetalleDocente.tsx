import { alertaError, alertaInformativa } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { aulasService, type AulaDetalle, type EstudianteAula } from '../services/aulasService';
import MetricasEstudianteModal from '../components/MetricasEstudianteModal';
import MetricasSalonModal from '../components/MetricasSalonModal';
import ListaExamenesAula from '../components/docente/ListaExamenesAula';
import { AlertCircle, ArrowLeft, Copy, BarChart2, FilePlus, Users, FileText, User, LineChart, UserMinus, AlertTriangle } from 'lucide-react';

export default function AulaDetalleDocente() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [aula, setAula] = useState<AulaDetalle | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteAula[]>([]);
  const [isLoadingAula, setIsLoadingAula] = useState(true);
  const [isLoadingEstudiantes, setIsLoadingEstudiantes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estudianteAEliminar, setEstudianteAEliminar] = useState<EstudianteAula | null>(null);
  const [tabActiva, setTabActiva] = useState<'estudiantes' | 'examenes'>('estudiantes');
  
  // Estados para los modales de métricas
  const [showMetricasEstudiante, setShowMetricasEstudiante] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<{ id: number; nombre: string } | null>(null);
  const [showMetricasSalon, setShowMetricasSalon] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDatosAula();
    }
  }, [id]);

  const cargarDatosAula = async () => {
    try {
      setIsLoadingAula(true);
      setIsLoadingEstudiantes(true);
      setError(null);

      const aulaId = parseInt(id!);
      
      // Cargar datos del aula
      const aulaData = await aulasService.obtenerAula(aulaId);
      setAula(aulaData);

      // Cargar estudiantes del aula
      const estudiantesData = await aulasService.obtenerEstudiantesAula(aulaId);
      setEstudiantes(estudiantesData);
    } catch (err: any) {
      console.error('Error al cargar aula:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar los datos del aula');
    } finally {
      setIsLoadingAula(false);
      setIsLoadingEstudiantes(false);
    }
  };

  const handleRemoverEstudiante = async (estudiante: EstudianteAula) => {
    try {
      const aulaId = parseInt(id!);
      await aulasService.removerEstudiante(aulaId, estudiante.estudianteId);
      
      // Recargar lista de estudiantes
      cargarDatosAula();
      setEstudianteAEliminar(null);
    } catch (err: any) {
      alertaError('Error al remover estudiante: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  const copiarCodigo = async (codigo: string) => {
    try {
      // Intentar usar la API moderna del portapapeles
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(codigo);
      } else {
        // Fallback para navegadores más antiguos o sin permisos
        const textarea = document.createElement('textarea');
        textarea.value = codigo;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      alertaInformativa(`Código ${codigo} copiado`);
    } catch (error) {
      console.error('Error al copiar:', error);
      // Fallback si todo falla
      const textarea = document.createElement('textarea');
      textarea.value = codigo;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alertaInformativa(`Código ${codigo} copiado`);
    }
  };

  if (isLoadingAula) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !aula) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-center space-x-3 text-rose-800">
              <AlertCircle className="w-6 h-6 text-rose-600" />
              <span className="font-bold">{error || 'Aula no encontrada'}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/docente/dashboard')}
            className="mt-4 px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition shadow-sm"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/docente/dashboard')}
                className="p-2.5 hover:bg-white/10 rounded-xl transition border border-transparent hover:border-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{aula.nombre}</h1>
                {aula.descripcion && (
                  <p className="text-emerald-100/90 text-sm font-semibold mt-0.5 line-clamp-1">{aula.descripcion}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card: Código de Vinculación */}
          <div className="bg-white rounded-2xl shadow-2xs border border-slate-100 p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Código de Vinculación</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-mono font-black text-slate-800 tracking-wider">{aula.codigoVinculacion}</span>
                <button
                  onClick={() => copiarCodigo(aula.codigoVinculacion)}
                  className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition shadow-3xs"
                  title="Copiar código"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-3 border-t border-slate-50 pt-2">Comparte este código con tus estudiantes</p>
          </div>

          {/* Card: Total Estudiantes */}
          <div className="bg-white rounded-2xl shadow-2xs border border-slate-100 p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Estudiantes</h3>
              <div className="text-4xl font-black text-emerald-600 mt-1">{aula.cantidadEstudiantes}</div>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-3 border-t border-slate-50 pt-2">Alumnos activos inscritos en la sección</p>
          </div>

          {/* Card: Fecha Creación */}
          <div className="bg-white rounded-2xl shadow-2xs border border-slate-100 p-5 flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha de Creación</h3>
              <div className="text-lg font-bold text-slate-800 mt-2">
                {new Date(aula.fechaCreacion).toLocaleDateString('es-PE', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric'
                })}
              </div>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-3 border-t border-slate-50 pt-2">Fecha de alta del entorno virtual</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setShowMetricasSalon(true)}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition shadow-sm font-bold text-xs flex items-center justify-center space-x-2"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Ver Métricas del Salón</span>
          </button>
          
          <button
            onClick={() => navigate(`/docente/aula/${id}/examen/crear`)}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition shadow-sm font-bold text-xs flex items-center justify-center space-x-2"
          >
            <FilePlus className="w-4 h-4" />
            <span>Crear Examen Grupal</span>
          </button>
        </div>

        {/* Pestañas */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setTabActiva('estudiantes')}
              className={`${
                tabActiva === 'estudiantes'
                  ? 'border-emerald-600 text-emerald-600 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300 font-bold'
              } whitespace-nowrap py-3.5 px-1 border-b-2 text-xs uppercase tracking-wider flex items-center space-x-2 transition`}
            >
              <Users className="w-4 h-4" />
              <span>Estudiantes ({estudiantes.length})</span>
            </button>
            
            <button
              onClick={() => setTabActiva('examenes')}
              className={`${
                tabActiva === 'examenes'
                  ? 'border-emerald-600 text-emerald-600 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300 font-bold'
              } whitespace-nowrap py-3.5 px-1 border-b-2 text-xs uppercase tracking-wider flex items-center space-x-2 transition`}
            >
              <FileText className="w-4 h-4" />
              <span>Exámenes</span>
            </button>
          </nav>
        </div>

        {/* Contenido según pestaña */}
        {tabActiva === 'examenes' ? (
          <ListaExamenesAula aulaId={parseInt(id!)} />
        ) : (
          /* Lista de Estudiantes */
          <div className="bg-white rounded-2xl shadow-2xs border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <h2 className="text-base font-black text-slate-800">Estudiantes del Aula</h2>
            </div>

            {isLoadingEstudiantes ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
              </div>
            ) : estudiantes.length === 0 ? (
              <div className="p-16 text-center max-w-md mx-auto">
                <div className="bg-emerald-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-3xs">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1">No hay alumnos aún</h3>
                <p className="text-slate-500 text-sm">
                  Comparte el código de vinculación <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">{aula.codigoVinculacion}</span> con tus estudiantes para matricularlos.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/40 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="px-6 py-3.5">Nombre Completo</th>
                      <th className="px-6 py-3.5">Email</th>
                      <th className="px-6 py-3.5">Grado</th>
                      <th className="px-6 py-3.5">Fecha Vinculación</th>
                      <th className="px-6 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 text-sm font-semibold">
                    {estudiantes.map((estudiante) => (
                      <tr key={estudiante.estudianteId} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-9 w-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
                              <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="ml-3.5">
                              <div className="text-sm font-bold text-slate-800">{estudiante.nombreCompleto}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-slate-500 font-medium">
                          {estudiante.email}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
                            {estudiante.grado || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-slate-400 text-xs">
                          {new Date(estudiante.fechaVinculacion).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setEstudianteSeleccionado({
                                  id: estudiante.estudianteId,
                                  nombre: estudiante.nombreCompleto
                                });
                                setShowMetricasEstudiante(true);
                              }}
                              className="text-emerald-600 hover:text-emerald-700 p-2 bg-white hover:bg-emerald-50 border border-transparent hover:border-emerald-100 rounded-xl transition shadow-3xs"
                              title="Ver métricas"
                            >
                              <LineChart className="w-4 h-4" />
                            </button>
                            {/* Botón Remover */}
                            <button
                              onClick={() => setEstudianteAEliminar(estudiante)}
                              className="text-slate-400 hover:text-rose-600 p-2 bg-white hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition shadow-3xs"
                              title="Remover estudiante"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación de estudiante */}
      {estudianteAEliminar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex items-start space-x-3.5 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900">Remover Estudiante</h3>
                <p className="text-sm font-semibold text-slate-400 mt-0.5">Esta acción desvinculará al estudiante</p>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-2 leading-relaxed">
              ¿Estás seguro de que deseas remover a <strong>{estudianteAEliminar.nombreCompleto}</strong> de esta aula?
            </p>
            <p className="text-slate-400 text-xs mb-6">
              El estudiante perderá acceso provisional, pero podrá volver a unirse de inmediato usando el código de vinculación oficial.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEstudianteAEliminar(null)}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRemoverEstudiante(estudianteAEliminar)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold text-xs shadow-sm transition"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Métricas del Estudiante */}
      {estudianteSeleccionado && (
        <MetricasEstudianteModal
          estudianteId={estudianteSeleccionado.id}
          nombreEstudiante={estudianteSeleccionado.nombre}
          isOpen={showMetricasEstudiante}
          onClose={() => {
            setShowMetricasEstudiante(false);
            setEstudianteSeleccionado(null);
          }}
        />
      )}

      {/* Modal de Métricas del Salón */}
      {aula && (
        <MetricasSalonModal
          aulaId={aula.id}
          nombreAula={aula.nombre}
          isOpen={showMetricasSalon}
          onClose={() => setShowMetricasSalon(false)}
        />
      )}
    </div>
  );
}
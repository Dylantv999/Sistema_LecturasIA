import { alertaError, alertaInformativa, confirmacionEliminar } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CambiarPasswordModal from '../components/CambiarPasswordModal';
import CrearAulaModal from '../components/docente/CrearAulaModal';
import AyudaContextual from '../components/AyudaContextual';
import TutorialInicial from '../components/TutorialInicial';
import { aulasService, type AulaDetalle } from '../services/aulasService';
import { contenidoAyuda, tutorialDocente } from '../data/contenidoAyuda';
import { BookOpen, ChevronDown, Key, LogOut, Plus, Library, Copy, LogIn, Trash2, User, AlertCircle } from 'lucide-react';

type TabType = 'aulas' | 'perfil';

export default function DocenteDashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCrearAulaModal, setShowCrearAulaModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('aulas');
  const [aulas, setAulas] = useState<AulaDetalle[]>([]);
  const [isLoadingAulas, setIsLoadingAulas] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aulaAEliminar, setAulaAEliminar] = useState<AulaDetalle | null>(null);
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [cargandoTutorial, setCargandoTutorial] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      navigate('/docente');
      return;
    }

    if (user.tipoUsuario !== 'Docente') {
      navigate('/');
      return;
    }

    verificarPrimeraSesion();
    cargarAulas();
  }, [user, isAuthenticated, authLoading, navigate]);

  const verificarPrimeraSesion = () => { setCargandoTutorial(false); };

  const cargarAulas = async () => {
    try {
      setIsLoadingAulas(true);
      setError(null);
      const data = await aulasService.obtenerMisAulas();
      setAulas(data);
    } catch (err: any) {
      console.error('Error al cargar aulas:', err);
      setError('Error al cargar las aulas');
    } finally {
      setIsLoadingAulas(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/docente');
  };

  const handleAulaCreada = () => {
    cargarAulas();
    setShowCrearAulaModal(false);
  };

  const handleIngresarAula = (id: number) => {
    navigate(`/docente/aula/${id}`);
  };

  const handleEliminarAula = async (aula: AulaDetalle) => {
    if (!(await confirmacionEliminar(`¿Estás seguro de eliminar el aula "${aula.nombre}"?\n\nTodos los estudiantes serán desvinculados.`))) {
      return;
    }

    try {
      await aulasService.eliminarAula(aula.id);
      cargarAulas();
    } catch (err: any) {
      alertaError('Error al eliminar el aula: ' + (err.response?.data?.mensaje || err.message));
    }
  };

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    alertaInformativa(`Código ${codigo} copiado al portapapeles`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <div className="text-lg font-medium text-gray-600">Cargando sesión...</div>
      </div>
    );
  }

  if (!user || user.tipoUsuario !== 'Docente') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-emerald-100" />
              <h1 className="text-2xl font-bold tracking-tight">LecturaIA <span className="text-emerald-200 text-lg font-normal">| Docente</span></h1>
            </div>
            
            {/* Menú de usuario */}
            <div className="relative tour-resumen-metricas">
              <button
                onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                className="flex items-center space-x-2 bg-emerald-700/50 hover:bg-emerald-700/80 px-4 py-2 rounded-xl transition backdrop-blur-sm border border-emerald-500/30"
              >
                <div className="w-6 h-6 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                  {user.nombreCompleto.charAt(0)}
                </div>
                <span className="font-medium text-sm hidden sm:inline">{user.nombreCompleto}</span>
                <ChevronDown className="w-4 h-4 text-emerald-200" />
              </button>

              {/* Dropdown Menu */}
              {showMenuDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Identificado como</p>
                    <p className="text-sm font-semibold text-gray-700 truncate">{user.nombreCompleto}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMenuDropdown(false);
                      setShowPasswordModal(true);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition"
                  >
                    <Key className="w-4 h-4 text-gray-400" />
                    <span>Cambiar Contraseña</span>
                  </button>
                  <hr className="border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span className="font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Área de trabajo del docente */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header con tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
            <p className="text-gray-500 text-sm mt-0.5">Gestiona tus aulas y realiza el seguimiento de comprensión lectora.</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto tour-mis-aulas">
            <button
              onClick={() => setActiveTab('aulas')}
              className={`flex-1 sm:flex-initial py-2 px-5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'aulas'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              Mis Aulas
            </button>
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex-1 sm:flex-initial py-2 px-5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'perfil'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              Mi Perfil
            </button>
          </div>
        </div>

        {/* Contenido de las tabs */}
        {activeTab === 'aulas' && (
          <div className="space-y-6">
            {/* Botón Crear Aula */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-700">Aulas Activas</h3>
              <button
                onClick={() => setShowCrearAulaModal(true)}
                className="tour-crear-aula flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition shadow-sm font-semibold text-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Nueva Aula</span>
              </button>
            </div>

            {/* Contenido de aulas */}
            {isLoadingAulas ? (
              <div className="flex flex-col justify-center items-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-3"></div>
                <p className="text-gray-500 font-medium text-sm">Cargando tus aulas...</p>
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <div className="flex items-center space-x-3 text-rose-800">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span className="font-semibold text-sm">{error}</span>
                </div>
              </div>
            ) : aulas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center max-w-xl mx-auto">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100 shadow-sm">
                  <Library className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No tienes aulas creadas</h3>
                <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">Comienza creando tu primera aula virtual para invitar a tus alumnos.</p>
                <button
                  onClick={() => setShowCrearAulaModal(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold text-sm shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span>Crear Primera Aula</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aulas.map((aula) => (
                  <div key={aula.id} className="bg-white rounded-2xl border-2 border-slate-100 hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">
                    {/* Header de la card */}
                    <div className="bg-slate-50 border-b border-slate-100 p-5 group-hover:bg-emerald-50/50 transition-colors">
                      <h3 className="text-lg font-black text-slate-800 truncate mb-1">{aula.nombre}</h3>
                      <p className="text-slate-500 text-xs line-clamp-2 h-8 font-medium">
                        {aula.descripcion || 'Sin descripción asignada.'}
                      </p>
                    </div>

                    {/* Contenido */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      {/* Código de vinculación */}
                      <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Código de Ingreso</label>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xl font-mono font-bold text-gray-800 tracking-wider">{aula.codigoVinculacion}</span>
                          <button
                            onClick={() => copiarCodigo(aula.codigoVinculacion)}
                            className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-emerald-600 hover:border-emerald-200 transition shadow-sm"
                            title="Copiar código"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Estadísticas */}
                      <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="font-semibold text-gray-700">{aula.cantidadEstudiantes}</span>
                          <span className="text-gray-400 text-xs">Alumnos</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-400 text-xs block">Creada el</span>
                          <span className="font-medium text-gray-600 text-xs">
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
                          className="flex-1 px-4 py-2.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl transition font-bold text-xs flex items-center justify-center space-x-2 shadow-sm"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Ingresar al Panel</span>
                        </button>
                        <button
                          onClick={() => setAulaAEliminar(aula)}
                          className="px-3 py-2.5 bg-white border-2 border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-xl transition"
                          title="Eliminar aula"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-4xl">
            <div className="max-w-2xl">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
                <User className="w-5 h-5 text-emerald-600" />
                <span>Información Personal</span>
              </h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre Completo</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold text-sm">
                      {user?.nombreCompleto}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium text-sm truncate">
                      {user?.email}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tipo de Rol</label>
                  <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Docente Verificado</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-6 border-t border-slate-100 mt-6">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Seguridad y Cuenta</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="flex items-center justify-between bg-white border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/20 px-4 py-3 rounded-xl transition text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <Key className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
                        <span className="text-slate-700 font-semibold text-sm">Cambiar Contraseña</span>
                      </div>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-between bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/30 px-4 py-3 rounded-xl transition text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition" />
                        <span className="text-slate-700 font-semibold text-sm group-hover:text-red-600 transition">Cerrar Sesión</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cambiar Contraseña */}
      <CambiarPasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />

      {/* Modal Crear Aula */}
      <CrearAulaModal
        isOpen={showCrearAulaModal}
        onClose={() => setShowCrearAulaModal(false)}
        onAulaCreada={handleAulaCreada}
      />

      {/* Modal de confirmación de eliminación */}
      {aulaAEliminar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100">
            <div className="flex items-start space-x-3.5 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900">Eliminar aula permanente</h3>
                <p className="text-sm font-semibold text-slate-500 mt-0.5">Esta acción desvinculará a los estudiantes vinculados.</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 mb-6 text-sm text-gray-700">
              ¿Confirmas la eliminación definitiva del aula <strong>{aulaAEliminar.nombre}</strong>?
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setAulaAEliminar(null)}
                className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 font-semibold text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleEliminarAula(aulaAEliminar);
                  setAulaAEliminar(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold text-xs shadow-sm transition"
              >
                Eliminar Aula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ayuda Contextual */}
      {!cargandoTutorial && !mostrarTutorial && (
        <AyudaContextual
          pantalla="Dashboard Docente"
          contenido={contenidoAyuda.docenteDashboard}
          onVerTutorial={() => setMostrarTutorial(true)}
        />
      )}

      {/* Tutorial Inicial */}
      {mostrarTutorial && (
        <TutorialInicial
          pasos={tutorialDocente}
          onCompletar={() => setMostrarTutorial(false)}
          onOmitir={() => setMostrarTutorial(false)}
          tipoUsuario="Docente"
        />
      )}
    </div>
  );
}
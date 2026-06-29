import { alertaError, alertaInformativa, confirmacionEliminar } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CambiarPasswordModal from '../components/CambiarPasswordModal';
import MiPerfilModal from '../components/MiPerfilModal';
import MiClaseModal from '../components/MiClaseModal';
import EncuestaGuiadaModal, { type PreferenciasLectura } from '../components/EncuestaGuiadaModal';
import VistaPreviaPreferenciasModal from '../components/VistaPreviaPreferenciasModal';
import AyudaContextual from '../components/AyudaContextual';
import TutorialInicial from '../components/TutorialInicial';
import { lecturaService, type LecturaLista } from '../services/lecturaService';
import { contenidoAyuda, tutorialEstudiante } from '../data/contenidoAyuda';
import { ROLES } from '../config/constants';
import LecturasList from '../components/dashboard/LecturasList';
import LecturasFilter from '../components/dashboard/LecturasFilter';

type TabType = 'lista' | 'favoritas';

export default function EstudianteDashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showClaseModal, setShowClaseModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('lista');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterNivel, setFilterNivel] = useState('todos');
  const navigate = useNavigate();

  // Estados para la encuesta y generación de lecturas
  const [showEncuesta, setShowEncuesta] = useState(false);
  const [showVistaPrevia, setShowVistaPrevia] = useState(false);
  const [preferenciasActuales, setPreferenciasActuales] = useState<PreferenciasLectura | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Lecturas del estudiante
  const [lecturas, setLecturas] = useState<LecturaLista[]>([]);
  const [isLoadingLecturas, setIsLoadingLecturas] = useState(true);

  // Estados para tutorial y ayuda
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [cargandoTutorial, setCargandoTutorial] = useState(true);

  // Cargar lecturas y verificar sesión
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      navigate('/estudiante');
      return;
    }

    if (user.tipoUsuario !== ROLES.ESTUDIANTE) {
      navigate('/');
      return;
    }

    cargarLecturas();
    setCargandoTutorial(false);
  }, [user, isAuthenticated, authLoading, navigate]);

  // Recargar lecturas en foco/visibilidad
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        cargarLecturas();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', cargarLecturas);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', cargarLecturas);
    };
  }, [isAuthenticated]);

  const cargarLecturas = async () => {
    try {
      setIsLoadingLecturas(true);
      const lecturasData = await lecturaService.obtenerLecturas();
      if (Array.isArray(lecturasData)) {
        setLecturas(lecturasData);
      } else {
        console.error('Datos de lecturas inválidos:', lecturasData);
        setLecturas([]);
      }
    } catch (error) {
      console.error('Error al cargar lecturas:', error);
      setLecturas([]);
    } finally {
      setIsLoadingLecturas(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/estudiante');
  };

  const handleGenerarLectura = () => {
    setShowEncuesta(true);
  };

  const handleEncuestaComplete = (preferencias: PreferenciasLectura) => {
    setPreferenciasActuales(preferencias);
    setShowEncuesta(false);
    setShowVistaPrevia(true);
  };

  const handleGenerarLecturaConIA = async () => {
    if (!preferenciasActuales) return;

    try {
      setIsGenerating(true);
      const lecturaGenerada = await lecturaService.generarLectura(preferenciasActuales);
      setShowVistaPrevia(false);
      setPreferenciasActuales(null);
      setIsGenerating(false);
      await cargarLecturas();
      navigate(`/estudiante/lectura/${lecturaGenerada.id}`);
    } catch (error: any) {
      setIsGenerating(false);
      alertaError(error.message || 'Error al generar la lectura');
    }
  };

  const handleEliminarLectura = async (id: number) => {
    if ((await confirmacionEliminar('¿Estás seguro de eliminar esta lectura?'))) {
      try {
        await lecturaService.eliminarLectura(id);
        await cargarLecturas();
        alertaInformativa('Lectura eliminada exitosamente');
      } catch (error: any) {
        console.error('Error al eliminar lectura:', error);
        alertaError(`Error al eliminar la lectura: ${error.message}`);
      }
    }
  };

  const handleToggleFavorita = async (id: number, esFavorita: boolean) => {
    try {
      await lecturaService.toggleFavorita(id, !esFavorita);
      await cargarLecturas();
    } catch (error: any) {
      alertaError(`Error al actualizar favorita: ${error.message}`);
    }
  };

  const handleComenzarLectura = (id: number) => {
    navigate(`/estudiante/leer/${id}`);
  };

  const lecturasFiltradas = Array.isArray(lecturas) ? lecturas.filter(lectura => {
    const matchSearch = lectura.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === 'todos' || lectura.tipoLectura === filterTipo;
    const matchLongitud = filterNivel === 'todos' || lectura.longitud === filterNivel;
    const matchTab = activeTab === 'lista' || (activeTab === 'favoritas' && lectura.esFavorita);
    return matchSearch && matchTipo && matchLongitud && matchTab;
  }) : [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-sky-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-sky-800">Cargando sesión...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-sky-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-sky-950 mb-2">No se detectó un usuario activo</h3>
          <p className="text-sky-800 mb-6">Redirigiendo de manera segura al inicio de sesión.</p>
          <button onClick={() => navigate('/estudiante')} className="w-full px-6 py-3 bg-sky-600 text-white rounded-full font-semibold hover:bg-sky-700 transition shadow-md shadow-sky-100">
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const userRole = user.tipoUsuario || '';

  if (userRole !== 'Estudiante') {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-sky-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-8v6m0-6H6.343l-.707-.707m12.728 0l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-red-600 mb-2">Acceso Denegado</h2>
          <p className="text-sky-900 mb-2 font-medium">Hola, {user.nombreCompleto}</p>
          <p className="text-sky-800 text-sm mb-6">Esta sección requiere rol de estudiante. Actualmente tienes asignado: <span className="font-semibold text-red-500">{userRole}</span></p>
          <button onClick={handleLogout} className="w-full px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition shadow-md shadow-red-100">
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50/50">
      {/* Navbar con gradiente Celeste refinado */}
      <nav className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-2 rounded-xl">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl font-black tracking-tight">Lectura<span className="text-sky-100 font-light">IA</span></h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Botón Mis Exámenes - Ajustado a paleta complementaria suave */}
              <button
                onClick={() => navigate('/estudiante/examenes')}
                className="flex items-center space-x-2 bg-indigo-600/90 hover:bg-indigo-600 px-5 py-2.5 rounded-full font-semibold text-sm transition shadow-md shadow-indigo-700/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Mis Exámenes</span>
              </button>

              {/* Menú de usuario */}
              <div className="relative">
                <button
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-full text-sm font-medium transition backdrop-blur-sm border border-white/10"
                >
                  <div className="w-6 h-6 bg-sky-200 text-sky-800 rounded-full flex items-center justify-center text-xs font-bold">
                    {user.nombreCompleto?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.nombreCompleto}</span>
                  <svg className="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showMenuDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl py-2 z-50 border border-sky-50 text-gray-700 overflow-hidden transform origin-top-right transition-all">
                    <div className="px-4 py-2 border-b border-gray-50 bg-sky-50/30">
                      <p className="text-xs text-sky-600 font-bold tracking-wider uppercase">Estudiante</p>
                    </div>
                    <button
                      onClick={() => { setShowMenuDropdown(false); setShowPerfilModal(true); }}
                      className="w-full text-left px-4 py-3 hover:bg-sky-50/50 flex items-center space-x-3 text-sm font-medium transition"
                    >
                      <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Ver Perfil</span>
                    </button>
                    <button
                      onClick={() => { setShowMenuDropdown(false); setShowClaseModal(true); }}
                      className="w-full text-left px-4 py-3 hover:bg-sky-50/50 flex items-center space-x-3 text-sm font-medium transition"
                    >
                      <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>Mi Clase</span>
                    </button>
                    <hr className="border-gray-100" />
                    <button
                      onClick={() => { setShowMenuDropdown(false); setShowPasswordModal(true); }}
                      className="w-full text-left px-4 py-3 hover:bg-sky-50/50 flex items-center space-x-3 text-sm font-medium transition"
                    >
                      <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span>Cambiar Contraseña</span>
                    </button>
                    <hr className="border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 bg-red-50/30 hover:bg-red-50 text-red-600 flex items-center space-x-3 text-sm font-bold transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Área de trabajo centralizada */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Contenedor Principal de Navegación del Dashboard */}
        <div className="bg-white rounded-3xl shadow-sm border border-sky-100/80 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-sky-950 tracking-tight">Área de Trabajo</h2>
          </div>

          {/* Diseño Moderno de Enfoque de Pestañas (Tabs) */}
          <div className="flex space-x-2 bg-sky-50/60 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('lista')}
              className={`py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'lista'
                  ? 'bg-white text-sky-600 shadow-sm shadow-sky-100/50'
                  : 'text-sky-800 hover:text-sky-600 hover:bg-white/50'
                }`}
            >
              Lista de Lecturas
            </button>
            <button
              onClick={() => setActiveTab('favoritas')}
              className={`py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 ${activeTab === 'favoritas'
                  ? 'bg-white text-sky-600 shadow-sm shadow-sky-100/50'
                  : 'text-sky-800 hover:text-sky-600 hover:bg-white/50'
                }`}
            >
              Lecturas Favoritas
            </button>
          </div>
        </div>

        {/* Contenido Dinámico de las Pestañas */}
        <div className="space-y-6">
          {activeTab === 'lista' ? (
            <>
              <LecturasFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterTipo={filterTipo}
                setFilterTipo={setFilterTipo}
                filterNivel={filterNivel}
                setFilterNivel={setFilterNivel}
                onGenerarLectura={handleGenerarLectura}
              />

              <LecturasList
                activeTab={activeTab}
                lecturas={lecturasFiltradas}
                isLoading={isLoadingLecturas}
                onEliminarLectura={handleEliminarLectura}
                onToggleFavorita={handleToggleFavorita}
                onComenzarLectura={handleComenzarLectura}
              />
            </>
          ) : (
            <LecturasList
              activeTab={activeTab}
              lecturas={lecturasFiltradas}
              isLoading={isLoadingLecturas}
              onEliminarLectura={handleEliminarLectura}
              onToggleFavorita={handleToggleFavorita}
              onComenzarLectura={handleComenzarLectura}
            />
          )}
        </div>
      </div>

      {/* Modales */}
      <CambiarPasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
      <MiPerfilModal isOpen={showPerfilModal} onClose={() => setShowPerfilModal(false)} />
      <MiClaseModal isOpen={showClaseModal} onClose={() => setShowClaseModal(false)} />

      <EncuestaGuiadaModal
        isOpen={showEncuesta}
        onClose={() => setShowEncuesta(false)}
        onComplete={handleEncuestaComplete}
      />

      {preferenciasActuales && (
        <VistaPreviaPreferenciasModal
          isOpen={showVistaPrevia}
          preferencias={preferenciasActuales}
          onClose={() => {
            setShowVistaPrevia(false);
            setPreferenciasActuales(null);
          }}
          onGenerarLectura={handleGenerarLecturaConIA}
          isGenerating={isGenerating}
        />
      )}

      {/* Ayuda y Tutoriales */}
      {!cargandoTutorial && !mostrarTutorial && contenidoAyuda?.estudianteDashboard && (
        <AyudaContextual
          pantalla="Dashboard Estudiante"
          contenido={contenidoAyuda.estudianteDashboard}
          onVerTutorial={() => setMostrarTutorial(true)}
        />
      )}

      {mostrarTutorial && tutorialEstudiante && (
        <TutorialInicial
          pasos={tutorialEstudiante}
          onCompletar={() => setMostrarTutorial(false)}
          onOmitir={() => setMostrarTutorial(false)}
          tipoUsuario="Estudiante"
        />
      )}
    </div>
  );
}
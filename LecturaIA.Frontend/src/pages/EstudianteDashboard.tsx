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
import { motion } from 'framer-motion';
import { Sparkles, Coins, Flame, Star, Trophy, BookOpen, Settings, LogOut, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

  // Estados Gamificación
  const [xp, setXp] = useState(0);
  const [monedas, setMonedas] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [racha, setRacha] = useState(1);

  useEffect(() => {
    if (user) {
      const storedData = localStorage.getItem(`gamification_${user.id}`);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setXp(parsed.xp || 1250);
        setMonedas(parsed.monedas || 300);
        setNivel(parsed.nivel || 5);
        setRacha(parsed.racha || 3);
      } else {
        const defaultData = { xp: 1250, monedas: 300, nivel: 5, racha: 3 };
        localStorage.setItem(`gamification_${user.id}`, JSON.stringify(defaultData));
        setXp(defaultData.xp);
        setMonedas(defaultData.monedas);
        setNivel(defaultData.nivel);
        setRacha(defaultData.racha);
      }
    }
  }, [user]);

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
    if (!isAuthenticated || !user) { navigate('/estudiante'); return; }
    if (user.tipoUsuario !== ROLES.ESTUDIANTE) { navigate('/'); return; }
    cargarLecturas();
    setCargandoTutorial(false);
  }, [user, isAuthenticated, authLoading, navigate]);

  // Recargar lecturas en foco/visibilidad
  useEffect(() => {
    const handleVisibilityChange = () => { if (!document.hidden && isAuthenticated) { cargarLecturas(); } };
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
      if (Array.isArray(lecturasData)) setLecturas(lecturasData);
      else setLecturas([]);
    } catch (error) {
      console.error('Error al cargar lecturas:', error);
      setLecturas([]);
    } finally {
      setIsLoadingLecturas(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/estudiante'); };
  const handleGenerarLectura = () => { setShowEncuesta(true); };
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
      navigate(`/estudiante/leer/${lecturaGenerada.id}`);
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

  const handleComenzarLectura = (id: number) => { navigate(`/estudiante/leer/${id}`); };

  const lecturasFiltradas = Array.isArray(lecturas) ? lecturas.filter(lectura => {
    const matchSearch = lectura.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = filterTipo === 'todos' || lectura.tipoLectura === filterTipo;
    const matchLongitud = filterNivel === 'todos' || lectura.longitud === filterNivel;
    const matchTab = activeTab === 'lista' || (activeTab === 'favoritas' && lectura.esFavorita);
    return matchSearch && matchTipo && matchLongitud && matchTab;
  }) : [];

  if (authLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!user || user.tipoUsuario !== 'Estudiante') return <div className="min-h-screen bg-slate-50"></div>;

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20 font-sans">
      {/* Navbar Premium */}
      <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="bg-white/20 p-3 rounded-[20px] backdrop-blur-sm">
                <BookOpen className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-black tracking-tight">Lectura<span className="font-light opacity-80">IA</span></h1>
            </div>

            <div className="flex items-center space-x-6">
              {/* Gamification Stats in Navbar */}
              <div className="hidden md:flex items-center gap-4 bg-black/10 rounded-[24px] px-4 py-2 border-2 border-white/10">
                <div className="flex items-center gap-2 font-bold"><Sparkles className="w-5 h-5 text-tertiary" /> <span className="text-lg">{xp} XP</span></div>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex items-center gap-2 font-bold"><Coins className="w-5 h-5 text-secondary" /> <span className="text-lg">{monedas}</span></div>
                <div className="w-px h-6 bg-white/20"></div>
                <div className="flex items-center gap-2 font-bold"><Flame className="w-5 h-5 text-red-400" /> <span className="text-lg">{racha}</span></div>
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button onClick={() => setShowMenuDropdown(!showMenuDropdown)} className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-5 py-3 rounded-[24px] transition-all border-2 border-white/20">
                  <div className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center text-lg font-black shadow-inner">
                    {user.nombreCompleto?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold hidden sm:block">{user.nombreCompleto?.split(' ')[0]}</span>
                </button>

                {showMenuDropdown && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 mt-4 w-64 bg-white rounded-[24px] shadow-2xl py-2 z-50 border-4 border-slate-100 overflow-hidden text-slate-700">
                    <div className="px-5 py-3 bg-slate-50 border-b-2 border-slate-100">
                      <p className="text-sm text-slate-500 font-bold uppercase">Nivel {nivel} • Aventurero</p>
                    </div>
                    <button onClick={() => { setShowMenuDropdown(false); setShowPerfilModal(true); }} className="w-full text-left px-5 py-4 hover:bg-slate-50 flex items-center space-x-3 font-bold transition-colors">
                      <Settings className="w-5 h-5 text-primary" /> <span>Mi Perfil</span>
                    </button>
                    <button onClick={() => { setShowMenuDropdown(false); setShowPasswordModal(true); }} className="w-full text-left px-5 py-4 hover:bg-slate-50 flex items-center space-x-3 font-bold transition-colors">
                      <Lock className="w-5 h-5 text-primary" /> <span>Cambiar Contraseña</span>
                    </button>
                    <button onClick={handleLogout} className="w-full text-left px-5 py-4 hover:bg-red-50 text-red-500 flex items-center space-x-3 font-bold transition-colors">
                      <LogOut className="w-5 h-5" /> <span>Salir del Juego</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Welcome gamification banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mb-10 bg-gradient-to-r from-primary to-blue-400 text-white border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            <CardContent className="p-8 sm:p-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-4xl sm:text-5xl font-black">¡Hola, {user.nombreCompleto?.split(' ')[0]}! 🚀</h2>
                <p className="text-xl opacity-90 font-medium">¿Qué aventura leeremos hoy? Tienes {lecturas.length} libros en tu estante.</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                  <Button onClick={() => navigate('/estudiante/examenes')} variant="secondary" size="lg" className="font-bold text-lg px-8">
                    <Trophy className="w-5 h-5 mr-2" /> Mis Exámenes
                  </Button>
                  <Button onClick={handleGenerarLectura} className="bg-white text-primary hover:bg-white/90 font-bold text-lg px-8">
                    <Sparkles className="w-5 h-5 mr-2" /> Nueva Lectura IA
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex flex-col gap-4">
                <div className="bg-white/20 p-6 rounded-[24px] backdrop-blur-md border-2 border-white/20 flex items-center gap-6">
                  <div className="w-20 h-20 bg-secondary rounded-[20px] flex items-center justify-center rotate-3">
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase opacity-80">Nivel Actual</p>
                    <p className="text-4xl font-black">{nivel}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex space-x-2 bg-slate-200/50 p-2 rounded-[24px] w-full sm:w-auto overflow-x-auto">
            <button onClick={() => setActiveTab('lista')} className={`py-3 px-8 rounded-[18px] font-black text-lg transition-all duration-300 ${activeTab === 'lista' ? 'bg-white text-primary shadow-md scale-100' : 'text-slate-500 hover:text-primary scale-95'}`}>
              Mis Lecturas
            </button>
            <button onClick={() => setActiveTab('favoritas')} className={`py-3 px-8 rounded-[18px] font-black text-lg transition-all duration-300 ${activeTab === 'favoritas' ? 'bg-white text-secondary shadow-md scale-100' : 'text-slate-500 hover:text-secondary scale-95'}`}>
              Favoritas ❤️
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          {activeTab === 'lista' && (
            <div className="mb-8 bg-white p-4 rounded-[24px] shadow-sm border-2 border-slate-100">
              <LecturasFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterTipo={filterTipo} setFilterTipo={setFilterTipo} filterNivel={filterNivel} setFilterNivel={setFilterNivel} onGenerarLectura={handleGenerarLectura} />
            </div>
          )}
          
          <LecturasList activeTab={activeTab} lecturas={lecturasFiltradas} isLoading={isLoadingLecturas} onEliminarLectura={handleEliminarLectura} onToggleFavorita={handleToggleFavorita} onComenzarLectura={handleComenzarLectura} />
        </motion.div>
      </div>

      {/* Modals */}
      <CambiarPasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
      <MiPerfilModal isOpen={showPerfilModal} onClose={() => setShowPerfilModal(false)} />
      <MiClaseModal isOpen={showClaseModal} onClose={() => setShowClaseModal(false)} />
      <EncuestaGuiadaModal isOpen={showEncuesta} onClose={() => setShowEncuesta(false)} onComplete={handleEncuestaComplete} />
      {preferenciasActuales && <VistaPreviaPreferenciasModal isOpen={showVistaPrevia} preferencias={preferenciasActuales} onClose={() => { setShowVistaPrevia(false); setPreferenciasActuales(null); }} onGenerarLectura={handleGenerarLecturaConIA} isGenerating={isGenerating} />}
      {!cargandoTutorial && !mostrarTutorial && contenidoAyuda?.estudianteDashboard && <AyudaContextual pantalla="Dashboard Estudiante" contenido={contenidoAyuda.estudianteDashboard} onVerTutorial={() => setMostrarTutorial(true)} />}
      {mostrarTutorial && tutorialEstudiante && <TutorialInicial pasos={tutorialEstudiante} onCompletar={() => setMostrarTutorial(false)} onOmitir={() => setMostrarTutorial(false)} tipoUsuario="Estudiante" />}
    </div>
  );
}
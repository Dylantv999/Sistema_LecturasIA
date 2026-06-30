import { alertaError } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lecturaService, getImageUrl, type LecturaGenerada } from '../services/lecturaService';
import { sesionLecturaService } from '../services/sesionLecturaService';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, Clock, Moon, Sun, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LecturaVistaLectura() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lectura, setLectura] = useState<LecturaGenerada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sesionId, setSesionId] = useState<string | null>(null);
  const [tiempoInicio, setTiempoInicio] = useState<Date | null>(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0); // en segundos
  const [terminando, setTerminando] = useState(false);
  const [mostrarFelicitaciones, setMostrarFelicitaciones] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);

  // Scroll Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    cargarLecturaEIniciarSesion();
  }, [id]);

  // Timer de lectura
  useEffect(() => {
    if (!tiempoInicio) return;
    const intervalo = setInterval(() => {
      const ahora = new Date();
      const segundos = Math.floor((ahora.getTime() - tiempoInicio.getTime()) / 1000);
      setTiempoTranscurrido(segundos);
    }, 1000);
    return () => clearInterval(intervalo);
  }, [tiempoInicio]);

  // Apply dark mode to body to ensure full screen coverage for this route
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('bg-slate-900');
      document.body.classList.remove('bg-slate-50');
    } else {
      document.body.classList.remove('bg-slate-900');
      document.body.classList.add('bg-slate-50');
    }
    return () => {
      document.body.classList.remove('bg-slate-900');
      document.body.classList.add('bg-slate-50');
    };
  }, [isDarkMode]);

  const cargarLecturaEIniciarSesion = async () => {
    try {
      setLoading(true);
      const data = await lecturaService.obtenerLectura(Number(id));
      setLectura(data);
      const sesion = await sesionLecturaService.iniciarLectura(Number(id));
      setSesionId(sesion.id);
      setTiempoInicio(new Date());
      setLoading(false);
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message || 'Error al cargar la lectura');
      setLoading(false);
    }
  };

  const handleTerminarLectura = async () => {
    if (!sesionId || !tiempoInicio) return;
    try {
      setTerminando(true);
      const tiempoFin = new Date();
      const tiempoMinutos = (tiempoFin.getTime() - tiempoInicio.getTime()) / 60000;
      await sesionLecturaService.finalizarLectura(sesionId, tiempoMinutos);
      setMostrarFelicitaciones(true);
    } catch (err: any) {
      alertaError('Error al finalizar la lectura: ' + err.message);
      setTerminando(false);
    }
  };

  const handleComenzarCuestionario = () => {
    navigate(`/estudiante/cuestionario/${id}?sesionId=${sesionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">¡Ups! Hubo un problema</h2>
          <p className="text-slate-600 mb-6 font-medium">{error}</p>
          <Button onClick={() => navigate('/estudiante/dashboard')} size="lg" className="w-full">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  if (!lectura) return null;

  if (mostrarFelicitaciones) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] shadow-2xl p-10 max-w-xl w-full text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
          
          <motion.div initial={{ y: -20 }} animate={{ y: 0 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }} className="text-7xl mb-6">🏆</motion.div>
          <h2 className="text-4xl font-black text-slate-800 mb-3">¡Lectura Completada!</h2>
          <p className="text-xl text-slate-600 mb-2 font-medium">Has terminado de leer:</p>
          <p className="text-2xl font-black text-primary mb-8 leading-tight">"{lectura.titulo}"</p>

          <div className="bg-slate-50 rounded-[24px] p-6 mb-8 border-2 border-slate-100">
            <p className="text-slate-800 font-bold text-lg mb-2">¿Listo para el desafío? 🧠</p>
            <p className="text-slate-500 font-medium">Responde el cuestionario para ganar tus recompensas.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button onClick={() => navigate('/estudiante/dashboard')} variant="outline" size="lg" className="flex-1 py-6 text-lg border-2 rounded-[24px]">
              Más tarde
            </Button>
            <Button onClick={handleComenzarCuestionario} size="lg" className="flex-1 py-6 text-lg bg-secondary hover:bg-orange-500 text-white rounded-[24px]">
              ¡Comenzar Desafío!
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 font-body ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-50/80 text-slate-800'}`}>
      
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-2 bg-secondary z-[60] origin-left"
        style={{ scaleX }}
      />
      
      {/* Top Navigation Bar - Immersive and minimal */}
      <div className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} border-b px-4 py-3`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/estudiante/dashboard')}
            className={`flex items-center gap-2 font-bold px-4 py-2 rounded-[16px] transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>

          <div className="flex items-center gap-4">
            {tiempoInicio && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-[16px] font-mono font-bold ${isDarkMode ? 'bg-slate-800 text-tertiary' : 'bg-green-50 text-tertiary'}`}>
                <Clock className="w-5 h-5" />
                <span className="text-lg">
                  {String(Math.floor(tiempoTranscurrido / 60)).padStart(2, '0')}:
                  {String(tiempoTranscurrido % 60).padStart(2, '0')}
                </span>
              </div>
            )}
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              aria-label="Toggle Dark Mode"
            >
              <AnimatePresence mode="wait">
                <motion.div key={isDarkMode ? 'dark' : 'light'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8 md:mt-12">
        {/* Title Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-6 ${isDarkMode ? 'bg-primary/20 text-blue-300' : 'bg-primary/10 text-primary'}`}>
            📖 {lectura.tipoLectura}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-8">
            {lectura.titulo}
          </h1>
        </motion.div>

        {/* Image Area */}
        {lectura.urlImagen && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="mb-12 rounded-[32px] overflow-hidden shadow-xl border-4 border-white/10">
            <img
              src={getImageUrl(lectura.urlImagen)}
              alt={lectura.titulo}
              className="w-full h-auto max-h-[500px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </motion.div>
        )}

        {/* Reading Content Area */}
        <div className={`px-2 sm:px-6 md:px-0 font-body text-[22px] leading-[1.8] font-medium tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
          {lectura.contenido.split('\n\n').map((parrafo, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="mb-8"
            >
              {parrafo}
            </motion.p>
          ))}
        </div>

        {/* Finish Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-16 text-center">
          <Button
            onClick={handleTerminarLectura}
            disabled={terminando}
            size="lg"
            className={`w-full sm:w-auto px-12 py-8 text-2xl rounded-[32px] font-black transition-all transform hover:scale-105 shadow-xl ${
              isDarkMode ? 'bg-secondary text-white hover:bg-orange-500' : 'bg-secondary text-white hover:bg-orange-500'
            }`}
          >
            {terminando ? (
              <span className="flex items-center gap-3">
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                Continuar
                <ArrowRight className="w-8 h-8" />
              </span>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { cuestionarioService, type ResultadoDto } from '../services/cuestionarioService';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Star, Trophy, Coins, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CuestionarioResultados() {
  const { id: lecturaId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const cuestionarioId = searchParams.get('cuestionarioId');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [resultado, setResultado] = useState<ResultadoDto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gamification states
  const [xpGanada, setXpGanada] = useState(0);
  const [monedasGanadas, setMonedasGanadas] = useState(0);

  useEffect(() => {
    const cargarResultado = async () => {
      try {
        if (location.state?.resultado) {
          const res = location.state.resultado;
          setResultado(res);

          // Calculate fake rewards based on score
          const calculoXp = res.puntajeTotal * 50;
          const calculoMonedas = res.puntajeTotal * 10;

          // Only add rewards if it hasn't been added in this session navigation (strict mode fix)
          if (user && !location.state.recompensasEntregadas) {
            const storedData = localStorage.getItem(`gamification_${user.id}`);
            if (storedData) {
              const parsed = JSON.parse(storedData);
              parsed.xp = (parsed.xp || 1250) + calculoXp;
              parsed.monedas = (parsed.monedas || 300) + calculoMonedas;
              parsed.nivel = Math.floor(parsed.xp / 250);
              localStorage.setItem(`gamification_${user.id}`, JSON.stringify(parsed));
            } else {
              const xpNuevo = 1250 + calculoXp;
              const defaultData = { xp: xpNuevo, monedas: 300 + calculoMonedas, nivel: Math.floor(xpNuevo / 250), racha: 3 };
              localStorage.setItem(`gamification_${user.id}`, JSON.stringify(defaultData));
            }
            location.state.recompensasEntregadas = true;
            
            // Set local state to animate the numbers
            setTimeout(() => {
              setXpGanada(calculoXp);
              setMonedasGanadas(calculoMonedas);
            }, 1000); // delay for dramatic effect
          }

          setCargando(false);
        }
        else if (cuestionarioId) {
          const resultadoApi = await cuestionarioService.obtenerResultado(cuestionarioId);
          setResultado(resultadoApi);
          setCargando(false);
        }
        else {
          navigate('/estudiante/dashboard');
        }
      } catch (err: any) {
        console.error('Error al cargar resultado:', err);
        setError(err.message || 'Error al cargar el resultado');
        setCargando(false);
      }
    };

    cargarResultado();
  }, [location.state, cuestionarioId, navigate, user]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !resultado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">¡Ups!</h2>
          <p className="text-slate-600 mb-6 font-medium">{error || 'No se encontraron resultados'}</p>
          <Button onClick={() => navigate('/estudiante/dashboard')} size="lg" className="w-full rounded-[24px]">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  // Number of stars based on percentage (0 to 3)
  const estrellasVacias = 3;
  let estrellasGanadas = 0;
  if (resultado.porcentaje >= 90) estrellasGanadas = 3;
  else if (resultado.porcentaje >= 60) estrellasGanadas = 2;
  else if (resultado.porcentaje >= 30) estrellasGanadas = 1;

  const esExcelente = resultado.porcentaje >= 80;

  return (
    <div className={`min-h-screen pb-20 font-body transition-colors duration-1000 ${esExcelente ? 'bg-gradient-to-b from-primary to-blue-300' : 'bg-gradient-to-b from-slate-100 to-slate-200'}`}>
      
      {/* Decorative background elements for excellent scores */}
      {esExcelente && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[80px]" />
          <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} className="absolute top-[40%] -left-[20%] w-[500px] h-[500px] bg-yellow-300/20 rounded-full blur-[80px]" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-12 relative z-10">
        
        {/* Main Reward Card */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 50 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 text-center mb-8 relative border-4 border-white/50"
        >
          {/* Header Icon */}
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
            className="w-24 h-24 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg -mt-20 border-4 border-white"
          >
            {esExcelente ? <Trophy className="w-12 h-12" /> : <Star className="w-12 h-12" />}
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">
            {resultado.mensajeAnimo}
          </h1>
          <p className="text-xl font-bold text-slate-500 mb-8">
            Has completado la lectura con éxito
          </p>

          {/* Stars Display */}
          <div className="flex justify-center gap-4 mb-8">
            {[...Array(estrellasVacias)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.6 + (i * 0.2), type: "spring" }}
              >
                <Star 
                  className={`w-16 h-16 ${i < estrellasGanadas ? 'fill-yellow-400 text-yellow-500 drop-shadow-md' : 'fill-slate-100 text-slate-200'}`} 
                />
              </motion.div>
            ))}
          </div>

          {/* Score percentage */}
          <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-8xl font-black text-primary tracking-tighter drop-shadow-sm">
              {resultado.porcentaje.toFixed(0)}%
            </span>
            <span className="text-2xl font-bold text-slate-400 uppercase tracking-widest mt-1">
              Precisión
            </span>
          </div>

          {/* XP & Coins Gamification Rewards */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={xpGanada > 0 ? { opacity: 1, y: 0 } : { opacity: 0 }}
              className="bg-purple-50 rounded-[24px] p-4 flex flex-col items-center border-2 border-purple-100"
            >
              <Sparkles className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-3xl font-black text-purple-700">+{xpGanada}</span>
              <span className="text-sm font-bold text-purple-400 uppercase tracking-wider">XP</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={monedasGanadas > 0 ? { opacity: 1, y: 0 } : { opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-yellow-50 rounded-[24px] p-4 flex flex-col items-center border-2 border-yellow-100"
            >
              <Coins className="w-8 h-8 text-yellow-500 mb-2" />
              <span className="text-3xl font-black text-yellow-700">+{monedasGanadas}</span>
              <span className="text-sm font-bold text-yellow-500 uppercase tracking-wider">Monedas</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Feedback Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          className="bg-white rounded-[32px] shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">Feedback de la IA 🧠</h2>
          
          <div className="space-y-4">
            {resultado.retroalimentacion ? (
              <>
                <div className="bg-green-50 rounded-[20px] p-6 border-l-8 border-green-500">
                  <h3 className="font-bold text-green-800 text-lg mb-2">¡Lo que hiciste genial!</h3>
                  <p className="text-green-900 font-medium leading-relaxed">{resultado.retroalimentacion.logros}</p>
                </div>
                <div className="bg-blue-50 rounded-[20px] p-6 border-l-8 border-blue-500">
                  <h3 className="font-bold text-blue-800 text-lg mb-2">Para la próxima...</h3>
                  <p className="text-blue-900 font-medium leading-relaxed">{resultado.retroalimentacion.mejora}</p>
                </div>
              </>
            ) : (
              <div className="bg-slate-50 rounded-[20px] p-6 border-2 border-slate-100">
                <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                  {resultado.retroalimentacionPersonalizada}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={() => navigate(`/estudiante/cuestionario/${lecturaId}/revision?cuestionarioId=${cuestionarioId}`)}
            variant="outline"
            size="lg"
            className="flex-1 rounded-[24px] py-8 text-xl font-bold bg-white/50 backdrop-blur-sm border-2 hover:bg-white"
          >
            <RotateCcw className="w-6 h-6 mr-2" /> Ver mis respuestas
          </Button>

          <Button
            onClick={() => navigate('/estudiante/dashboard')}
            size="lg"
            className="flex-1 rounded-[24px] py-8 text-xl font-bold bg-secondary hover:bg-orange-500 text-white shadow-xl"
          >
            Siguiente Nivel <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </motion.div>

      </div>
    </div>
  );
}
import { alertaError } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { cuestionarioService, type CuestionarioDto, type PreguntaDto, type RespuestaDto } from '../services/cuestionarioService';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CuestionarioRespuesta() {
  const { id: lecturaId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const cuestionarioId = searchParams.get('cuestionarioId');
  const navigate = useNavigate();

  const [cuestionario, setCuestionario] = useState<CuestionarioDto | null>(null);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Timer del cuestionario
  const [tiempoInicio, setTiempoInicio] = useState<Date | null>(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0); // en segundos

  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!cuestionarioId) {
      setError('No se proporcionó ID de cuestionario');
      return;
    }
    cargarCuestionario();
  }, [cuestionarioId]);

  // Timer del cuestionario
  useEffect(() => {
    if (!tiempoInicio) {
      setTiempoInicio(new Date());
    }

    const interval = setInterval(() => {
      if (tiempoInicio) {
        const ahora = new Date();
        const segundos = Math.floor((ahora.getTime() - tiempoInicio.getTime()) / 1000);
        setTiempoTranscurrido(segundos);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tiempoInicio]);

  const cargarCuestionario = async () => {
    try {
      setIsLoading(true);
      const data = await cuestionarioService.obtenerCuestionario(cuestionarioId!);
      setCuestionario(data);
    } catch (error: any) {
      console.error('Error al cargar cuestionario:', error);
      setError(error.message || 'Error al cargar el cuestionario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespuesta = (preguntaId: string, respuesta: string) => {
    const nuevasRespuestas = new Map(respuestas);
    nuevasRespuestas.set(preguntaId, respuesta);
    setRespuestas(nuevasRespuestas);
  };

  const handleSiguiente = () => {
    if (preguntaActual < (cuestionario?.preguntas.length || 0) - 1) {
      setDirection(1);
      setPreguntaActual(preguntaActual + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      setDirection(-1);
      setPreguntaActual(preguntaActual - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalizarIntento = () => {
    const preguntasSinResponder = cuestionario?.preguntas.filter(
      p => !respuestas.has(p.id) || respuestas.get(p.id)?.trim() === ''
    );

    if (preguntasSinResponder && preguntasSinResponder.length > 0) {
      alertaError(`Tienes ${preguntasSinResponder.length} pregunta(s) sin responder. Por favor, responde todas las preguntas antes de enviar.`);
      return;
    }

    setMostrarConfirmacion(true);
  };

  const handleEnviar = async () => {
    try {
      setIsSubmitting(true);
      setMostrarConfirmacion(false);

      const respuestasArray: RespuestaDto[] = Array.from(respuestas.entries()).map(
        ([preguntaId, textoRespuesta]) => ({
          preguntaId,
          textoRespuesta
        })
      );

      const tiempoMinutos = tiempoTranscurrido / 60;
      const resultado = await cuestionarioService.enviarRespuestas(cuestionarioId!, respuestasArray, tiempoMinutos);

      navigate(`/estudiante/cuestionario/${lecturaId}/resultados?cuestionarioId=${cuestionarioId}`, {
        state: { resultado }
      });
    } catch (error: any) {
      console.error('Error al enviar respuestas:', error);
      alertaError(error.message || 'Error al enviar las respuestas');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] shadow-xl p-8 max-w-md w-full text-center border border-sky-100">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-6 font-medium">{error}</p>
          <Button onClick={() => navigate('/estudiante/dashboard')} className="w-full rounded-[24px]" size="lg">
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!cuestionario) return null;

  const pregunta: PreguntaDto = cuestionario.preguntas[preguntaActual];
  const respuestaActual = respuestas.get(pregunta.id) || '';
  const progreso = ((preguntaActual + 1) / cuestionario.preguntas.length) * 100;

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Literal': return 'bg-primary/10 text-primary border-primary/20';
      case 'Analitica': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Critica': return 'bg-secondary/10 text-secondary border-secondary/20';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 font-body">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header / Progreso */}
        <div className="bg-white rounded-[24px] shadow-md border border-slate-100 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-black text-primary uppercase tracking-wider mb-1 block">📝 Cuestionario</span>
              <h1 className="text-xl md:text-2xl font-black text-slate-800">
                {cuestionario.tituloLectura}
              </h1>
            </div>
            
            {/* Timer */}
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-[16px] font-mono font-bold text-slate-600">
              <Clock className="w-4 h-4 text-primary" />
              <span>
                {Math.floor(tiempoTranscurrido / 60)}:{String(tiempoTranscurrido % 60).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-slate-500 mb-1">
              <span>Pregunta {preguntaActual + 1} de {cuestionario.preguntas.length}</span>
              <span className={`px-3 py-1 rounded-[12px] text-xs uppercase tracking-wider ${getTipoColor(pregunta.tipo)}`}>
                {pregunta.tipo === 'Analitica' ? 'Inferencial' : pregunta.tipo}
              </span>
            </div>
            <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
              <motion.div 
                className="bg-tertiary h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progreso}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Question Container with Animation */}
        <div className="relative min-h-[400px] overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={preguntaActual}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="bg-white rounded-[32px] shadow-lg border-2 border-slate-100 p-6 md:p-10 w-full"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-8 leading-relaxed">
                {pregunta.textoPregunta}
              </h2>

              {/* Opciones Múltiples */}
              {pregunta.formato === 'OpcionMultiple' && pregunta.opciones && (
                <div className="grid grid-cols-1 gap-4">
                  {pregunta.opciones.map((opcion, index) => {
                    const esSeleccionada = respuestaActual === opcion;
                    return (
                      <motion.label
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        key={index}
                        className={`flex items-center p-5 border-4 rounded-[24px] cursor-pointer transition-colors ${
                          esSeleccionada
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-slate-100 bg-white hover:border-primary/30 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`pregunta-${pregunta.id}`}
                          value={opcion}
                          checked={esSeleccionada}
                          onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-8 h-8 rounded-full border-4 mr-4 flex items-center justify-center transition-colors ${
                          esSeleccionada ? 'border-primary bg-primary' : 'border-slate-200 bg-white'
                        }`}>
                          {esSeleccionada && <div className="w-3 h-3 rounded-full bg-white" />}
                        </div>
                        <span className={`flex-1 text-lg font-bold ${esSeleccionada ? 'text-primary' : 'text-slate-700'}`}>
                          {opcion}
                        </span>
                      </motion.label>
                    );
                  })}
                </div>
              )}

              {/* Caja de Texto Abierta */}
              {pregunta.formato === 'Abierta' && (
                <div className="space-y-4">
                  <textarea
                    value={respuestaActual}
                    onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    className="w-full p-6 border-4 border-slate-100 rounded-[24px] focus:border-primary focus:ring-4 focus:ring-primary/20 bg-slate-50 font-medium text-slate-800 text-lg outline-none transition-all min-h-[200px] resize-y"
                  />
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-[20px] p-5 flex gap-4 items-start">
                    <span className="text-2xl">💡</span>
                    <p className="text-sm font-bold text-amber-900 leading-relaxed">
                      Tip: Argumenta bien tus ideas y cuida tu redacción. La Inteligencia Artificial leerá tu respuesta.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4">
          <Button
            onClick={handleAnterior}
            disabled={preguntaActual === 0}
            variant="outline"
            size="lg"
            className="rounded-[24px] px-8 py-6 text-lg border-2 shadow-sm font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Anterior
          </Button>

          {preguntaActual < cuestionario.preguntas.length - 1 ? (
            <Button
              onClick={handleSiguiente}
              size="lg"
              className="rounded-[24px] px-8 py-6 text-lg bg-primary hover:bg-blue-700 text-white font-bold shadow-lg"
            >
              Siguiente <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleFinalizarIntento}
              size="lg"
              className="rounded-[24px] px-8 py-6 text-lg bg-tertiary hover:bg-green-700 text-white font-bold shadow-lg"
            >
              <CheckCircle2 className="w-6 h-6 mr-2" /> Enviar Respuestas
            </Button>
          )}
        </div>
        
        {/* Mini Map */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 flex flex-wrap gap-3 justify-center">
          {cuestionario.preguntas.map((p, index) => {
            const esActual = index === preguntaActual;
            const tieneRespuesta = respuestas.has(p.id) && respuestas.get(p.id)?.trim() !== '';
            
            return (
              <button
                key={p.id}
                onClick={() => {
                  setDirection(index > preguntaActual ? 1 : -1);
                  setPreguntaActual(index);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-12 h-12 rounded-[16px] font-black text-lg transition-all flex items-center justify-center ${
                  esActual 
                    ? 'bg-primary text-white scale-110 shadow-lg border-2 border-white ring-4 ring-primary/30' 
                    : tieneRespuesta 
                      ? 'bg-tertiary text-white hover:bg-green-600 shadow-sm' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {mostrarConfirmacion && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 text-center"
            >
              <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <h3 className="text-3xl font-black text-slate-800 mb-4">¿Enviar respuestas?</h3>
              <p className="text-lg font-medium text-slate-500 mb-8">
                ¡Has llegado al final! ¿Estás seguro de enviar tus respuestas para que sean evaluadas?
              </p>

              <div className="flex gap-4">
                <Button onClick={() => setMostrarConfirmacion(false)} disabled={isSubmitting} variant="outline" className="flex-1 rounded-[24px] py-6 text-lg border-2 font-bold">
                  Revisar
                </Button>
                <Button onClick={handleEnviar} disabled={isSubmitting} className="flex-1 rounded-[24px] py-6 text-lg bg-tertiary hover:bg-green-700 font-bold text-white shadow-lg">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      Enviando...
                    </span>
                  ) : (
                    'Sí, enviar'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
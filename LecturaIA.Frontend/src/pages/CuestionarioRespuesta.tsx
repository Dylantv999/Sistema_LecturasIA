import { alertaError } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { cuestionarioService, type CuestionarioDto, type PreguntaDto, type RespuestaDto } from '../services/cuestionarioService';

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
      setPreguntaActual(preguntaActual + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) {
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
      <div className="min-h-screen bg-sky-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-sky-800">Cargando cuestionario...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-sky-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-sky-950 mb-2">Error</h2>
          <p className="text-sky-800 mb-6">{error}</p>
          <button
            onClick={() => navigate('/estudiante/dashboard')}
            className="w-full bg-sky-600 text-white py-3 px-6 rounded-full font-bold hover:bg-sky-700 transition shadow-md"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!cuestionario) {
    return null;
  }

  const pregunta: PreguntaDto = cuestionario.preguntas[preguntaActual];
  const respuestaActual = respuestas.get(pregunta.id) || '';
  const progreso = ((preguntaActual + 1) / cuestionario.preguntas.length) * 100;

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Literal':
        return 'bg-sky-55 text-sky-700 border-sky-100';
      case 'Analitica':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Critica':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-sky-50/40 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Cabecera Principal / Progreso */}
        <div className="bg-white rounded-3xl shadow-xs border border-sky-100 p-6 md:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold text-sky-600 uppercase tracking-wider block mb-1">📝 Cuestionario en curso</span>
              <h1 className="text-xl md:text-2xl font-black text-sky-950 tracking-tight leading-snug">
                {cuestionario.tituloLectura}
              </h1>
            </div>
            
            {/* Timer y Estado */}
            <div className="flex items-center gap-3 self-start sm:self-center">
              <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">
                Pregunta {preguntaActual + 1} de {cuestionario.preguntas.length}
              </div>
              <div className="flex items-center gap-1.5 bg-sky-50/80 border border-sky-100 px-3 py-1.5 rounded-xl font-bold text-sky-700 text-sm">
                <svg className="w-4 h-4 text-sky-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {Math.floor(tiempoTranscurrido / 60)}:{String(tiempoTranscurrido % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de progreso estilizada */}
          <div className="space-y-1.5">
            <div className="bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-50">
              <div 
                className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progreso}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
              <span>{respuestas.size} de {cuestionario.preguntas.length} respondidas</span>
              <span className={`px-2.5 py-0.5 rounded-lg border ${getTipoColor(pregunta.tipo)}`}>
                {pregunta.tipo === 'Analitica' ? 'Inferencial' : pregunta.tipo}
              </span>
            </div>
          </div>
        </div>

        {/* Bloque Central: Contenedor de la Pregunta */}
        <div className="bg-white rounded-3xl shadow-2xs border border-sky-100 p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <span className="text-lg bg-sky-50 border border-sky-100 text-sky-700 px-2.5 py-1 rounded-xl font-black shadow-3xs">
              {preguntaActual + 1}
            </span>
            <h2 className="text-lg font-black text-sky-950 leading-snug mt-0.5">
              {pregunta.textoPregunta}
            </h2>
          </div>

          {/* Opciones Múltiples */}
          {pregunta.formato === 'OpcionMultiple' && pregunta.opciones && (
            <div className="grid grid-cols-1 gap-3">
              {pregunta.opciones.map((opcion, index) => {
                const esSeleccionada = respuestaActual === opcion;
                return (
                  <label
                    key={index}
                    className={`flex items-start p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                      esSeleccionada
                        ? 'border-sky-500 bg-sky-50/50 text-sky-950 shadow-3xs'
                        : 'border-slate-100 bg-slate-50/30 hover:border-sky-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5 mr-3 flex items-center justify-center">
                      <input
                        type="radio"
                        name={`pregunta-${pregunta.id}`}
                        value={opcion}
                        checked={esSeleccionada}
                        onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                        className="sr-only" // Ocultar radio por defecto para usar contenedor customizado
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        esSeleccionada ? 'border-sky-600 bg-sky-600 shadow-3xs' : 'border-slate-300 bg-white'
                      }`}>
                        {esSeleccionada && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                    <span className="flex-1 text-sm font-semibold leading-normal">{opcion}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Caja de Texto Abierta */}
          {pregunta.formato === 'Abierta' && (
            <div className="space-y-3">
              <textarea
                value={respuestaActual}
                onChange={(e) => handleRespuesta(pregunta.id, e.target.value)}
                placeholder="Escribe tu respuesta aquí... Sé claro y justifica tu opinión basándote en la lectura."
                className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-sky-500 focus:bg-white bg-slate-50/30 font-medium text-slate-800 placeholder-slate-400 outline-none transition min-h-[220px] text-sm leading-relaxed resize-y"
                rows={8}
              />
              <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4 flex gap-3 items-start">
                <span className="text-lg bg-white border border-purple-100 px-2 py-0.5 rounded-xl shadow-3xs" role="img" aria-label="Tips">💡</span>
                <p className="text-xs font-medium text-purple-900 leading-relaxed">
                  <span className="font-bold block mb-0.5">Tip de comprensión:</span>
                  Las respuestas abiertas y de criterio crítico serán evaluadas mediante IA adaptativa. Argumenta bien tus ideas y cuida tu redacción.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navegación y Mapa de Preguntas Inferior */}
        <div className="bg-white rounded-3xl shadow-xs border border-sky-100 p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handleAnterior}
              disabled={preguntaActual === 0}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-all shadow-3xs ${
                preguntaActual === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                  : 'bg-white border border-sky-200 text-sky-700 hover:bg-sky-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Anterior</span>
            </button>

            {preguntaActual < cuestionario.preguntas.length - 1 ? (
              <button
                onClick={handleSiguiente}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-7 py-3.5 rounded-full shadow-md shadow-sky-100 font-bold text-sm transition-all"
              >
                <span>Siguiente</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleFinalizarIntento}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-full shadow-md shadow-emerald-100 font-bold text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Finalizar y Enviar</span>
              </button>
            )}
          </div>

          {/* Mini mapa / Cuadrícula de Preguntas */}
          <div className="pt-5 border-t border-slate-100 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mapa del cuestionario:</p>
            <div className="flex flex-wrap gap-2">
              {cuestionario.preguntas.map((p, index) => {
                const esActual = index === preguntaActual;
                const tieneRespuesta = respuestas.has(p.id) && respuestas.get(p.id)?.trim() !== '';
                
                let btnStyles = 'bg-slate-100 text-slate-500 hover:bg-slate-200';
                if (esActual) {
                  btnStyles = 'bg-sky-600 text-white ring-4 ring-sky-100 font-black scale-105';
                } else if (tieneRespuesta) {
                  btnStyles = 'bg-emerald-500 text-white hover:bg-emerald-600';
                }

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPreguntaActual(index);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-9 h-9 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${btnStyles}`}
                    title={`Pregunta ${index + 1} - ${p.tipo}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación adaptado */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-sky-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-sky-50 text-center space-y-5">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-3xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-sky-950 tracking-tight">
                ¿Enviar respuestas?
              </h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Una vez enviado, las respuestas se registrarán y no se podrán modificar. ¿Estás seguro de finalizar el intento?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setMostrarConfirmacion(false)}
                disabled={isSubmitting}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-full text-sm font-bold transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviar}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-full text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-emerald-100"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Sí, enviar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { alertaError } from '../utils/alerts';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lecturaService, getImageUrl, type LecturaGenerada } from '../services/lecturaService';
import { sesionLecturaService } from '../services/sesionLecturaService';

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
      <div className="min-h-screen bg-sky-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg font-medium text-sky-800">Cargando lectura...</div>
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
            className="w-full bg-sky-600 text-white py-3 px-6 rounded-full font-bold hover:bg-sky-700 transition shadow-md shadow-sky-100"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!lectura) return null;

  // Modal de felicitaciones (Mantiene su tamaño controlado)
  if (mostrarFelicitaciones) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-xl w-full text-center border border-sky-100 animate-fade-in flex flex-col items-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-black text-sky-950 mb-3">¡Excelente trabajo!</h2>
          <p className="text-lg text-sky-800 mb-1">Has terminado de leer la historia</p>
          <p className="text-xl font-bold text-sky-600 mb-8 max-w-md">"{lectura.titulo}"</p>

          <div className="bg-sky-50/80 rounded-2xl p-6 mb-8 w-full border border-sky-100/50">
            <p className="text-sky-900 font-bold mb-2">¿Listo para poner a prueba tu comprensión?</p>
            <p className="text-sm text-sky-700">Responde el cuestionario personalizado generado por la IA.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={() => navigate('/estudiante/dashboard')}
              className="flex-1 px-6 py-3.5 border-2 border-sky-200 text-sky-700 font-bold rounded-full hover:bg-sky-50 transition text-sm"
            >
              Volver al Dashboard
            </button>
            <button
              onClick={handleComenzarCuestionario}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-bold rounded-full hover:from-sky-700 hover:to-cyan-600 transition shadow-md shadow-sky-100 text-sm"
            >
              Comenzar Cuestionario →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50/40 pb-16">
      {/* Barra superior de control - Ancho Expandido a max-w-5xl */}
      <div className="max-w-5xl mx-auto px-4 pt-8 mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/estudiante/dashboard')}
          className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-2 text-sm transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </button>

        {/* Indicador de tiempo flotante y limpio */}
        {tiempoInicio && (
          <div className="bg-white border border-sky-100 text-sky-700 font-mono text-sm font-bold py-2 px-4 rounded-full shadow-sm flex items-center gap-2">
            <span>⏱️</span>
            <span>
              {String(Math.floor(tiempoTranscurrido / 60)).padStart(2, '0')}:
              {String(tiempoTranscurrido % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Contenedor Principal sin scroll interno */}
        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">

          {/* Cabecera del Texto */}
          <div className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white p-8 md:p-12 text-center">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight max-w-4xl mx-auto">
              {lectura.titulo}
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
              📖 {lectura.tipoLectura}
            </span>
          </div>

          {/* Área de Imagen Optimizada */}
          {lectura.urlImagen && (
            <div className="flex justify-center p-6 md:p-8 bg-sky-50/30 border-b border-sky-50">
              <div className="max-w-3xl w-full overflow-hidden rounded-2xl shadow-sm border border-white bg-white">
                <img
                  src={getImageUrl(lectura.urlImagen)}
                  alt={lectura.titulo}
                  className="w-full h-auto object-cover max-h-[450px]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect fill="%23f0f9ff"/><text x="50%" y="50%" text-anchor="middle" fill="%230ea5e9" font-family="sans-serif" font-weight="bold" font-size="16">LecturaIA - Ilustración del texto</text></svg>';
                  }}
                />
              </div>
            </div>
          )}

          {/* Caja de Texto - AHORA CRECE DE FORMA NATURAL CON LA PÁGINA */}
          <div className="p-8 md:p-14 bg-white">
            <div className="max-w-4xl mx-auto">
              {lectura.contenido.split('\n\n').map((parrafo, i) => (
                <p
                  key={`${i}-${parrafo.substring(0, 10)}`}
                  className="text-lg md:text-xl font-normal leading-relaxed mb-6 text-justify text-slate-700 tracking-wide"
                >
                  {parrafo}
                </p>
              ))}
            </div>
          </div>

          {/* Footer de Metadatos y Acción */}
          <div className="bg-sky-50/50 p-6 md:p-10 border-t border-sky-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 text-xs font-bold text-sky-800/80 uppercase tracking-wider text-center sm:text-left">
              <span className="bg-white border border-sky-100 px-4 py-2 rounded-xl shadow-2xs">📝 {lectura.preferencias.longitud}</span>
              <span className="bg-white border border-sky-100 px-4 py-2 rounded-xl shadow-2xs">😊 {lectura.preferencias.emocion}</span>
            </div>

            <button
              onClick={handleTerminarLectura}
              disabled={terminando}
              className={`
                w-full sm:w-auto px-10 py-4 rounded-full text-base font-bold text-white shadow-md shadow-sky-100 transition-all duration-200
                ${terminando
                  ? 'bg-sky-300 cursor-not-allowed shadow-none'
                  : 'bg-sky-600 hover:bg-sky-700 active:scale-98'
                }
              `}
            >
              {terminando ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </span>
              ) : (
                '✓ Terminar Lectura'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
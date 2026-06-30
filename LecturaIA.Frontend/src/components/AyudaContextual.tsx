import { useState } from 'react';
import { HelpCircle, X, Info, Users, BookOpen, Trophy, Sparkles, MonitorPlay, GraduationCap } from 'lucide-react';

interface AyudaContextualProps {
  pantalla: string;
  contenido: {
    titulo: string;
    instrucciones: string[];
  };
  onVerTutorial?: () => void;
}

export default function AyudaContextual({ pantalla, contenido, onVerTutorial }: AyudaContextualProps) {
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [activeTab, setActiveTab] = useState<'docente' | 'estudiante'>('docente');

  return (
    <>
      {/* Botón flotante moderno */}
      <button
        onClick={() => setMostrarAyuda(true)}
        className="fixed bottom-6 right-6 z-40 px-5 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-1 cursor-pointer border border-slate-700"
        title="Centro de Ayuda"
      >
        <HelpCircle className="w-5 h-5 text-indigo-400" />
        <span className="font-bold text-sm hidden sm:inline">Ayuda & Tutoriales</span>
      </button>

      {/* Modal Premium */}
      {mostrarAyuda && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Centro de Ayuda</h2>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Asistencia al Docente</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarAyuda(false)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center space-x-2 px-6 pt-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
              <button
                onClick={() => setActiveTab('docente')}
                className={`px-5 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'docente' 
                    ? 'border-indigo-600 text-indigo-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>Guía del Panel Actual</span>
              </button>
              <button
                onClick={() => setActiveTab('estudiante')}
                className={`px-5 py-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors shrink-0 cursor-pointer ${
                  activeTab === 'estudiante' 
                    ? 'border-emerald-600 text-emerald-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Modo Presentación: Cómo explicar a Alumnos</span>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-6 md:p-8 overflow-y-auto bg-slate-50/50 flex-1 relative">
              {/* Tab: DOCENTE */}
              {activeTab === 'docente' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
                      {pantalla}
                    </div>
                    <h3 className="text-xl font-black text-slate-800">{contenido.titulo}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contenido.instrucciones.map((instruccion, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition group"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-black text-sm flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed mt-1">
                          {instruccion}
                        </p>
                      </div>
                    ))}
                  </div>

                  {onVerTutorial && (
                    <div className="mt-8 pt-8 border-t border-slate-200 flex justify-center">
                      <button
                        onClick={() => {
                          setMostrarAyuda(false);
                          onVerTutorial();
                        }}
                        className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-slate-900 hover:shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                      >
                        <GraduationCap className="w-5 h-5 text-indigo-400" />
                        <span>Reiniciar Tutorial Interactivo</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: ESTUDIANTE (Modo Presentación) */}
              {activeTab === 'estudiante' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="text-center space-y-2 max-w-2xl mx-auto">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">¿Cómo funciona LecturasIA?</h3>
                    <p className="text-slate-500 font-medium text-sm sm:text-base">
                      Querido Docente: Puedes proyectar esta pantalla en el aula para explicar de forma sencilla el uso de la plataforma a tus alumnos.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {/* Paso 1 */}
                    <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-100 rounded-3xl p-6 text-center space-y-5 shadow-sm hover:shadow-md transition-shadow relative">
                       <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-600 text-white font-black rounded-full flex items-center justify-center shadow-md">1</div>
                       <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mt-2">
                         <MonitorPlay className="w-10 h-10" />
                       </div>
                       <div>
                         <h4 className="text-lg font-black text-slate-800 mb-2">Ingresa tu Código</h4>
                         <p className="text-sm font-medium text-slate-500 leading-relaxed">Usa el código secreto del salón para entrar a tu cuenta. No necesitas correos complicados.</p>
                       </div>
                    </div>
                    
                    {/* Paso 2 */}
                    <div className="bg-gradient-to-b from-emerald-50 to-white border border-emerald-100 rounded-3xl p-6 text-center space-y-5 shadow-sm hover:shadow-md transition-shadow relative">
                       <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-emerald-600 text-white font-black rounded-full flex items-center justify-center shadow-md">2</div>
                       <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mt-2">
                         <BookOpen className="w-10 h-10" />
                       </div>
                       <div>
                         <h4 className="text-lg font-black text-slate-800 mb-2">Completa Misiones</h4>
                         <p className="text-sm font-medium text-slate-500 leading-relaxed">Lee historias increíbles hechas por Inteligencia Artificial y responde los desafíos para avanzar.</p>
                       </div>
                    </div>
                    
                    {/* Paso 3 */}
                    <div className="bg-gradient-to-b from-amber-50 to-white border border-amber-100 rounded-3xl p-6 text-center space-y-5 shadow-sm hover:shadow-md transition-shadow relative">
                       <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-amber-500 text-white font-black rounded-full flex items-center justify-center shadow-md">3</div>
                       <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mt-2">
                         <Trophy className="w-10 h-10" />
                       </div>
                       <div>
                         <h4 className="text-lg font-black text-slate-800 mb-2">¡Gana Recompensas!</h4>
                         <p className="text-sm font-medium text-slate-500 leading-relaxed">Sube de nivel, acumula XP y obtén estrellas épicas al terminar cada lectura. ¡Aprender es un juego!</p>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

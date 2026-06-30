import { useNavigate } from 'react-router-dom';
import type { LecturaLista } from '../../services/lecturaService';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Play, CheckCircle, RefreshCcw, FileText, Star, Trash2, History, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LecturasListProps {
  lecturas: LecturaLista[];
  isLoading: boolean;
  activeTab: 'lista' | 'favoritas';
  onToggleFavorita: (id: number, esFavorita: boolean) => void;
  onComenzarLectura: (id: number) => void;
  onEliminarLectura: (id: number) => void;
}

export default function LecturasList({
  lecturas,
  isLoading,
  activeTab,
  onToggleFavorita,
  onComenzarLectura,
  onEliminarLectura
}: LecturasListProps) {
  const navigate = useNavigate();

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'bg-tertiary/20 text-tertiary border-tertiary/30';
      case 'en_progreso': return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'pendiente': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'completado': return '¡Completado!';
      case 'en_progreso': return 'Leyendo...';
      case 'pendiente': return 'Por Empezar';
      default: return 'Pendiente';
    }
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-8 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-bold text-primary">Cargando tus aventuras...</p>
      </div>
    );
  }

  if (lecturas.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border-4 border-slate-100 border-dashed">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 text-slate-400" />
        </div>
        <p className="text-2xl font-black text-slate-700 mb-2">
          {activeTab === 'favoritas' ? 'Aún no hay favoritas' : 'Tu estante está vacío'}
        </p>
        <p className="text-lg text-slate-500">
          {activeTab === 'favoritas'
            ? 'Marca una lectura con la estrella ⭐ para verla aquí.'
            : '¡Genera una nueva lectura con IA para empezar a jugar!'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {lecturas.map((lectura) => (
        <motion.div key={lectura.id} variants={item}>
          <Card className={`relative overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border-4 ${lectura.estado === 'completado' ? 'border-tertiary/20' : 'border-transparent'}`}>
            
            {/* Absolute Favorite Button */}
            <button 
              onClick={() => onToggleFavorita(lectura.id, lectura.esFavorita)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
            >
              <Star className={`w-5 h-5 ${lectura.esFavorita ? 'fill-secondary text-secondary' : 'text-slate-400'}`} />
            </button>

            {/* Header Image Placeholder */}
            <div className={`h-32 w-full ${lectura.estado === 'completado' ? 'bg-gradient-to-br from-tertiary/40 to-tertiary/10' : 'bg-gradient-to-br from-primary/20 to-primary/5'} flex items-center justify-center relative`}>
              <div className="w-16 h-16 bg-white rounded-[20px] shadow-sm flex items-center justify-center rotate-[-5deg]">
                <BookOpen className={`w-8 h-8 ${lectura.estado === 'completado' ? 'text-tertiary' : 'text-primary'}`} />
              </div>
            </div>

            <CardContent className="p-6 flex-1 flex flex-col pt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border-2 ${getEstadoColor(lectura.estado)}`}>
                  {getEstadoTexto(lectura.estado)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-slate-100 text-slate-500 border-2 border-slate-200">
                  {lectura.tipoLectura}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-800 line-clamp-2 leading-tight mb-4 flex-1" title={lectura.titulo}>
                {lectura.titulo}
              </h3>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>Progreso</span>
                  <span className={lectura.progreso === 100 ? 'text-tertiary' : 'text-primary'}>{lectura.progreso}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${lectura.progreso === 100 ? 'bg-tertiary' : 'bg-primary'}`} 
                    style={{ width: `${lectura.progreso}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-auto">
                {lectura.estado === 'pendiente' && (
                  <Button onClick={() => onComenzarLectura(lectura.id)} className="w-full font-bold h-12 text-lg rounded-[16px] shadow-md hover:scale-[1.02]">
                    <Play className="w-5 h-5 mr-2 fill-white" /> ¡A Leer!
                  </Button>
                )}
                
                {lectura.estado === 'en_progreso' && (
                  <Button onClick={() => onComenzarLectura(lectura.id)} variant="secondary" className="w-full font-bold h-12 text-lg rounded-[16px] shadow-md hover:scale-[1.02]">
                    <Play className="w-5 h-5 mr-2 fill-white" /> Continuar
                  </Button>
                )}
                
                {lectura.estado === 'completado' && !lectura.cuestionarioEvaluado && (
                  <Button onClick={() => navigate(`/estudiante/lectura/${lectura.id}`)} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold h-12 text-lg rounded-[16px] shadow-md shadow-purple-500/20 hover:scale-[1.02]">
                    <FileText className="w-5 h-5 mr-2" /> Cuestionario
                  </Button>
                )}

                {lectura.estado === 'completado' && lectura.cuestionarioEvaluado && lectura.cuestionarioId && (
                  <Button onClick={() => navigate(`/estudiante/cuestionario/${lectura.id}/resultados?cuestionarioId=${lectura.cuestionarioId}`)} variant="tertiary" className="w-full font-bold h-12 text-lg rounded-[16px] shadow-md hover:scale-[1.02]">
                    <CheckCircle className="w-5 h-5 mr-2" /> Ver Resultados
                  </Button>
                )}

                <div className="flex gap-2 mt-2">
                  {lectura.estado === 'completado' && (
                    <Button onClick={() => onComenzarLectura(lectura.id)} variant="outline" className="flex-1 font-bold h-10 rounded-[12px] border-2">
                      <RefreshCcw className="w-4 h-4 mr-2" /> Releer
                    </Button>
                  )}
                  {lectura.cuestionarioEvaluado && (
                    <Button onClick={() => navigate(`/estudiante/lectura/${lectura.id}/historial`)} variant="outline" className="flex-1 font-bold h-10 rounded-[12px] border-2">
                      <History className="w-4 h-4 mr-2" /> Historial
                    </Button>
                  )}
                </div>

                <button onClick={() => onEliminarLectura(lectura.id)} className="mt-2 text-sm text-slate-400 hover:text-red-500 font-bold transition-colors flex items-center justify-center gap-1 py-1">
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

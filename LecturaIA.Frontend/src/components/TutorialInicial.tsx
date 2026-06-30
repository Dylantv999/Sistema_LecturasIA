import { Joyride, STATUS } from 'react-joyride';
import type { Step } from 'react-joyride';
import { useState } from 'react';
import { ayudaService } from '../services/ayudaService';

interface PasoTutorial {
  target: string;
  numero: number;
  titulo: string;
  descripcion: string;
  imagen?: string;
}

interface TutorialInicialProps {
  pasos: PasoTutorial[];
  onCompletar: () => void;
  onOmitir: () => void;
  tipoUsuario: 'Estudiante' | 'Docente' | 'Administrador';
}

export default function TutorialInicial({ pasos, onCompletar, onOmitir, tipoUsuario }: TutorialInicialProps) {
  const [run, setRun] = useState(true);

  // Mapeamos los pasos antiguos al formato que necesita Joyride
  const joyrideSteps: Step[] = pasos.map((paso) => ({
    target: paso.target || 'body',
    content: (
      <div className="space-y-3 p-1">
        <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{paso.titulo}</h3>
        <p className="text-sm font-medium text-slate-600 leading-relaxed">{paso.descripcion}</p>
      </div>
    ),
    placement: paso.target === 'body' ? 'center' : 'auto',
    disableBeacon: true,
    showProgress: true,
    showSkipButton: true,
  } as any));

  const handleJoyrideCallback = async (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      try {
        await ayudaService.marcarTutorialVisto();
        if (status === STATUS.SKIPPED) {
          onOmitir();
        } else {
          onCompletar();
        }
      } catch (error) {
        console.error('Error al guardar estado del tutorial', error);
        onCompletar();
      }
    }
  };

  const primaryColor = tipoUsuario === 'Estudiante' ? '#10b981' : '#4f46e5'; // Emerald o Indigo

  const joyrideProps: any = {
    steps: joyrideSteps,
    run: run,
    continuous: true,
    scrollToFirstStep: true,
    callback: handleJoyrideCallback,
    styles: {
      options: {
        zIndex: 100000,
        primaryColor: primaryColor,
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        arrowColor: '#ffffff',
        overlayColor: 'rgba(15, 23, 42, 0.75)',
      },
      tooltip: {
        borderRadius: '20px',
        padding: '20px',
        border: '2px solid #f1f5f9',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      buttonNext: {
        backgroundColor: primaryColor,
        borderRadius: '12px',
        padding: '12px 20px',
        fontWeight: 'bold',
        fontSize: '13px',
      },
      buttonBack: {
        marginRight: 10,
        color: '#64748b',
        fontWeight: 'bold',
        fontSize: '13px',
      },
      buttonSkip: {
        color: '#94a3b8',
        fontWeight: 'bold',
        fontSize: '13px',
      },
      tooltipContainer: {
        textAlign: 'left',
      },
    },
    locale: {
      back: 'Atrás',
      close: 'Cerrar',
      last: '¡Comenzar!',
      next: 'Siguiente',
      skip: 'Saltar',
    }
  };

  return <Joyride {...joyrideProps} />;
}

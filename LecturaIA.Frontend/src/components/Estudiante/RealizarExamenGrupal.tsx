import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack
} from '@mui/material';
import { PlayArrow, Send, ChevronLeft, MenuBook, AccessTime, AssignmentTurnedIn, Circle } from '@mui/icons-material';

interface AsignacionExamen {
  id: number;
  estado: string;
  fechaAsignacion: string;
  examen: {
    id: number;
    titulo: string;
    descripcion?: string;
    fechaCreacion: string;
    fechaLimite?: string;
  };
  lectura: {
    id: number;
    titulo: string;
    contenido: string;
  };
  cuestionario: {
    id: string;
    cantidadPreguntas: number;
  };
}

export default function RealizarExamenGrupal() {
  const { asignacionId } = useParams<{ asignacionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asignacion, setAsignacion] = useState<AsignacionExamen | null>(null);
  const [sesionLecturaId, setSesionLecturaId] = useState<string | null>(null);
  const [cuestionarioId, setCuestionarioId] = useState<string | null>(null);
  const [vistaActual, setVistaActual] = useState<'inicio' | 'lectura' | 'cuestionario'>('inicio');
  const [tiempoLectura, setTiempoLectura] = useState(0); // Timer en segundos

  useEffect(() => {
    cargarDatosExamen();
  }, [asignacionId]);

  // Timer de lectura
  useEffect(() => {
    if (vistaActual !== 'lectura') return;

    const intervalo = setInterval(() => {
      setTiempoLectura(prev => prev + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [vistaActual]);

  const cargarDatosExamen = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/examengrupales/asignacion/${asignacionId}`);
      setAsignacion(response.data);

      // Si ya está en progreso, cargar el cuestionario personal del estudiante
      if (response.data.estado === 'En Progreso' && response.data.sesionLecturaId) {
        setSesionLecturaId(response.data.sesionLecturaId);
        setCuestionarioId(response.data.cuestionario.id);
        setVistaActual('cuestionario');
      }
    } catch (err: any) {
      console.error('Error al cargar examen:', err);
      setError(err.response?.data?.mensaje || 'Error al cargar el examen');
    } finally {
      setLoading(false);
    }
  };

  const iniciarExamen = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post(`/examengrupales/iniciar/${asignacionId}`, {});
      setSesionLecturaId(response.data.sesionLecturaId);
      setCuestionarioId(response.data.cuestionarioId);
      setVistaActual('lectura');
    } catch (err: any) {
      console.error('Error al iniciar examen:', err);
      setError(err.response?.data?.mensaje || 'Error al iniciar el examen');
    } finally {
      setLoading(false);
    }
  };

  const irACuestionario = async () => {
    if (cuestionarioId && sesionLecturaId && asignacion) {
      try {
        // Actualizar tiempo de lectura en la sesión
        const tiempoMinutos = tiempoLectura / 60;
        await api.patch(
          `/sesioneslectura/${sesionLecturaId}/tiempo`,
          { tiempoLecturaMinutos: tiempoMinutos }
        );
      } catch (error) {
        console.error('Error al actualizar tiempo de lectura:', error);
        // Continuar de todas formas
      }

      // Redirigir al cuestionario normal usando la sesión creada
      navigate(`/estudiante/cuestionario/${asignacion.lectura.id}/responder?cuestionarioId=${cuestionarioId}`);
    }
  };

  const formatearTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const volverAExamenes = () => {
    navigate('/estudiante/examenes');
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" gap={2} justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: '#f8fafc' }}>
        <CircularProgress size={45} thickness={4} />
        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          Cargando detalles de la evaluación...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 4 }}>
        <Container maxWidth="md">
          <Alert severity="error" variant="filled" onClose={() => setError(null)} sx={{ borderRadius: 3 }}>
            {error}
          </Alert>
          <Box mt={3}>
            <Button variant="outlined" color="inherit" onClick={volverAExamenes} startIcon={<ChevronLeft />} sx={{ borderRadius: 2, textTransform: 'none' }}>
              Volver a Exámenes
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!asignacion) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 4 }}>
        <Container maxWidth="md">
          <Alert severity="warning" variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
            No se encontró el examen asignado.
          </Alert>
        </Container>
      </Box>
    );
  }

  // Vista de inicio
  if (vistaActual === 'inicio') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 5 }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <AssignmentTurnedIn color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h4" component="h1" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.02em' }}>
                {asignacion.examen.titulo}
              </Typography>
            </Stack>

            {asignacion.examen.descripcion && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, mb: 3, lineHeight: 1.6 }}>
                {asignacion.examen.descripcion}
              </Typography>
            )}

            <Divider sx={{ my: 3, borderColor: '#edf2f7' }} />

            {/* Tarjeta de Información Interna */}
            <Box sx={{ p: 3, bgcolor: '#f1f5f9', borderRadius: 3, border: '1px solid #e2e8f0', mb: 4 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <MenuBook sx={{ fontSize: 18 }} /> Ficha Técnica de la Evaluación
              </Typography>

              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
                <Box>
                  <Typography variant="caption" color="text.disabled" fontWeight={700} display="block">LECTURA REQUERIDA</Typography>
                  <Typography variant="body1" fontWeight={600} color="text.primary">{asignacion.lectura.titulo}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.disabled" fontWeight={700} display="block">EVALUACIÓN</Typography>
                  <Typography variant="body1" fontWeight={600} color="primary.main">{asignacion.cuestionario.cantidadPreguntas} preguntas reactivas</Typography>
                </Box>
                {asignacion.examen.fechaLimite && (
                  <Box gridColumn={{ sm: 'span 2' }}>
                    <Typography variant="caption" color="error" fontWeight={700} display="block">FECHA LÍMITE DE ENTREGA</Typography>
                    <Typography variant="body2" fontWeight={600} color="error.main">
                      {new Date(asignacion.examen.fechaLimite).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Instrucciones Estilizadas */}
            <Alert severity="info" variant="outlined" sx={{ mb: 4, borderRadius: 3, bgcolor: '#f0fdf4', borderColor: '#bbf7d0', '& .MuiAlert-icon': { color: '#16a34a' } }}>
              <Typography variant="subtitle2" fontWeight={700} color="#15803d" sx={{ mb: 1 }}>
                Instrucciones del Entorno Virtual:
              </Typography>
              <List dense sx={{ p: 0 }}>
                <ListItem sx={{ p: 0, pb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 22 }}><Circle sx={{ fontSize: 6, color: '#16a34a' }} /></ListItemIcon>
                  <ListItemText primary="Analiza la lectura detenidamente. El sistema registrará tu tiempo de retención." primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                </ListItem>
                <ListItem sx={{ p: 0, pb: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 22 }}><Circle sx={{ fontSize: 6, color: '#16a34a' }} /></ListItemIcon>
                  <ListItemText primary="Una vez pases al cuestionario, no podrás regresar a visualizar el texto." primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                </ListItem>
                <ListItem sx={{ p: 0 }}>
                  <ListItemIcon sx={{ minWidth: 22 }}><Circle sx={{ fontSize: 6, color: '#16a34a' }} /></ListItemIcon>
                  <ListItemText primary="Asegúrate de contar con una conexión a internet estable antes de iniciar." primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
                </ListItem>
              </List>
            </Alert>

            <Box display="flex" gap={2} justifyContent="space-between" flexDirection={{ xs: 'column-reverse', sm: 'row' }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={volverAExamenes}
                startIcon={<ChevronLeft />}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, px: 3, borderColor: '#cbd5e1' }}
              >
                Volver a Exámenes
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={iniciarExamen}
                startIcon={<PlayArrow />}
                disabled={loading}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 4, boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)' }}
              >
                {loading ? 'Iniciando...' : 'Iniciar Examen'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Vista de lectura
  if (vistaActual === 'lectura') {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 5 }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Cronómetro Superior Remasterizado */}
            <Box
              sx={{
                mb: 4,
                p: 2,
                bgcolor: '#0f172a',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <Box display="flex" alignItems="center" gap={1} sx={{ color: '#94a3b8' }}>
                <AccessTime fontSize="small" sx={{ color: '#38bdf8' }} />
                <Typography variant="body2" fontWeight={600} sx={{ color: '#f1f5f9' }}>
                  Tiempo activo de lectura
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 800 }}>
                {formatearTiempo(tiempoLectura)}
              </Typography>
            </Box>

            <Typography variant="h4" component="h2" fontWeight={800} color="primary.main" sx={{ mb: 1, letterSpacing: '-0.01em' }}>
              {asignacion.lectura.titulo}
            </Typography>

            <Divider sx={{ my: 2.5, borderColor: '#edf2f7' }} />

            {/* Contenedor del Texto de Lectura Ergonómico */}
            <Box
              sx={{
                p: { xs: 2.5, sm: 4 },
                bgcolor: '#f1f5f9',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                my: 3
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-line',
                  lineHeight: 1.9,
                  fontSize: '1.125rem',
                  color: '#1e293b',
                  fontFamily: 'Georgia, serif' // Fuente serif perfecta para lecturas largas
                }}
              >
                {asignacion.lectura.contenido}
              </Typography>
            </Box>

            <Divider sx={{ my: 3, borderColor: '#edf2f7' }} />

            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                size="large"
                onClick={irACuestionario}
                endIcon={<Send />}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 4, py: 1.2, boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)' }}
              >
                Ir al Cuestionario
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Vista de cuestionario - redirige automáticamente
  if (vistaActual === 'cuestionario' && cuestionarioId && asignacion) {
    setTimeout(() => {
      navigate(`/estudiante/cuestionario/${asignacion.lectura.id}/responder?cuestionarioId=${cuestionarioId}`);
    }, 100);

    return (
      <Box display="flex" flexDirection="column" gap={2} justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: '#f8fafc' }}>
        <CircularProgress size={45} thickness={4} />
        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          Redirigiendo al panel de preguntas...
        </Typography>
      </Box>
    );
  }

  return null;
}
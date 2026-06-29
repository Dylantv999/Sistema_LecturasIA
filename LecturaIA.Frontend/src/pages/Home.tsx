import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-sky-900 mb-4">LecturaIA</h1>
          <p className="text-xl text-sky-800">Sistema Educativo de Comprensión Lectora</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Acceso para Estudiantes */}
          <div className="bg-white rounded-3xl shadow-lg p-10 transform transition hover:scale-105 border border-sky-100 flex flex-col items-center">
            <div className="text-center mb-6">
              <div className="w-36 h-36 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden bg-sky-100 border-4 border-white shadow-md">
                <img
                  src="/estudiante.png"
                  alt="Estudiante"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to SVG icon if image not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <svg class="w-20 h-20 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    `;
                  }}
                />
              </div>
              <h2 className="text-3xl font-extrabold text-sky-950 mb-3">Estudiantes</h2>
              <p className="text-lg text-sky-800 mb-8 max-w-sm">Accede a tus actividades de comprensión lectora y mejora tus habilidades.</p>
            </div>
            <button
              onClick={() => navigate('/estudiante')}
              className="w-full bg-sky-600 text-white py-4 px-8 rounded-full font-bold text-lg hover:bg-sky-700 transition shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-300"
            >
              Acceso para Estudiantes
            </button>
          </div>

          {/* Acceso para Docentes */}
          <div className="bg-white rounded-3xl shadow-lg p-10 transform transition hover:scale-105 border border-sky-100 flex flex-col items-center">
            <div className="text-center mb-6">
              <div className="w-36 h-36 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden bg-sky-100 border-4 border-white shadow-md">
                <img
                  src="/docente.png"
                  alt="Docente"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to SVG icon if image not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <svg class="w-20 h-20 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    `;
                  }}
                />
              </div>
              <h2 className="text-3xl font-extrabold text-sky-950 mb-3">Docentes</h2>
              <p className="text-lg text-sky-800 mb-8 max-w-sm">Gestiona tus estudiantes, asigna actividades y sigue su progreso.</p>
            </div>
            <button
              onClick={() => navigate('/docente')}
              className="w-full bg-sky-600 text-white py-4 px-8 rounded-full font-bold text-lg hover:bg-sky-700 transition shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-300"
            >
              Acceso para Docentes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
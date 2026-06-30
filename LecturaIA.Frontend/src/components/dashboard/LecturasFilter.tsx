import { Search, Filter, BookType } from 'lucide-react';

interface LecturasFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterTipo: string;
  setFilterTipo: (tipo: string) => void;
  filterNivel: string;
  setFilterNivel: (nivel: string) => void;
  onGenerarLectura?: () => void; // Made optional since it's in the top banner now
}

export default function LecturasFilter({
  searchTerm,
  setSearchTerm,
  filterTipo,
  setFilterTipo,
  filterNivel,
  setFilterNivel
}: LecturasFilterProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-center">
      {/* Buscador */}
      <div className="flex-1 w-full">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            placeholder="Buscar lecturas divertidas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold rounded-[20px] focus:outline-none focus:border-primary focus:bg-white transition-all shadow-inner text-lg placeholder:text-slate-400 placeholder:font-medium"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        {/* Filtro por tipo */}
        <div className="relative flex-1 sm:flex-none sm:w-[220px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <BookType className="w-5 h-5" />
          </div>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold rounded-[20px] focus:outline-none focus:border-secondary focus:bg-white transition-all shadow-inner appearance-none cursor-pointer"
          >
            <option value="todos">Todos los Tipos</option>
            <option value="Narrativa">Narrativa</option>
            <option value="Descriptiva">Descriptiva</option>
            <option value="Argumentativa">Argumentativa</option>
            <option value="Expositiva">Expositiva</option>
            <option value="Informativa">Informativa</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* Filtro por longitud */}
        <div className="relative flex-1 sm:flex-none sm:w-[220px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Filter className="w-5 h-5" />
          </div>
          <select
            value={filterNivel}
            onChange={(e) => setFilterNivel(e.target.value)}
            className="w-full pl-12 pr-10 py-4 bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold rounded-[20px] focus:outline-none focus:border-secondary focus:bg-white transition-all shadow-inner appearance-none cursor-pointer"
          >
            <option value="todos">Cualquier Longitud</option>
            <option value="Corta">Corta</option>
            <option value="Mediana">Mediana</option>
            <option value="Larga">Larga</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

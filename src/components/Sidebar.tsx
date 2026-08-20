import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { LayoutDashboard, CheckSquare, Calendar, FolderKanban, Users, Settings, Power, ClipboardList, User, Car, Route, Map, Calculator } from 'lucide-react';
import { cn } from '../lib/utils';
// import { useNavigate } from 'react-router-dom';

const sidebarItemVariants = cva(
  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group',
  {
    variants: {
      variant: {
        default: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30',
        active: 'text-blue-400 bg-blue-500/10 font-semibold border-r-2 border-blue-500 rounded-r-none lg:rounded-xl lg:border-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface SidebarItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarItemVariants> {  
  icon: React.ComponentType<import("lucide-react").LucideProps>; 
  children: React.ReactNode;
}

const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ className, variant, icon: Icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(sidebarItemVariants({ variant, className }))}
        {...props}
      >      
        {Icon && <Icon size={18} />}
        <span>{children}</span>
      </button>
    );
  },
);
SidebarItem.displayName = 'SidebarItem';


export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
}

export default function SidebarComponent({ 
  currentPath = '/home', 
  onNavigate, 
  onLogout 
}: SidebarProps) {
  
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700/70 min-h-screen flex flex-col justify-between p-4 font-sans text-white shadow-lg shadow-slate-700/40">
      <div>
        <div className="flex items-center gap-3 px-2 py-4 mb-1">
          <div className="w-9 h-9 bg-[#4531f7] rounded-xl flex items-center justify-center">
            <Calculator size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight text-slate-100">Calculadora de Trajeto</h2>
            <p className="text-[10px] text-slate-500">Gestão de Atividades</p>
          </div>
        </div>
        <hr className="border-slate-600/60 mb-3"/>

        {/* PRINCIPAL */}
        <div className="space-y-1 mb-6">
          <p className="text-[10px] font-bold tracking-wider text-slate-500 px-3 mb-2 uppercase">Principal</p>
          <SidebarItem 
            icon={LayoutDashboard} 
            variant={currentPath === '/home' ? 'active' : 'default'}
            onClick={() => onNavigate?.('/home')}
          >
            Início
          </SidebarItem>
          <SidebarItem 
            icon={Car} 
            variant={currentPath === '/tasks' ? 'active' : 'default'}
            onClick={() => onNavigate?.('/tasks')}
          >
            Veículos
          </SidebarItem>
          <SidebarItem 
            icon={Route} 
            variant={currentPath === '/my-week' ? 'active' : 'default'}
            onClick={() => onNavigate?.('/my-week')}
          >
            Rotas
          </SidebarItem>
          <SidebarItem 
            icon={Map} 
            variant={currentPath === '/projects' ? 'active' : 'default'}
            onClick={() => onNavigate?.('/projects')}
          >
            Mapa
          </SidebarItem>
        </div>

        {/* ADM */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-wider text-slate-500 px-3 mb-2 uppercase">Administração</p>
          <SidebarItem 
            icon={Users} 
            variant={currentPath === '/users' ? 'active' : 'default'}
            onClick={() => onNavigate?.('/users')}
          >
            Usuário
          </SidebarItem>
          <SidebarItem 
            icon={Settings} 
            variant={currentPath === '/settings' ? 'active' : 'default'}
            onClick={() => onNavigate?.('/settings')}
          >
            Configurações
          </SidebarItem>
        </div>
      </div>

      {/* RODAPÉ */}
      <div className="border-t border-slate-600/60 pt-4 flex items-center justify-between px-2 group">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center font-bold text-xs border border-blue-500/20">
          <User/>            
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Thais</h4>
            <p className="text-[10px] text-slate-500">Administrador</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          type="button"
          title='Sair'
          className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800/30"
        >
          <Power size={16} className='text-[#9e2b2b]' />
        </button>
      </div>
    </aside>
  );
}

export { SidebarComponent as Sidebar, SidebarItem };
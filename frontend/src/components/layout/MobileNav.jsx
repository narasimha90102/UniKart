import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageCircle, PlusCircle, User } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export function MobileNav() {
  const location = useLocation();
  const { totalUnreadMessages } = useNotifications();
  
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/dashboard?searchMode=true', icon: Search },
    { name: 'Sell', path: '/sell', icon: PlusCircle, highlight: true },
    { name: 'Chat', path: '/dashboard/chat', icon: MessageCircle, badge: totalUnreadMessages },
    { name: 'Account', path: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-6 z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/dashboard/profile' && location.pathname.startsWith('/dashboard') && !location.pathname.includes('/chat') && !location.pathname.includes('/notifications'));
          
          if (item.highlight) {
            return (
              <Link key={item.name} to={item.path} className="flex flex-col items-center -mt-8 bg-primary rounded-full p-4 shadow-lg shadow-primary/20 border-4 border-white transition-transform active:scale-95">
                <Icon className="w-6 h-6 text-white" />
              </Link>
            );
          }

          return (
            <Link key={item.name} to={item.path} className={`relative flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`}>
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current opacity-20' : ''}`} />
              <Icon className="w-6 h-6 absolute" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.name}</span>
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, Home, Search, PlusCircle, User, LogOut, Map, Package, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const MainLayout = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('isDark');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleDarkModeToggle = () => {
    setIsDark(prev => {
      const newState = !prev;
      localStorage.setItem('isDark', JSON.stringify(newState));
      return newState;
    });
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <Home className="mr-2 h-4 w-4" /> },
    { path: '/lost-items', label: 'Lost Items', icon: <Package className="mr-2 h-4 w-4" /> },
    { path: '/found-items', label: 'Found Items', icon: <PackageOpen className="mr-2 h-4 w-4" /> },
    { path: '/create-listing', label: 'Create Listing', icon: <PlusCircle className="mr-2 h-4 w-4" /> },
    { path: '/profile', label: 'Profile', icon: <User className="mr-2 h-4 w-4" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">FindIt</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lost & Found App</p>
        </div>
        
        <Separator />
        
        <div className="flex-1 overflow-auto py-2">
          <nav className="px-4 space-y-1">
            {navItems.map(item => (
              <NavLink 
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive 
                      ? 'bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400' 
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleDarkModeToggle}
          >
            {isDark ? (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </>
            )}
          </Button>
          
          <div className="mt-4 flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">john@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 w-full">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">FindIt</h1>
        <Button variant="outline" size="icon" onClick={handleDarkModeToggle}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
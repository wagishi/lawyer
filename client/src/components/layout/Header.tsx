import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const isActive = (path: string) => {
    return location === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-primary font-bold text-2xl font-serif">
            Legal<span className="text-accent">Connect</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className={`${isActive('/') ? 'text-primary' : 'text-secondary'} hover:text-primary transition duration-300`}>
            Home
          </Link>
          <Link href="/find-lawyers" className={`${isActive('/find-lawyers') ? 'text-primary' : 'text-secondary'} hover:text-primary transition duration-300`}>
            Find Lawyers
          </Link>
          <Link href="/resources" className={`${isActive('/resources') ? 'text-primary' : 'text-secondary'} hover:text-primary transition duration-300`}>
            Resources
          </Link>
          <Link href="/ai-consultation" className={`${isActive('/ai-consultation') ? 'text-primary' : 'text-secondary'} hover:text-primary transition duration-300`}>
            AI Consultation
          </Link>
          <Link href="/news" className={`${isActive('/news') ? 'text-primary' : 'text-secondary'} hover:text-primary transition duration-300`}>
            News
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <Link href="/dashboard" className="bg-primary text-white rounded-md px-4 py-2 hover:bg-blue-700 transition duration-300">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="bg-white text-primary border border-primary rounded-md px-4 py-2 hover:bg-primary hover:text-white transition duration-300">
                Sign In
              </Link>
              <Link href="/register" className="bg-primary text-white rounded-md px-4 py-2 hover:bg-blue-700 transition duration-300">
                Sign Up
              </Link>
            </>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-secondary"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-6 shadow-lg">
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className={`${isActive('/') ? 'text-primary' : 'text-secondary'} hover:text-primary transition duration-300`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link 
              href="/find-lawyers" 
              className={`${isActive('/find-lawyers') ? 'text-primary' : 'text-secondary'} hover:text-primary transition duration-300`}
              onClick={closeMenu}
            >
              Find Lawyers
            </Link>
            <Link 
              href="/resources" 
              className={`${isActive('/resources') ? 'text-primary' : 'text-secondary'} hover:text-primary transition duration-300`}
              onClick={closeMenu}
            >
              Resources
            </Link>
            <Link 
              href="/ai-consultation" 
              className={`${isActive('/ai-consultation') ? 'text-primary' : 'text-secondary'} hover:text-primary transition duration-300`}
              onClick={closeMenu}
            >
              AI Consultation
            </Link>
            <Link 
              href="/news" 
              className={`${isActive('/news') ? 'text-primary' : 'text-secondary'} hover:text-primary transition duration-300`}
              onClick={closeMenu}
            >
              News
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

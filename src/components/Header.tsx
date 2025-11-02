import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setOpenSubmenu(null);
  }, [location]);

  const navigation = [
    { name: 'Home', href: '/' },
    {
      name: 'Services',
      href: '/services',
      submenu: [
        { name: 'Express Delivery', href: '/services#express' },
        { name: 'Secure Service', href: '/services#secure' },
        { name: 'International Shipping', href: '/services#international' },
        { name: 'Business Solutions', href: '/services#business' },
      ]
    },
    { name: 'Tracking', href: '/tracking' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const contactInfo = [
    { icon: Phone, text: '‪+447876820984' },
    { icon: Mail, text: 'support@ecwservices.sbs' },
    { icon: MapPin, text: ' 49 Featherstone St, London EC 1Y 8SY United Kingdom' },
  ];

  return (
    <>
      {/* Top Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-blue-900 text-blue-300 text-sm hidden md:block"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <item.icon className="w-4 h-4 text-blue-300" />
                  <span className="text-blue-200">{item.text}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-200">24/7 Support</span>
              <Button variant="outline" size="sm" className="bg-blue-800 text-white border-blue-700 hover:bg-blue-700">
                <a href="/contact">Get Quote</a>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Header */}
      <motion.header
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-xl font-bold",
                    isScrolled ? "text-slate-900" : "text-blue-900"
                  )}>
                     EC WorldWide
                  </span>
                  <span className={cn(
                    "text-sm font-medium",
                    isScrolled ? "text-blue-900" : "text-blue-900"
                  )}>
                    Service
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  {item.submenu ? (
                    <div
                      onMouseEnter={() => setOpenSubmenu(item.name)}
                      onMouseLeave={() => setOpenSubmenu(null)}
                      className="flex items-center space-x-1 cursor-pointer"
                    >
                      <Link
                        to={item.href}
                        className={cn(
                          "font-semibold transition-colors hover:text-blue-600",
                          location.pathname === item.href
                            ? "text-blue-600"
                            : isScrolled
                              ? "text-slate-700"
                              : "text-blue-400"
                        )}
                      >
                        {item.name}
                      </Link>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        openSubmenu === item.name ? "rotate-180" : "",
                        isScrolled ? "text-slate-700" : "text-blue-400"
                      )} />
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "font-semibold transition-colors hover:text-blue-600",
                        location.pathname === item.href
                          ? "text-blue-600"
                          : isScrolled
                            ? "text-slate-700"
                            : "text-blue-400"
                      )}
                    >
                      {item.name}
                    </Link>
                  )}

                  {/* Submenu Dropdown */}
                  {item.submenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: openSubmenu === item.name ? 1 : 0,
                        y: openSubmenu === item.name ? 0 : 10
                      }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2"
                      style={{ pointerEvents: openSubmenu === item.name ? 'auto' : 'none' }}
                    >
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              {!user || !isAdmin ? (
                <Button
                  variant={isScrolled ? "outline" : "secondary"}
                  className={cn(
                    "transition-all",
                    isScrolled
                      ? "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  )}
                >
                  <a href="/tracking">Track Package</a>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className={cn(
                    "transition-all",
                    isScrolled
                  )}
                  onClick={signOut}>
                  Sign Out
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "lg:hidden p-2 rounded-lg transition-colors",
                  isScrolled
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-white hover:bg-white/10"
                )}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-slate-200"
            >
              <div className="container mx-auto px-4 py-6">
                <nav className="space-y-4">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.submenu ? (
                        <div>
                          <button
                            onClick={() => setOpenSubmenu(openSubmenu === item.name ? null : item.name)}
                            className="flex items-center justify-between w-full py-3 text-left font-semibold text-slate-900"
                          >
                            <span>{item.name}</span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform",
                                openSubmenu === item.name ? "rotate-180" : ""
                              )}
                            />
                          </button>

                          <AnimatePresence>
                            {openSubmenu === item.name && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="pl-4 space-y-2"
                              >
                                {item.submenu.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    to={subItem.href}
                                    className="block py-2 text-slate-600 hover:text-blue-600"
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          className={cn(
                            "block py-3 font-semibold transition-colors",
                            location.pathname === item.href
                              ? "text-blue-600"
                              : "text-slate-900 hover:text-blue-600"
                          )}
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Mobile Contact Info */}
                <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 text-slate-600">
                      <item.icon className="w-4 h-4" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Mobile CTA Buttons */}
                <div className="mt-6 space-y-3">
                  {!user || !isAdmin ? (<Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    <a href="/tracking">Track Package</a>
                  </Button>) : (
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white" onClick={signOut}>Sign Out</Button>
                  )}
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    <a href="/contact">Get Started</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Header;
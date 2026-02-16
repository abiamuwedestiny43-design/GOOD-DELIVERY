import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Shield, Clock, MapPin, Search, ArrowRight, Star, Users, Package, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrack = () => {
    if (trackingNumber.trim()) {
      navigate(`/tracking?number=${trackingNumber}`);
    }
  };

  const stats = [
    { number: '50K+', label: 'Packages Delivered', icon: Package },
    { number: '98%', label: 'Success Rate', icon: Star },
    { number: '24/7', label: 'Customer Support', icon: Users },
    { number: '500+', label: 'Global Locations', icon: MapPin }
  ];

  const services = [
    {
      icon: Truck,
      title: 'Express Delivery',
      description: 'Fast and reliable delivery services with real-time tracking',
      color: 'from-emerald-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Secure Handling',
      description: 'Advanced security measures for your valuable packages',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Clock,
      title: '24/7 Monitoring',
      description: 'Round-the-clock package monitoring and updates',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  // --- About Us Image Slider ---
  const slides = [
    "/images/about-van.png",
    "/images/about-team.png",
    "/images/about-packages.png"
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // --- Hero Background Slider ---
  const heroSlides = [
    "/images/hero-pearl-1.png",
    "/images/hero-pearl-2.png",
    "/images/hero-pearl-3.png",
    "/images/hero-pearl-4.png",
    "/images/hero-pearl-5.png",
    "/images/hero-pearl-6.png",
    "/images/hero-pearl-7.png",
    "/images/hero-pearl-8.png",
    "/images/hero-pearl-9.png",
    "/images/hero-ship.png"
  ];
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // --- Air Freight Slider ---
  const airSlides = [
    "/images/air-white-1.png",
    "/images/air-white-2.png",
    "/images/air-white-3.png",
    "/images/air-white-4.png",
    "/images/air-white-5.png",
    "/images/air-white-6.png",
    "/images/air-white-7.png",
    "/images/air-white-8.png",
    "/images/air-white-9.png",
    "/images/air-flight.png"
  ];
  const [currentAirSlide, setCurrentAirSlide] = useState(0);

  // Auto slide functionality
  useEffect(() => {
    const aboutInterval = setInterval(() => {
      nextSlide();
    }, 5000); // About Us: 5 seconds

    const heroInterval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000); // Hero: 4 seconds

    const airInterval = setInterval(() => {
      setCurrentAirSlide((prev) => (prev + 1) % airSlides.length);
    }, 4000); // Air Freight: 4 seconds

    return () => {
      clearInterval(aboutInterval);
      clearInterval(heroInterval);
      clearInterval(airInterval);
    };
  }, [airSlides.length, heroSlides.length, nextSlide]);

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Slider with Parallax effect */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <motion.div
              key={slide}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{
                scale: index === currentHeroSlide ? 1 : 1.1,
                opacity: index === currentHeroSlide ? 1 : 0
              }}
              transition={{
                opacity: { duration: 1, ease: "easeInOut" },
                scale: { duration: 4, ease: "linear" }
              }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide})` }}
            />
          ))}
        </div>

        {/* Multi-layered Overlays for Depth and Readability */}
        <div className="absolute inset-0 bg-emerald-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-emerald-950/30" />
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white space-y-8 px-4"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent drop-shadow-2xl"
          >
            GOOD DELIVERY
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto drop-shadow-lg"
          >
            Fast, reliable, and secure package delivery with real-time tracking
          </motion.p>

          {/* Tracking Input */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto shadow-2xl"
          >
            <h3 className="text-2xl font-semibold mb-6">Track Your Package</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-emerald-500"
                onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
              />
              <Button
                onClick={handleTrack}
                className="bg-gradient-to-r from-emerald-500 to-emerald-500 hover:from-emerald-600 hover:to-emerald-600 shadow-lg shadow-emerald-500/25"
              >
                <Search className="w-4 h-4 mr-2" />
                Track Now
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated background elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-24 left-10 text-emerald-400/10 pointer-events-none"
        >
          <Truck size={120} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-24 right-10 text-emerald-400/10 pointer-events-none"
        >
          <Package size={100} />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <stat.icon className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-emerald-950 mb-2">{stat.number}</h3>
                  <p className="text-slate-600">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-[#FDFDFD]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive Service solutions tailored to your needs
            </p>
          </motion.div>

          {/* Featured Air Freight Image Slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] md:h-[550px] mb-16 rounded-3xl overflow-hidden shadow-2xl group bg-white"
          >
            {airSlides.map((slide, index) => (
              <motion.div
                key={slide}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: index === currentAirSlide ? 1 : 0,
                  scale: index === currentAirSlide ? 1 : 1.05
                }}
                transition={{
                  opacity: { duration: 1, ease: "easeInOut" },
                  scale: { duration: 4, ease: "linear" }
                }}
                className="absolute inset-0"
              >
                <img
                  src={slide}
                  alt={`Air Freight ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/40 to-transparent flex flex-col justify-end p-8 md:p-12">
              <motion.div
                key={currentAirSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-xl"
              >
                <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">Elite Global Air Logistics</h3>
                <p className="text-lg md:text-xl text-emerald-100 mb-8 leading-relaxed">
                  Experience the pinnacle of speed with our dedicated white-glove air freight network. Reliable, transparent, and ultra-fast delivery options for your most critical assets.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/20 shadow-xl">
                    <Clock className="w-5 h-5 text-emerald-300" />
                    <span className="text-sm md:text-base font-semibold text-white">24h Express</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/20 shadow-xl">
                    <Shield className="w-5 h-5 text-emerald-300" />
                    <span className="text-sm md:text-base font-semibold text-white">High-Value Secure</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/20 shadow-xl">
                    <Package className="w-5 h-5 text-emerald-300" />
                    <span className="text-sm md:text-base font-semibold text-white">Global Reach</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 right-8 flex gap-2">
              {airSlides.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 transition-all duration-500 rounded-full ${index === currentAirSlide ? "w-8 bg-emerald-500" : "w-2 bg-white/30"
                    }`}
                />
              ))}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full border-0 bg-gradient-to-br from-slate-50 to-slate-100 hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-emerald-950 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 mb-6">
                      {service.description}
                    </p>
                    <Button variant="ghost" className="group-hover:text-emerald-600 transition-colors">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-4">
              About Us
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We are committed to redefining global Service through reliability, speed, and innovation.
            </p>
          </motion.div>

          {/* Image Slider - Fixed for responsiveness */}
          <div className="relative max-w-5xl mx-auto overflow-hidden rounded-[2.5rem] shadow-2xl border-8 border-white group">
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full">
              {slides.map((slide, index) => (
                <motion.div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <img
                    src={slide}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={index === currentSlide ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.5 }}
                      className="max-w-2xl"
                    >
                      <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                        {index === 0 && "Eco-Friendly Electric Fleet"}
                        {index === 1 && "Global Logistics Experts"}
                        {index === 2 && "Precision Package Handling"}
                      </h3>
                      <p className="text-lg md:text-xl text-emerald-100 drop-shadow-md">
                        {index === 0 && "Our 100% electric delivery vans ensure a cleaner future for our cities while maintaining lightning-fast delivery speeds."}
                        {index === 1 && "Our diverse team of over 5,000 professionals works around the clock across 40 countries to keep your business moving."}
                        {index === 2 && "Every parcel is handled with care using our state-of-the-art automated sorting systems and manual quality checks."}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-emerald-900" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-emerald-900" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`w-3 h-3 rounded-full transition-all ${currentSlide === index
                    ? "bg-emerald-600 scale-125"
                    : "bg-white/80 scale-100 hover:scale-110"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-600">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center text-white"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Ship?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their deliveries
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-emerald-600 hover:bg-slate-100"
            >
              <a href="/about">Get Started</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-emerald-600 hover:bg-white/10"
            >
              <a href="/contact">
                Contact Sales
              </a>
            </Button>
          </div>
        </motion.div>
      </section>
    </div >
  );
};

export default Home;
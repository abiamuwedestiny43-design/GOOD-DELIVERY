import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Truck, 
  Shield, 
  Clock, 
  Globe, 
  Package,
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  Building
} from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Truck,
      title: 'Express Delivery',
      description: 'Fast and reliable delivery services with real-time tracking',
      features: ['Next-day delivery', 'Real-time tracking', 'Dedicated support'],
      price: 'From $15',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Secure Service',
      description: 'Advanced security measures for valuable and sensitive packages',
      features: ['Insurance included', 'Tamper-proof packaging', '24/7 monitoring'],
      price: 'From $25',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      title: 'International Shipping',
      description: 'Seamless global shipping with customs clearance',
      features: ['Worldwide coverage', 'Customs handling', 'Multi-language support'],
      price: 'From $40',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Building,
      title: 'Business Solutions',
      description: 'Custom Service solutions for businesses of all sizes',
      features: ['Bulk discounts', 'Dedicated account manager', 'API integration'],
      price: 'Custom pricing',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const features = [
    {
      icon: Clock,
      title: '24/7 Operation',
      description: 'Round-the-clock service with instant support'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Quick package handling and dispatch'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Experienced Service professionals'
    },
    {
      icon: CheckCircle,
      title: 'Quality Guarantee',
      description: '100% satisfaction guarantee'
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Our Services
            </h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Comprehensive Service solutions designed to meet your every need. 
              From local deliveries to international shipping, we've got you covered.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      {service.title}
                    </h3>
                    
                    <p className="text-slate-600 mb-6">
                      {service.description}
                    </p>

                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-900 mb-3">Features:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-slate-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-slate-900">
                        {service.price}
                      </span>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose Us?</h2>
            <p className="text-xl text-slate-600">The features that set us apart from the competition</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-slate-50 rounded-2xl p-8 hover:bg-blue-50 transition-colors duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center text-white"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their Service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-slate-100"
            >
              Start Shipping
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Contact Sales
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Services;

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Target,
  Globe,
  Heart,
  Users,
  Award,
  Calendar,
  ArrowRight,
  Truck,
  Shield,
  Clock
} from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for perfection in every delivery'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Worldwide coverage with local expertise'
    },
    {
      icon: Heart,
      title: 'Care',
      description: 'Your packages are treated with utmost care'
    },
    {
      icon: Users,
      title: 'Teamwork',
      description: 'Collaborative approach for best results'
    }
  ];

  const milestones = [
    { year: '2018', event: 'Company Founded', icon: Calendar },
    { year: '2019', event: 'First 10K Packages', icon: Award },
    { year: '2020', event: 'Global Expansion', icon: Globe },
    { year: '2023', event: '500K+ Deliveries', icon: Truck }
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
              About  EC WorldWide Service
            </h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Delivering excellence since 2018. We're committed to providing the best logistics
              solutions with cutting-edge technology and unparalleled customer service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Story</h2>
              <p className="text-lg text-slate-600 mb-6">
                Founded in 2018,  EC WorldWide Service started with a simple mission: to make
                package delivery faster, safer, and more reliable. What began as a small local
                service has grown into a global logistics provider trusted by thousands.
              </p>
              <p className="text-lg text-slate-600 mb-8">
                Today, we leverage advanced technology, including real-time tracking and
                AI-powered routing, to ensure your packages arrive on time, every time.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Learn More About Us
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <CardContent className="p-6 text-center">
                    <Truck className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Fast Delivery</h3>
                    <p>Express shipping worldwide</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                  <CardContent className="p-6 text-center">
                    <Shield className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Secure</h3>
                    <p>Advanced security measures</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  <CardContent className="p-6 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">24/7 Support</h3>
                    <p>Always here to help</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                  <CardContent className="p-6 text-center">
                    <Globe className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Global</h3>
                    <p>Worldwide coverage</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Values</h2>
            <p className="text-xl text-slate-600">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <value.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-slate-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Journey</h2>
            <p className="text-xl text-slate-600">Key milestones in our growth story</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200" />
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`relative mb-12 flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
              >
                <div className="w-1/2">
                  <Card className="border-0 bg-slate-50 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <milestone.icon className="w-6 h-6 text-blue-600 mr-2" />
                        <span className="text-2xl font-bold text-blue-600">{milestone.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {milestone.event}
                      </h3>
                    </CardContent>
                  </Card>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg" />
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* WhatsApp Chat Button */}
      <a
        href="https://wa.me/‪+447876820984"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 z-50 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.52 3.48A11.78 11.78 0 0 0 12 0C5.37 0 0 5.37 0 12a11.9 11.9 0 0 0 1.64 6L0 24l6.26-1.64A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.17-1.23-6.17-3.48-8.52zM12 22c-1.91 0-3.73-.52-5.33-1.5l-.38-.23-3.73.98 1-3.64-.24-.38A10.05 10.05 0 0 1 2 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.94 9.94 0 0 1 22 12c0 5.52-4.48 10-10 10zm5.2-7.67c-.28-.14-1.65-.82-1.9-.91s-.44-.14-.62.14-.71.91-.87 1.1-.32.21-.6.07c-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93s-.02-.43.12-.57c.12-.12.28-.32.42-.49.14-.16.19-.28.28-.47.09-.18.05-.35-.02-.49-.07-.14-.62-1.48-.85-2.02-.22-.53-.45-.46-.62-.47h-.53c-.18 0-.49.07-.74.35s-.97.95-.97 2.31 1 .36 1.14.53c.14.18 1.34 2.06 3.25 2.89 1.91.83 1.91.55 2.25.52.35-.03 1.15-.47 1.31-.92.16-.46.16-.85.12-.92-.05-.07-.21-.14-.49-.28z" />
        </svg>
      </a>
    </div>
  );
};

export default About;

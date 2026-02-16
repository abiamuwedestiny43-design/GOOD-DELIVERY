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
      <section className="relative py-32 bg-emerald-950 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/2 -left-1/4 w-full h-full bg-emerald-600/20 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-emerald-600/20 blur-[120px] rounded-full"
          />
        </div>

        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest uppercase bg-emerald-600 rounded-full"
            >
              Established 2018
            </motion.span>
            <h1 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              Our Legacy of <br /> <span className="text-white">Trust</span>
            </h1>
            We don't just move packages; we move the world. GOOD DELIVERY is redefining the global logistics landscape through innovation, sustainability, and human connection.
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-8 leading-tight">
                Crafting the Future of <span className="text-emerald-600">Global Logistics</span>
              </h2>
              Founded in 2018, GOOD DELIVERY was born from a vision to eliminate the friction in global shipping. We believed that sending a package across the world should be as simple as sending a text message.
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-3xl font-bold text-emerald-600 mb-1">99.9%</h4>
                  <p className="text-slate-500 font-medium">Delivery Accuracy</p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-emerald-600 mb-1">24/7</h4>
                  <p className="text-slate-500 font-medium">Real-time Monitoring</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-slate-50">
                <img src="/images/about-van.png" alt="Our premium fleet" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent" />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl hidden md:block border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-950">Eco-Friendly Fleet</p>
                    <p className="text-slate-500 text-sm">100% Electric Vehicles</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mb-24">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-8 leading-tight">
                Our People Are Our <span className="text-emerald-600">Greatest Asset</span>
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Behind every successful delivery is a team of dedicated professionals. From our warehouse logisticians to our doorstep delivery experts, we invest in people who care about your cargo as much as you do.
              </p>
              <Button className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-lg rounded-full">
                Join Our Global Team
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-slate-50">
                <img src="/images/about-team.png" alt="Our professional team" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-10 -right-10 bg-emerald-600 p-8 rounded-3xl shadow-2xl hidden md:block text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <Users />
                  </div>
                  <div>
                    <p className="font-bold">5,000+ Experts</p>
                    <p className="text-emerald-100 text-sm">Working across 40 countries</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-emerald-950 mb-8 leading-tight">
                Uncompromising <span className="text-emerald-600">Quality Control</span>
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                We treat every package as a promise. Our high-tech sorting centers use advanced scanning and handle-with-care protocols to ensure that even the most fragile items reach their destination in pristine condition.
              </p>
              <Button variant="outline" className="h-14 px-8 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-lg rounded-full">
                Explore Our Solutions
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-slate-50">
                <img src="/images/about-packages.png" alt="Package handling excellence" className="w-full h-full object-cover" />
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
            <h2 className="text-4xl font-bold text-emerald-950 mb-4">Our Values</h2>
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
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <value.icon className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-emerald-950 mb-4">
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
            <h2 className="text-4xl font-bold text-emerald-950 mb-4">Our Journey</h2>
            <p className="text-xl text-slate-600">Key milestones in our growth story</p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-emerald-200" />
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
                        <milestone.icon className="w-6 h-6 text-emerald-600 mr-2" />
                        <span className="text-2xl font-bold text-emerald-600">{milestone.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-emerald-950 mb-2">
                        {milestone.event}
                      </h3>
                    </CardContent>
                  </Card>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-emerald-600 rounded-full border-4 border-white shadow-lg" />
                <div className="w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, Users, Utensils, ArrowRight, ShieldCheck } from "lucide-react";

const Landing: React.FC = () => {
  return (
    <div className="pt-16 min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
              Smart Solution to Reduce Food Waste
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold text-stone-900 leading-tight mb-6">
              Share Food, <br />
              <span className="text-emerald-600">Spread Love.</span>
            </h1>
            <p className="text-xl text-stone-600 mb-8 max-w-lg">
              Connecting restaurants, events, and individuals with volunteers to ensure no meal goes to waste. Join our mission to feed the hungry.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register?role=donor"
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200 flex items-center gap-2"
              >
                Register as Donor <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register?role=volunteer"
                className="px-8 py-4 bg-white text-stone-900 border border-stone-200 rounded-2xl font-bold hover:bg-stone-50 transition-all shadow-sm"
              >
                Join as Volunteer
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://picsum.photos/seed/foodshare/1200/800"
                alt="Community sharing food"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl z-20 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <Heart className="text-emerald-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">12,450+</p>
                <p className="text-stone-500 text-sm">Meals Shared</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Active Volunteers", value: "850+", icon: Users },
            { label: "NGO Partners", value: "45+", icon: ShieldCheck },
            { label: "Food Saved (kg)", value: "5,200", icon: Utensils },
            { label: "Cities Covered", value: "12", icon: Heart },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="text-emerald-600 w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-stone-900 mb-1">{stat.value}</p>
              <p className="text-stone-500 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-stone-900 mb-4">How It Works</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Our platform streamlines the process of food donation and distribution through a simple 3-step workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Donor Lists Food",
                desc: "Restaurants or individuals list excess food with details and location.",
                icon: Utensils,
              },
              {
                title: "Volunteer Accepts",
                desc: "Nearby volunteers get notified and accept the pickup request.",
                icon: Users,
              },
              {
                title: "Safe Delivery",
                desc: "Food is picked up and delivered to local NGOs or people in need.",
                icon: Heart,
              },
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                  <step.icon className="text-emerald-600 w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{step.title}</h3>
                <p className="text-stone-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

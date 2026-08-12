import { useState } from "react";
import { motion } from "motion/react";

const featuresData = [
  { 
    label: "Tailored Experiences", 
    desc: "Every detail is customized to match your unique preferences and style of travel.", 
    viewBox: "0 0 24 24", 
    paths: ["M13 10V3L4 14h7v7l9-11h-7z"] 
  },
  { 
    label: "Seamless Logistics", 
    desc: "From transport to ticketing, we handle everything so you can relax and enjoy.", 
    viewBox: "0 0 24 24", 
    paths: ["M13 10V3L4 14h7v7l9-11h-7z"] 
  },
  { 
    label: "Expert Guides", 
    desc: "Explore with passionate locals who share insider knowledge and hidden gems.", 
    viewBox: "0 0 24 24", 
    paths: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75"] 
  },
  { 
    label: "24/7 Support", 
    desc: "We're always available to ensure your journey is smooth and worry-free.", 
    viewBox: "0 0 24 24", 
    paths: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75"] 
  }
];

function FeatureCard({ f, index }: { f: (typeof featuresData)[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col items-start px-5 sm:px-6 py-6 sm:py-8 rounded-[24px] cursor-pointer select-none overflow-hidden z-10"
      style={{
        background: "rgba(255, 255, 255, 0.12)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.15)",
        willChange: "transform, opacity",
        z: 0
      }}
    >
      <div
        className="w-[42px] h-[42px] sm:w-[48px] sm:h-[48px] rounded-[14px] flex items-center justify-center mb-4 shrink-0 relative z-10 bg-white"
        style={{
          boxShadow: hovered ? "0 4px 20px rgba(255,255,255,0.4)" : "0 4px 14px rgba(0,0,0,0.1)",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "all 0.3s ease",
        }}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="#1e3a8a" viewBox={f.viewBox}>
          {f.paths.map((p, i) => <path key={i} d={p} />)}
        </svg>
      </div>
      
      <p
        className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-base sm:text-lg leading-tight transition-colors duration-200 relative z-10 text-white"
      >
        {f.label}
      </p>
      
      <p className="font-['Plus_Jakarta_Sans',sans-serif] text-[12px] sm:text-[14px] leading-relaxed sm:leading-6 mt-2 tracking-wide transition-colors duration-500 relative z-10 line-clamp-3 text-white/80">
        {f.desc}
      </p>

      <div
        className="absolute inset-0 rounded-[24px] pointer-events-none transition-opacity duration-300 z-0"
        style={{ background: `radial-gradient(circle at 70% 30%, rgba(255,255,255,0.08), transparent 70%)`, opacity: hovered ? 1 : 0 }}
      />
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-16 sm:py-20 px-4 sm:px-8 lg:px-14 max-w-6xl mx-auto">
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {featuresData.map((f, i) => <FeatureCard key={i} f={f} index={i} />)}
      </div>
    </section>
  );
}

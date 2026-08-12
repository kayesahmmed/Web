import { useState } from "react";
import { motion } from "motion/react";
import svgPaths from "../imports/Desktop/svg-rb00s3u9xu";

const holoPaths = [svgPaths.p217f8ec0, svgPaths.p3a837700, svgPaths.p17b36900, svgPaths.p36cb1f80, svgPaths.p3a356a80];
const featuresData = [
  { color: "#16CF83", shadow: "rgba(22,207,131,.35)",  label: "Anti-Ban",        desc: "Advanced protection system to keep your account safe",   viewBox: "55.8 45.5 28.4 35", paths: [svgPaths.p9056c00] },
  { color: "#A65FED", shadow: "rgba(166,95,237,.35)",  label: "ESP Radar",       desc: "Real-time enemy position tracking on minimap",           viewBox: "45.2 45.5 49.5 35", paths: [svgPaths.p34658080] },
  { color: "#FFB11A", shadow: "rgba(255,177,26,.35)",  label: "Auto Aim",        desc: "Smart auto-aim assist for faster eliminations",          viewBox: "60.3 45.5 19.5 35", paths: [svgPaths.p1a290900] },
  { color: "#00E5D1", shadow: "rgba(0,229,209,.35)",   label: "Speed Boost",     desc: "Enhanced movement speed for tactical advantage",         viewBox: "53 42 34 42",       paths: [svgPaths.p2627a300] },
  { color: "#EB29A4", shadow: "rgba(235,41,164,.35)",  label: "Aim Lock",        desc: "Lock onto targets with precision accuracy",             viewBox: "0 0 42 42",         paths: holoPaths },
  { color: "#2790FF", shadow: "rgba(39,144,255,.35)",  label: "Color Holograms", desc: "Multiple hologram colors to suit your style.",          viewBox: "0 0 42 42",         paths: holoPaths },
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
          boxShadow: hovered ? `0 4px 20px ${f.shadow}` : "0 4px 14px rgba(0,0,0,0.1)",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "all 0.3s ease",
        }}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill={f.color} viewBox={f.viewBox}>
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
        style={{ background: `radial-gradient(circle at 70% 30%, ${f.color}18, transparent 70%)`, opacity: hovered ? 1 : 0 }}
      />
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-16 sm:py-20 px-3 sm:px-8 lg:px-14 max-w-7xl mx-auto">
      <div className="text-center mb-10 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight text-white">Premium Features</h2>
        <p className="text-sm font-semibold max-w-xl mx-auto text-white/70">Everything you need to dominate the game.</p>
      </div>
      <div className="relative z-10 grid grid-cols-2 gap-3.5 sm:gap-7">
        {featuresData.map((f, i) => <FeatureCard key={i} f={f} index={i} />)}
      </div>
    </section>
  );
}

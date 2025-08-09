import { useEffect, useRef, useState } from "react";

interface ReactiveGlowProps {
  children: React.ReactNode;
  className?: string;
}

const ReactiveGlow = ({ children, className = "" }: ReactiveGlowProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${className}`}
      style={{
        "--glow-x": `${mousePosition.x}px`,
        "--glow-y": `${mousePosition.y}px`,
      } as React.CSSProperties}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-purple-900/20 dark:to-slate-800" />
      
      {/* Interactive glow effect */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(400px 400px at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.1), transparent 60%)`,
        }}
      />
      
      {/* Subtle animated border */}
      <div className="absolute inset-0 rounded-2xl border border-purple-200/30 dark:border-purple-800/30" />
      
      {/* Animated corner accents */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-purple-400/50 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-blue-400/50 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-pink-400/50 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-indigo-400/50 rounded-br-2xl" />
      
      {/* Content */}
      <div className="relative z-10 p-8">
        {children}
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ReactiveGlow;

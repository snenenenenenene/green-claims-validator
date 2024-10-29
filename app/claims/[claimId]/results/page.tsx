// app/questionnaire/results/page.tsx
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
import { useStores } from "@/hooks/useStores";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Clock,
  FileText,
  Leaf
} from 'lucide-react';

// ============= Type Definitions =============
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  category: string;
  description?: string;
  index: number;
}

interface InsightCardProps {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  impact: number;
  index: number;
}

interface TimelineItemProps {
  title: string;
  description: string;
  date: string;
}

// ============= Custom Hooks =============
/**
 * Custom hook for intersection observer to trigger animations
 * when elements come into view
 */
const useIntersectionObserver = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1, ...options });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [options]);

  return [elementRef, isVisible] as const;
};

// ============= UI Components =============

/**
 * Animated progress bar that follows scroll position
 */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-green-500 origin-left z-50"
      style={{ scaleX, willChange: "transform" }}
    />
  );
};

/**
 * Card component for displaying individual metrics
 * Features smooth hover animations and scroll-based reveal
 */
const MetricCard = ({ title, value, change, trend, category, description, index }: MetricCardProps) => {
  const [ref, isVisible] = useIntersectionObserver();

  // Smooth spring animation for Y transform
  const y = useSpring(0, {
    stiffness: 300,
    damping: 30
  });

  useEffect(() => {
    if (isVisible) {
      y.set(0);
    } else {
      y.set(50);
    }
  }, [isVisible, y]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1] // Custom easing for smooth animation
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)"
      }}
      className="relative overflow-hidden bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
      style={{
        willChange: "transform",
        translateY: y
      }}
    >
      {/* Gradient background effect */}
      <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 bg-gradient-to-br from-green-50 to-transparent rounded-full opacity-50" />

      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        {change && (
          <div className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
      <div className="mt-4 flex items-center gap-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${category === 'evidence' ? 'bg-blue-50 text-blue-600' :
          category === 'impact' ? 'bg-purple-50 text-purple-600' :
            'bg-emerald-50 text-emerald-600'
          }`}>
          {category}
        </span>
      </div>
    </motion.div>
  );
};

/**
 * Insight card component with severity indication and impact meter
 */
const InsightCard = ({ title, description, severity, impact, index }: InsightCardProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -2 }}
    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-start gap-4">
      <div className={`p-2 rounded-lg ${severity === 'high' ? 'bg-red-50 text-red-500' :
        severity === 'medium' ? 'bg-amber-50 text-amber-500' :
          'bg-green-50 text-green-500'
        }`}>
        <Target className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
          <span className={`text-sm px-2 py-1 rounded-full ${severity === 'high' ? 'bg-red-50 text-red-500' :
            severity === 'medium' ? 'bg-amber-50 text-amber-500' :
              'bg-green-50 text-green-500'
            }`}>
            {severity} priority
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500">Impact</span>
            <span className="text-sm font-medium">{impact}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${impact}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

/**
 * Timeline visualization component
 */
const Timeline = ({ items }: { items: TimelineItemProps[] }) => (
  <div className="space-y-4">
    {items.map((item, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.2 }}
        className="relative pl-8"
      >
        <div className="absolute left-0 top-2 w-4 h-4 rounded-full border-2 border-green-500 bg-white" />
        {index !== items.length - 1 && (
          <div className="absolute left-2 top-6 w-px h-full bg-gray-200" />
        )}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h4 className="font-medium text-gray-800">{item.title}</h4>
          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{item.date}</span>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

/**
 * Main Results Page Component
 */
export default function Results() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: containerRef
  });

  // Scroll-linked animations
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  // Get weight from URL and calculate score
  const searchParams = useSearchParams();
  const rawScore = searchParams.get('weight') || '0';
  const { questionnaireStore } = useStores();

  const score = Math.max(0, Math.min(100, (1 - parseFloat(rawScore)) * 100));

  // Sample data - in real app, this would come from your data store
  const metrics = [
    {
      title: "Overall Score",
      value: `${score.toFixed(1)}%`,
      change: 12,
      category: "score",
      description: "Based on comprehensive analysis"
    },
    {
      title: "Evidence Quality",
      value: "Strong",
      change: 8,
      category: "evidence",
      description: "Well-documented claims"
    },
    {
      title: "Impact Assessment",
      value: "Positive",
      change: -3,
      category: "impact",
      description: "Environmental benefits verified"
    }
  ];

  const insights = [
    {
      title: "Strong Evidence Base",
      description: "Your green claims are well-supported by verifiable data",
      severity: "low",
      impact: 85
    },
    {
      title: "Impact Measurement",
      description: "Consider implementing additional tracking mechanisms",
      severity: "medium",
      impact: 65
    }
  ];

  const timelineItems = [
    {
      title: "Initial Assessment",
      description: "Baseline evaluation completed",
      date: "Today"
    },
    {
      title: "Evidence Review",
      description: "Documentation analysis ongoing",
      date: "Next Steps"
    }
  ];

  // Initialize smooth scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.scrollBehavior = 'smooth';
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">

      <div
        ref={containerRef}
        className="h-screen overflow-y-auto scroll-smooth"
        style={{
          scrollSnapType: 'y proximity',
          willChange: 'transform'
        }}
      >
        <div className="container mx-auto px-4 max-w-7xl py-8">
          <motion.div
            style={{ opacity: headerOpacity, scale: headerScale }}
            className="space-y-8"
          >
            <header className="text-center scroll-snap-align-start">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.45, 0, 0.55, 1] }}
                className="text-4xl font-bold text-gray-800 mb-2"
              >
                Claim Analysis Results
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.45, 0, 0.55, 1] }}
                className="text-gray-500"
              >
                Comprehensive assessment of your environmental claim
              </motion.p>
            </header>

            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 scroll-snap-align-start"
              >
                {metrics.map((metric, index) => (
                  <MetricCard key={index} {...metric} index={index} />
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-snap-align-start"
              >
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">Key Insights</h3>
                  {insights.map((insight, index) => (
                    <InsightCard key={index} {...insight} index={index} />
                  ))}
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Assessment Timeline</h3>
                  <Timeline items={timelineItems} />
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
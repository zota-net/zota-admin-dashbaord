'use client';

import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import React from 'react';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

interface MotionDivProps extends HTMLMotionProps<'div'> {
  children?: React.ReactNode;
}

export const FadeIn = React.forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeIn}
      {...props}
    >
      {children}
    </motion.div>
  )
);
FadeIn.displayName = 'FadeIn';

export const StaggerContainer = React.forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerContainer.displayName = 'StaggerContainer';

export const StaggerItem = React.forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={staggerItem}
      {...props}
    >
      {children}
    </motion.div>
  )
);
StaggerItem.displayName = 'StaggerItem';

export function PageTransition({ 
  children,
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.3, 
        ease: 'easeOut' 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({ 
  value,
  duration = 1,
  decimals = 0,
  prefix = '',
  suffix = ''
}: { 
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = 0 + (value - 0) * easeOutQuart;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}
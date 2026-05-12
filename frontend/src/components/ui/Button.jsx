import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-[#1B8C50] text-white shadow-sm hover:bg-[#157040]",
    secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200",
    outline: "border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-900",
    ghost: "hover:bg-gray-100 text-gray-700",
    glass: "bg-white/80 backdrop-blur-md text-gray-900 hover:bg-white border border-gray-200 shadow-sm",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-12 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      ref={ref}
      className={cn(baseStyles, "active:scale-95", variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";

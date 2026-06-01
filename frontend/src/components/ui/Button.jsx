import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', loading = false, children, ...props }, ref) => {
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
      whileHover={loading ? {} : { scale: 1.01 }}
      ref={ref}
      disabled={loading || props.disabled}
      className={cn(
        baseStyles, 
        !loading && "active:scale-95", 
        variants[variant], 
        sizes[size], 
        className,
        loading && "cursor-wait opacity-80"
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : children}
    </motion.button>
  );
});

Button.displayName = "Button";

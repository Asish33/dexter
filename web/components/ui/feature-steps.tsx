import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

interface Feature {
  step: string;
  title: string;
  content: string;
  image: React.ReactNode;
}

interface FeatureStepsProps {
  features: Feature[];
  title: string;
  autoPlayInterval?: number;
  imageHeight?: string;
}

export const FeatureSteps = ({
  features,
  title,
  autoPlayInterval = 5000,
  imageHeight = "h-[500px]",
}: FeatureStepsProps) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + (100 / (autoPlayInterval / 100)));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress, features.length, autoPlayInterval]);

  useEffect(() => {
    setProgress(0);
  }, [currentFeature]);

  return (
    <div className="py-20">
      <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center font-heading text-foreground">
        {title}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        {/* Left Side: Steps List */}
        <div className="space-y-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group flex gap-6 p-6 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent",
                index === currentFeature
                  ? "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-xl scale-[1.02]"
                  : "hover:bg-gray-50 dark:hover:bg-white/5 opacity-60 hover:opacity-100"
              )}
              onClick={() => {
                setCurrentFeature(index);
                setProgress(0);
              }}
            >
              <div className="flex flex-col items-center gap-2">
                 <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors duration-300 border-2",
                      index === currentFeature
                        ? "bg-primary text-primary-foreground border-primary scale-110"
                        : "bg-transparent text-muted-foreground border-muted-foreground/30 group-hover:border-primary/50 group-hover:text-primary"
                    )}
                  >
                    {feature.step}
                  </div>
                  {index === currentFeature && (
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                          <motion.div 
                            className="w-full bg-primary origin-top"
                            initial={{ height: 0 }}
                            animate={{ height: `${progress}%` }}
                            transition={{ ease: "linear", duration: 0.1 }}
                          />
                      </div>
                  )}
              </div>
              
              <div className="flex-1 pt-1">
                <h3
                  className={cn(
                    "text-xl font-bold font-heading mb-2 transition-colors",
                    index === currentFeature ? "text-primary" : "text-foreground"
                  )}
                >
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Visual Display */}
        <div className={cn("relative w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A]", imageHeight)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 p-8 flex items-center justify-center bg-dot-black/[0.2] dark:bg-dot-white/[0.2]"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/50 via-transparent to-transparent dark:from-black/50 pointer-events-none" />
              {features[currentFeature].image}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

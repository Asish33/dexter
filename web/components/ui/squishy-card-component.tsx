import React from "react";
import { motion } from "framer-motion";

interface SquishyCardProps {
  title: string;
  price: string;
  features: string[];
  buttonText?: string;
  colorClass?: string;
  isPopular?: boolean;
}

export const SquishyCard = ({
  title,
  price,
  features,
  buttonText = "Get Started",
  colorClass = "bg-indigo-500",
  isPopular = false,
}: SquishyCardProps) => {
  return (
    <motion.div
      whileHover="hover"
      transition={{
        duration: 1,
        ease: "backInOut",
      }}
      variants={{
        hover: {
          scale: 1.05,
        },
      }}
      className={`relative h-[440px] w-full shrink-0 overflow-hidden rounded-xl ${colorClass} p-8 flex flex-col justify-between`}
    >
        {isPopular && (
            <div className="absolute top-4 right-4 z-20">
                <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Popular
                </span>
            </div>
        )}
      <div className="relative z-10 text-white">
        <span className="mb-3 block w-fit rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-md border border-white/10">
          {title}
        </span>
        <motion.span
          initial={{ scale: 0.85 }}
          variants={{
            hover: {
              scale: 1,
            },
          }}
          transition={{
            duration: 1,
            ease: "backInOut",
          }}
          className="my-2 block origin-top-left font-heading text-5xl font-black leading-[1.2]"
        >
          {price}
          <span className="text-lg font-medium text-white/80 block -mt-1 font-sans">
            {price === "Custom" ? "Solution" : "/Month"}
          </span>
        </motion.span>
        <ul className="mt-6 space-y-3">
            {features.map((feature, idx) => (
                <li key={idx} className="text-sm text-white/90 flex items-start gap-2 font-medium">
                    <svg className="w-5 h-5 mt-0.5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                </li>
            ))}
        </ul>
      </div>
      <button className="relative z-20 mt-4 w-full rounded-lg border-2 border-white bg-white py-3 text-center font-bold uppercase text-black backdrop-blur transition-all hover:bg-white/20 hover:text-white hover:border-white shadow-lg">
        {buttonText}
      </button>
      <Background />
    </motion.div>
  );
};

const Background = () => {
  return (
    <motion.svg
      width="320"
      height="384"
      viewBox="0 0 320 384"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 z-0 h-full w-full opacity-40"
      variants={{
        hover: {
          scale: 1.5,
        },
      }}
      transition={{
        duration: 1,
        ease: "backInOut",
      }}
      preserveAspectRatio="xMidYMid slice"
    >
      <motion.circle
        variants={{
          hover: {
            scaleY: 0.5,
            y: -25,
          },
        }}
        transition={{
          duration: 1,
          ease: "backInOut",
          delay: 0.2,
        }}
        cx="160.5"
        cy="114.5"
        r="101.5"
        fill="#000000"
        fillOpacity="0.2"
      />
      <motion.ellipse
        variants={{
          hover: {
            scaleY: 2.25,
            y: -25,
          },
        }}
        transition={{
          duration: 1,
          ease: "backInOut",
          delay: 0.2,
        }}
        cx="160.5"
        cy="265.5"
        rx="101.5"
        ry="43.5"
        fill="#000000"
        fillOpacity="0.2"
      />
    </motion.svg>
  );
};

export default SquishyCard;
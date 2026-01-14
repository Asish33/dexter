import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string | null) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative h-full flex items-center">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-sm font-semibold text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors"
      >
        {item}
      </motion.p>
      {active === item && (
        <div className="absolute top-[calc(100%_+_1rem)] left-1/2 transform -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={transition}
            layoutId="active"
            className="bg-white dark:bg-[#0A0A0A] backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.05] dark:border-white/[0.1] shadow-2xl"
          >
            <div className="w-max h-full p-2">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children?: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative rounded-full border border-black/5 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl shadow-sm flex justify-center space-x-8 px-8 py-3"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <a href={href} className="flex space-x-4 group p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-lg shadow-sm object-cover h-[70px] w-[120px] group-hover:scale-105 transition-transform duration-200"
      />
      <div className="flex flex-col justify-center">
        <h4 className="text-base font-bold mb-1 text-black dark:text-white group-hover:text-primary transition-colors">
          {title}
        </h4>
        <p className="text-neutral-500 text-xs leading-relaxed max-w-[10rem] dark:text-neutral-400">
          {description}
        </p>
      </div>
    </a>
  );
};

export const HoveredLink = ({ children, href, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => {
  return (
    <a
      href={href}
      {...rest}
      className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors text-sm font-medium relative group inline-block w-fit"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-primary transition-all duration-300 group-hover:w-full" />
    </a>
  );
};
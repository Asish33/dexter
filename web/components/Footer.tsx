import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-white dark:bg-[#050505] pt-24 pb-12 overflow-hidden border-t border-black/5 dark:border-white/5">
      {/* Radial Gradient Backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-rose-500/5 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-12 gap-x-8 mb-20">
          
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-5 lg:col-span-4 flex flex-col gap-6">
             <Link to="/" className="flex items-center gap-2 font-bold text-xl text-foreground dark:text-white">
                <Logo className="w-8 h-8" />
                <span className="font-heading tracking-tight text-2xl">Dexter</span>
              </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Empowering educators with AI-driven assessments. Turn any content into an engaging, interactive learning experience in seconds.
            </p>
            
            {/* Newsletter Input */}
            <div className="flex gap-2 max-w-sm mt-2">
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70 text-foreground dark:text-white"
                />
                <button className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                    Subscribe
                </button>
            </div>
          </div>
          
          {/* Spacing Column */}
          <div className="hidden md:block md:col-span-1 lg:col-span-2" />

          {/* Navigation Links */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-semibold mb-6 text-foreground dark:text-white text-sm tracking-wide">Product</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary dark:hover:text-white transition-colors block">Features</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-white transition-colors block">Integrations</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-white transition-colors block">Pricing</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-white transition-colors block">Changelog</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="font-semibold mb-6 text-foreground dark:text-white text-sm tracking-wide">Company</h4>
             <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary dark:hover:text-white transition-colors block">About</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-white transition-colors block">Blog</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-white transition-colors block">Careers</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-white transition-colors block">Contact</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="font-semibold mb-6 text-foreground dark:text-white text-sm tracking-wide">Legal</h4>
             <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary dark:hover:text-white transition-colors block">Privacy</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-white transition-colors block">Terms</Link></li>
              <li><Link to="#" className="hover:text-primary dark:hover:text-white transition-colors block">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Dexter Inc. All rights reserved.
          </p>
          <div className="flex gap-6 items-center">
            <SocialLink href="#" label="Twitter" />
            <SocialLink href="#" label="GitHub" />
            <SocialLink href="#" label="Discord" />
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, label }: { href: string; label: string }) => (
    <a 
        href={href} 
        className="text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors text-sm font-medium hover:underline decoration-border/50 underline-offset-4"
    >
        {label}
    </a>
)

export default Footer;
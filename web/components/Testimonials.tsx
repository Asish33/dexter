import React from "react";
import { TestimonialsColumn, Testimonial } from "./ui/testimonials-columns-1";
import { motion } from "framer-motion";

const testimonials: Testimonial[] = [
  {
    text: "Dexter revolutionized our classroom engagement. The instant feedback loop helps me identify struggling students immediately.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    name: "Sanjay Patel",
    role: "High School Teacher",
  },
  {
    text: "The Google Sheets sync is a lifesaver. What used to take me hours of data entry now happens automatically in seconds.",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=faces",
    name: "Anjali Desai",
    role: "University Professor",
  },
  {
    text: "My students actually ask for quizzes now. The leaderboard feature brings a fun, competitive energy to the classroom.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=faces",
    name: "Rajesh Kumar",
    role: "Corporate Trainer",
  },
  {
    text: "Simply the best tool for quick assessments. I can generate a quiz from my lecture slides in under 2 minutes.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    name: "Amit Verma",
    role: "Science Department Head",
  },
  {
    text: "The AI generation is surprisingly accurate. It picks up on nuances in the text that I thought only a human would catch.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces",
    name: "Neha Gupta",
    role: "History Teacher",
  },
  {
    text: "We deployed this across our entire district. The ease of use means even our less tech-savvy teachers are on board.",
    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces",
    name: "Rohan Das",
    role: "District Tech Coordinator",
  },
  {
    text: "Flexible and reliable. I've run sessions with over 200 students simultaneously without a single glitch.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
    name: "Meera Iyer",
    role: "Guest Lecturer",
  },
  {
    text: "The interface is beautiful and intuitive. It doesn't feel like clunky ed-tech software; it feels modern.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces",
    name: "Kabir Malhotra",
    role: "Instructional Designer",
  },
  {
    text: "Being able to upload PDFs directly saves me so much prep time. It's become an essential part of my toolkit.",
    image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=faces",
    name: "Swati Bose",
    role: "Online Course Creator",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const Testimonials = () => {
  return (
    <section className="bg-transparent my-24 relative">
      <div className="container z-10 mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[600px] mx-auto mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary dark:text-white dark:border-white/20 dark:bg-white/10">
              Testimonials
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-center font-heading text-foreground mb-4">
            Loved by educators everywhere
          </h2>
          <p className="text-center text-muted-foreground text-lg">
            See how Dexter is transforming classrooms and training rooms around the world.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[700px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
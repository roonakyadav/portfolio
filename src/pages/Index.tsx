import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Github, MapPin } from "lucide-react";

import About from "./About";
import SelectedWorks from "./SelectedWorks";
import VectorBridge from "./VectorBridge";
import Footer from "./Footer";
import Contact from "./Contact";
import Testimonial from "./Testimonial";
import Navigation from "@/components/Navigation";
import ActionButtons from "@/components/ActionButtons";
import SkipLink from "@/components/SkipLink";
import MechanicalCenterpiece from "@/components/3d/MechanicalCenterpiece";
import { useIsMobile } from "@/hooks/use-mobile";

const BrandLogo = () => (
  <div className="fixed top-6 left-6 md:top-8 md:left-10 z-50 mix-blend-difference">
    <a href="#main-content" className="focus:outline-none" aria-label="Ronak Yadav Home">
      <h1 className="font-sans font-black text-2xl md:text-4xl tracking-tighter text-white flex items-start">
        RONAK<span className="text-xs md:text-lg font-medium ml-1 -mt-1 md:-mt-2">®</span>
      </h1>
    </a>
  </div>
);

const AvailabilityBadge = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="absolute z-30 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 pointer-events-none"
    style={{ top: "2.25rem" }}
  >
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-machine-accent opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-machine-accent" />
    </span>
    <span className="font-mono font-bold text-[9px] tracking-[0.25em] uppercase text-machine-text-primary">
      Available for work
    </span>
  </motion.div>
);

const SocialStrip = () => {
  const socials = [
    { label: "GitHub", href: "https://github.com/roonakyadav" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/ronak-yadav-330a0937a/" },
    { label: "Instagram", href: "https://www.instagram.com/roonakyadav_/" },
    { label: "Email", href: "mailto:ronakyadav1609@gmail.com" },
  ];
  return (
    <motion.nav
      aria-label="Social links"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute z-20 hidden xl:flex flex-col items-center"
      style={{ right: "48px", top: "112px", bottom: "194px", justifyContent: "center", gap: "1rem" }}
    >
      <span className="w-[1px] h-8 bg-machine-border flex-shrink-0" />
      {socials.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("mailto") ? "_self" : "_blank"}
          rel="noopener noreferrer"
          title={label}
          className="group flex-shrink-0"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          <span className="font-mono font-bold text-[10px] tracking-[0.22em] uppercase text-machine-text-secondary group-hover:text-machine-accent transition-colors duration-300">
            {label}
          </span>
        </a>
      ))}
      <span className="w-[1px] h-8 bg-machine-border flex-shrink-0" />
    </motion.nav>
  );
};

const LocationLabel = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
    className="absolute md:z-30 lg:z-10 hidden md:flex items-center gap-2"
    style={{ bottom: "4rem", right: "4rem" }}
  >
    <MapPin size={13} className="text-machine-accent" />
    <span className="font-mono text-[11px] font-semibold tracking-[1.5px] uppercase text-machine-steel">
      BANGALORE, INDIA
    </span>
  </motion.div>
);

const ScrollIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
    className="absolute bottom-6 left-6 md:bottom-8 md:left-16 z-20 hidden sm:flex items-center gap-3 pointer-events-none"
  >
    <div className="w-8 h-[1px] bg-machine-accent" />
    <span className="font-mono text-[9px] font-bold tracking-[0.25em] text-machine-text-secondary uppercase">
      SCROLL // 001 ↓
    </span>
  </motion.div>
);

const MobileSocialStrip = () => {
  const socials = [{ label: "Github", icon: Github, href: "https://github.com/roonakyadav" }];
  return (
    <motion.nav
      aria-label="Mobile social links"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center gap-6"
    >
      {socials.map(({ label, icon: Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-white hover:text-machine-accent transition-colors duration-300 block"
        >
          <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
        </a>
      ))}
    </motion.nav>
  );
};

const Index = () => {
  const isMobile = useIsMobile();
  const heroSectionRef = useRef<HTMLElement>(null);
  const footerContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: footerContainerRef, offset: ["start end", "end end"] });
  const footerY = useTransform(scrollYProgress, [0, 1], ["-50%", "0%"]);

  return (
    <div className="min-h-screen relative bg-machine-bg selection:bg-machine-accent selection:text-black">
      <SkipLink />
      <BrandLogo />
      <Navigation />
      <div className="fixed inset-0 z-0 bg-white text-black"><About /></div>

      {/* Cinematic Mechanical Hero Section */}
      <section
        ref={heroSectionRef}
        aria-label="Introduction"
        className="relative min-h-screen bg-machine-bg flex flex-col justify-center px-6 pt-24 pb-16 md:px-16 md:py-16 z-20 overflow-hidden border-b border-machine-border/60"
      >
        <AvailabilityBadge />
        <SocialStrip />
        <LocationLabel />
        <ScrollIndicator />

        {/* Mobile quick social anchor */}
        <div className="flex md:hidden justify-end mb-4 z-10">
          <MobileSocialStrip />
        </div>

        {/* Main Balanced Hero Grid */}
        <div className="z-10 grid grid-cols-1 lg:grid-cols-12 w-full gap-8 lg:gap-12 items-center max-w-[1600px] mx-auto my-auto">
          {/* Left: Oversized Editorial Typography & Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1 lg:col-span-6 xl:col-span-6 flex flex-col items-start z-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-machine-accent inline-block" />
              <span className="font-mono text-[10px] text-machine-steel tracking-[0.2em] font-medium uppercase">
                SOFTWARE ENGINEER // SYSTEMS & AUTOMATION
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl md:text-5xl lg:text-5xl xl:text-6xl tracking-tight text-machine-text-primary uppercase leading-[1.04] text-left">
              BUILT WITH INTENT.<br />
              <span className="text-machine-steel">ENGINEERED TO WORK.</span>
            </h1>

            <p className="font-sans text-sm md:text-base font-normal text-machine-text-secondary leading-relaxed max-w-lg mt-5 text-left">
              I build software, developer tools and automation systems. Focused on solving complex problems through thoughtful engineering.
            </p>

            <ActionButtons />
          </motion.div>

          {/* Right: 3D Procedural Mechanical Centerpiece */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1 lg:col-span-6 xl:col-span-6 h-[420px] sm:h-[500px] lg:h-[640px] w-full flex items-center justify-center relative z-10"
          >
            <MechanicalCenterpiece isMobile={isMobile} heroSectionRef={heroSectionRef} />
          </motion.div>
        </div>
      </section>

      {/* Main Content Stream */}
      <main id="main-content" tabIndex={-1} className="relative z-20 w-full bg-transparent">
        <div id="about" className="h-screen w-full pointer-events-none" />
        <div id="work" className="bg-black text-white relative z-20"><SelectedWorks /></div>
        <div className="bg-white text-black relative z-20"><VectorBridge /></div>
        <div className="bg-black text-white relative z-20"><Testimonial /></div>
        <div id="contact" className="relative z-20 bg-white text-black"><Contact /></div>
      </main>

      {/* Parallax Reveal Footer */}
      <div ref={footerContainerRef} className="relative z-0 h-screen w-full overflow-hidden bg-black text-white">
        <motion.div style={{ y: footerY }} className="h-full w-full"><Footer /></motion.div>
      </div>
    </div>
  );
};

export default Index;

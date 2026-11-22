import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin } from "lucide-react";
import { gsap } from "gsap";

import About from "./About";
import SelectedWorks from "./SelectedWorks";
import VectorBridge from "./VectorBridge";
import Footer from "./Footer";
import Contact from "./Contact";
import Testimonial from "./Testimonial";
import Navigation from "@/components/Navigation";
import ActionButtons from "@/components/ActionButtons";
import SkipLink from "@/components/SkipLink";
import HeroBackground from "@/components/HeroBackground";
import ReactiveSerif from "@/components/ReactiveSerif";
import SignalLoader from "@/components/SignalLoader";

const BrandLogo = () => (
  <div className="fixed top-6 left-6 md:top-8 md:left-10 z-50 mix-blend-difference">
    <h1 className="font-sans font-black text-2xl md:text-4xl tracking-tighter text-white flex items-start">
      RONAK<span className="text-xs md:text-lg font-medium ml-1 -mt-1 md:-mt-2">®</span>
    </h1>
  </div>
);

const AvailabilityBadge = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="absolute z-10 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 pointer-events-none"
    style={{ top: "2.25rem" }}
  >
    <span className="relative flex h-1.5 w-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
    </span>
    <span className="font-sans font-black text-[9px] tracking-[0.25em] uppercase text-white">Available for work</span>
  </motion.div>
);

const SocialStrip = () => {
  const socials = [
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
      className="absolute z-20 hidden lg:flex flex-col items-center"
      style={{ right: "36px", top: "112px", bottom: "194px", justifyContent: "center", gap: "1.25rem" }}
    >
      <span className="w-[1px] h-8 bg-white/30 flex-shrink-0" />
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
          <span className="font-sans font-black text-[10px] tracking-[0.22em] uppercase text-white group-hover:opacity-100 transition-opacity duration-300">
            {label}
          </span>
        </a>
      ))}
      <span className="w-[1px] h-8 bg-white/30 flex-shrink-0" />
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
    <MapPin size={14} className="text-white" />
    <span className="font-sans text-xs font-semibold tracking-[1.5px] uppercase text-white">BANGALORE, INDIA</span>
  </motion.div>
);

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [heroReady, setHeroReady] = useState(false);

  const nameRef = useRef<HTMLHeadingElement>(null);
  const yadavRef = useRef<HTMLSpanElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const handleLoaderComplete = useCallback(() => {
    setLoading(false);
    setHeroReady(true);
  }, []);

  useEffect(() => {
    const updateScrollbarOffset = () => {
      const sb = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-offset', `${sb / 2}px`);
    };
    updateScrollbarOffset();
    window.addEventListener('resize', updateScrollbarOffset);
    return () => window.removeEventListener('resize', updateScrollbarOffset);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nameEl = nameRef.current;
    if (!nameEl) return;

    const chars = nameEl.querySelectorAll<HTMLElement>('[data-hero-char]');
    const yadav = yadavRef.current;
    const p = paragraphRef.current;
    const buttons = buttonsRef.current;

    if (reduced) {
      setLoading(false);
      setHeroReady(true);
      gsap.set([chars, yadav, p, buttons], { opacity: 1, clearProps: 'all' });
      return;
    }

    if (!heroReady) {
      gsap.set(chars, {
        yPercent: 120,
        rotateX: -60,
        opacity: 0,
        transformPerspective: 900,
        transformOrigin: '50% 100%',
      });
      if (yadav) gsap.set(yadav, { yPercent: 80, opacity: 0 });
      if (p) gsap.set(p, { y: 25, opacity: 0 });
      if (buttons) gsap.set(buttons, { y: 20, opacity: 0, scale: 0.96 });
      return;
    }

    // When heroReady is true (after intro loader curved transition completes)
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.02 });

    tl.to(chars, {
      yPercent: 0,
      rotateX: 0,
      opacity: 1,
      duration: 0.65,
      stagger: { each: 0.025, from: 'start' },
    })
      .to(yadav, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.5')
      .to(p, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, '-=0.4')
      .to(buttons, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.4)' }, '-=0.35');

    const handleMouseEnter = () => {
      gsap.to(chars, {
        keyframes: [{ yPercent: -8, duration: 0.2 }, { yPercent: 0, duration: 0.45 }],
        ease: 'power2.out',
        stagger: { each: 0.015, from: 'center' },
        overwrite: 'auto',
      });
    };

    nameEl.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      nameEl.removeEventListener('mouseenter', handleMouseEnter);
      tl.kill();
      gsap.killTweensOf(chars);
      if (yadav) gsap.killTweensOf(yadav);
      if (p) gsap.killTweensOf(p);
      if (buttons) gsap.killTweensOf(buttons);
    };
  }, [heroReady]);

  const footerContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: footerContainerRef, offset: ["start end", "end end"] });
  const footerY = useTransform(scrollYProgress, [0, 1], ["-50%", "0%"]);

  return (
    <div className="min-h-screen relative bg-black selection:bg-white selection:text-black">
      <SkipLink />
      <BrandLogo />
      <Navigation />

      {/* GSAP Cinematic Loader with Curved Wave Slicing Reveal */}
      {loading && <SignalLoader onComplete={handleLoaderComplete} />}

      <div className="fixed inset-0 z-0 bg-white text-black"><About /></div>

      <section
        id="top"
        aria-label="Introduction"
        className="relative min-h-screen bg-black flex flex-col justify-center items-center px-6 sm:px-8 md:px-16 py-16 md:py-20 z-20 overflow-hidden"
      >
        <HeroBackground />
        <AvailabilityBadge />
        <SocialStrip />
        <LocationLabel />

        {/* Centered Editorial Hero Composition */}
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center relative z-10 my-auto">
          {/* Centered Oversized Name */}
          <div className="relative w-full max-w-4xl flex justify-center items-center mb-6 md:mb-8 select-none cursor-default">
            <h1
              ref={nameRef}
              aria-label="Ronak Yadav"
              className="leading-none text-center select-none cursor-default"
            >
              <span aria-hidden="true" className="block">
                {/* Line 1: RONAK - Distinctive premium Syne display typography */}
                <span className="block font-syne font-extrabold text-hero tracking-[-0.04em] uppercase text-white whitespace-nowrap">
                  {Array.from("RONAK").map((char, i) => (
                    <span
                      key={i}
                      data-hero-char
                      className="inline-block hero-char will-change-transform"
                    >
                      {char}
                    </span>
                  ))}
                </span>
                {/* Line 2: Yadav - Elegant italic serif */}
                <span ref={yadavRef} className="serif-accent block text-hero-sm leading-[0.88] md:ml-[8vw] text-white whitespace-nowrap will-change-transform">
                  <ReactiveSerif text="Yadav" />
                </span>
              </span>
            </h1>
          </div>

          {/* Short Description */}
          <p
            ref={paragraphRef}
            className="max-w-2xl text-center text-zinc-300 font-sans text-xs sm:text-sm md:text-base leading-relaxed tracking-wide uppercase text-balance mt-2 mb-8 md:mb-10 px-4"
          >
            Building robust software, automating the complex and focused on transforming static systems into intelligent ones.
          </p>

          {/* Primary Actions (Three Preserved CTA Buttons - Centered Horizontally to Viewport) */}
          <div
            className="w-screen relative left-1/2 flex justify-center items-center pointer-events-none pb-2 self-start"
            style={{ transform: "translateX(calc(-50% + var(--scrollbar-offset, 0px)))" }}
          >
            <div ref={buttonsRef} className="pointer-events-auto flex justify-center items-center">
              <ActionButtons />
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" tabIndex={-1} className="relative z-20 w-full bg-transparent">
        <div id="about" className="h-screen w-full pointer-events-none" />
        <div id="work" className="bg-black text-white relative z-20"><SelectedWorks /></div>
        <div className="bg-white text-black relative z-20"><VectorBridge /></div>
        <div className="bg-black text-white relative z-20"><Testimonial /></div>
        <div id="contact" className="relative z-20 bg-white text-black"><Contact /></div>
      </main>

      <div ref={footerContainerRef} className="relative z-0 h-screen w-full overflow-hidden bg-black text-white">
        <motion.div style={{ y: footerY }} className="h-full w-full"><Footer /></motion.div>
      </div>
    </div>
  );
};

export default Index;

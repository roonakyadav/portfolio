import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/profile";

const MagicBento = () => {
  const stats = [
    {
      value: profile.stats.projectsCompleted,
      suffix: "+",
      label: "Projects Completed",
      description:
        "Projects built across software engineering, AI, automation, and full-stack development.",
    },
    {
      value: profile.stats.hackathons,
      suffix: "+",
      label: "Hackathons",
      description:
        "Hackathon projects and prototypes built under time constraints across software and AI.",
    },
    {
      value: profile.stats.githubContributionsPastYear,
      suffix: "+",
      label: "GitHub Contributions (Past 1 Year)",
      description:
        "Contributions recorded on GitHub during the past year, reflecting sustained software development activity.",
    },
    {
      value: 1,
      suffix: "+",
      label: "Years Building Software",
      description:
        "More than one year of hands-on building across software engineering, AI, automation, and full-stack development.",
    },
  ];

  return (
    <section className="w-full bg-black text-white py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-24">
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.2em]">
            More About Me
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-40">
          {stats.map((stat) => (
            <SwissItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

type SwissItemProps = {
  value: number;
  suffix: string;
  label: string;
  description: string;
};

const SwissItem = ({ value, suffix, label, description }: SwissItemProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1200;
          const startTime = performance.now();

          const update = (time: number) => {
            const progress = Math.min((time - startTime) / duration, 1);
            setCount(Math.floor(progress * value));

            if (progress < 1) requestAnimationFrame(update);
          };

          requestAnimationFrame(update);
        }
      },
      { threshold: 0.4 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col items-start">
      <span className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-white">
        {label}
      </span>

      <h3 className="mb-6 font-sans text-8xl md:text-9xl font-bold tracking-tight leading-none">
        {count.toLocaleString()}
        {suffix}
      </h3>

      <p className="max-w-sm font-sans text-base leading-6 text-white/65">
        {description}
      </p>
    </div>
  );
};

export default MagicBento;

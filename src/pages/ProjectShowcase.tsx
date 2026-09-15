import { projects } from "@/data/projects";

const ProjectShowcase = () => {
  return (
    <section aria-labelledby="projects-title" className="min-h-screen bg-black text-white px-6 py-24 md:px-12 lg:px-16">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-16 flex items-end justify-between gap-8 border-b border-white/20 pb-6">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-white/60">Selected Work</p>
            <h2 id="projects-title" className="text-5xl font-black uppercase tracking-tight md:text-7xl">Systems I Built</h2>
          </div>
          <span className="hidden text-xs font-bold uppercase tracking-widest text-white/50 md:block" aria-label={`${projects.length} featured projects`}>
            {projects.length.toString().padStart(2, "0")} Projects
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" aria-label="Featured projects">
          {projects.map((project) => (
            <article
              key={project.id}
              aria-labelledby={`project-${project.id}`}
              className="group overflow-hidden border border-white/15 bg-white/[0.03] transition-colors duration-300 hover:border-white/40"
              style={{ contentVisibility: "auto", containIntrinsicSize: "0 760px" }}
            >
              <div className="aspect-[16/9] overflow-hidden border-b border-white/10 bg-black">
                <img
                  src={project.image}
                  alt={`${project.title} preview`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover grayscale transition duration-500 group-hover:grayscale-0"
                />
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-8 flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs text-white/40" aria-hidden="true">{project.id}</span>
                    <div>
                      <h3 id={`project-${project.id}`} className="text-2xl font-black uppercase tracking-tight md:text-3xl">{project.title}</h3>
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/50">{project.stack}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40">Engineering</span>
                </div>

                <p className="max-w-2xl text-base leading-7 text-white/70">{project.description}</p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a href={project.links.code} target="_blank" rel="noopener noreferrer" className="border border-white px-4 py-3 text-xs font-black uppercase tracking-widest transition hover:bg-white hover:text-black">Source ↗</a>
                  {project.links.live && <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="px-4 py-3 text-xs font-black uppercase tracking-widest text-white/60 transition hover:text-white">Live Demo ↗</a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectShowcase;

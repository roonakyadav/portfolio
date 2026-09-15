import { Github, Instagram, Linkedin, Mail } from "lucide-react";
import { profile } from "@/data/profile";

const SocialLinks = () => {
  const links = [
    { label: "GitHub", href: profile.social.github, icon: Github },
    { label: "LinkedIn", href: profile.social.linkedin, icon: Linkedin },
    { label: "Instagram", href: profile.social.instagram, icon: Instagram },
    { label: "Email", href: `mailto:${profile.email}`, icon: Mail },
  ];

  return (
    <nav aria-label="Social links" className="flex flex-wrap items-center gap-5">
      {links.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          className="text-xs font-bold uppercase tracking-widest text-current/70 transition hover:text-current"
        >
          <span className="sr-only">{label}</span>
          <Icon aria-hidden="true" size={16} strokeWidth={2.2} />
        </a>
      ))}
    </nav>
  );
};

export default SocialLinks;

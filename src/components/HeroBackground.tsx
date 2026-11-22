import Topography from './Topography';

export default function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-black"
    >
      <Topography
        color="#b5b6bb"
        lineCount={22}
        lineWidth={1.2}
        majorLines={true}
        elevation={1}
        foreground={0.2}
        scale={1}
        detail={0.35}
        tilt={32}
        speed={0.25}
        direction="forward"
        morph={0.2}
        glow={0.6}
        depthOfField={0.4}
        fog={0.35}
        brightness={1}
        opacity={1}
        mouseInteraction={true}
        hoverEffect="lift"
        mouseRadius={1}
        mouseStrength={0.6}
        trail={0.3}
        parallax={0.5}
        clickEffect="pulse"
        markers="none"
        glitch={0}
        intro={true}
        lightMode={false}
        dpr={2}
        className="w-full h-full"
      />
    </div>
  );
}

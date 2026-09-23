export default function BrandStory() {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center">
          
          {/* Vertical Text (Left side on md+) */}
          <div className="md:w-1/4 flex justify-center md:justify-end mb-12 md:mb-0 md:pr-16">
            <h2 
              className="font-serif text-3xl md:text-5xl tracking-widest text-foreground/10 uppercase"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              L&apos;ARTISANAT
            </h2>
          </div>

          {/* Vertical line separator (hidden on mobile) */}
          <div className="hidden md:block w-px h-32 bg-border mx-8"></div>

          {/* Main Text */}
          <div className="md:w-1/2 text-center md:text-left">
            <p className="font-sans text-xl md:text-2xl leading-relaxed text-foreground/90 font-light max-w-2xl">
              Crafted with passion since the beginning. Every stitch and every cut of our premium calfskin is performed by master artisans, ensuring a timeless silhouette and unparalleled comfort.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

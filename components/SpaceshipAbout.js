"use client";

export default function SpaceshipAbout() {
  return (
    <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
      <div className="w-full max-w-2xl px-4 sm:px-6 md:px-10 lg:px-16">
        <p
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white text-left leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Wanna know more?
        </p>
      </div>
    </div>
  );
}

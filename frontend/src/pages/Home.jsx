import React, { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = "InterviewPrep";
  }, []);

  return (
    <div className="home scroll-smooth font-sans">

      {/* SECTION 1 → Hero */}
      <section className="page-section">
        <video
          className="video-overlay"
          src="/clipone.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <h1 className="absolute top-5 left-5 md:left-7 text-white font-extrabold tracking-widest uppercase text-lg md:text-2xl z-10">
          INTERVIEWPREP
        </h1>

        <div className="hero-text">
          <h2 className="font-serif uppercase text-4xl md:text-6xl lg:text-7xl text-white tracking-wide drop-shadow-lg">
            READY TO LEVEL UP?
          </h2>
          <p className="mt-4 text-gray-300 text-lg md:text-xl font-medium">
            Practice mock interviews with AI-powered feedback
          </p>

          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <a href="/login" className="btn-primary">Login</a>
            <a href="/register" className="btn-secondary">Register</a>
          </div>
        </div>
      </section>

      {/* SECTION 2 → Info */}
      <section className="page-section compact bg-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:gap-16 items-center">
          <h2 className="info-title">NOT EVERYONE MAKES IT IN.</h2>
          <p className="info-text">
            InterviewPrep is designed for the ambitious. Our platform challenges
            you to think, adapt, and grow under real interview conditions. The
            goal isn’t just practice, it’s transformation — turning potential
            into confidence and preparation into results.
          </p>
        </div>
      </section>

      {/* SECTION 3 → Video */}
      <section className="page-section">
        <video
          className="video-overlay"
          src="/cliptwo.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="hero-text max-w-2xl px-5">
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white drop-shadow-lg leading-snug">
            Learn from AI-driven feedback designed to sharpen your responses.
          </h2>
        </div>
      </section>

      {/* SECTION 4 → Info reversed */}
      <section className="page-section compact bg-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse md:gap-16 items-center">
          <h2 className="info-title">BUILT TO RAISE YOUR GAME.</h2>
          <p className="info-text">
            Beyond recording and feedback, InterviewPrep builds the mindset
            needed to stand out. It’s about consistency, discipline, and focus.
            Whether you’re preparing for your first internship or your dream
            role, every session moves you closer to mastery.
          </p>
        </div>
      </section>

      {/* SECTION 5 → Video */}
      <section className="page-section">
        <video
          className="video-overlay"
          src="/clipthree.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="hero-text max-w-2xl px-5">
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white drop-shadow-lg leading-snug">
            Ready to ace your next interview? Let’s get started.
          </h2>
        </div>
      </section>
    </div>
  );
}

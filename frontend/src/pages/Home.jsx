import React, { useEffect } from "react";
import "./Home.css";

export default function Home() {
  useEffect(() => {
    document.title = "InterviewPrep";
  }, []);

  return (
    <div className="home">
      {/* SECTION 1 → Hero with clipone.mp4 */}
      <section className="page-section">
        <video
          className="background-video"
          src="/clipone.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <h1 className="site-title">INTERVIEWPREP</h1>
        <div className="center-hero" role="main">
          <h2 className="hero-heading">READY TO LEVEL UP?</h2>
          <p className="tagline">
            Practice mock interviews with AI-powered feedback
          </p>
          <div className="hero-buttons">
            <a href="/login" className="btn primary">Login</a>
            <a href="/register" className="btn">Register</a>
          </div>
        </div>
      </section>
  

      {/* SECTION 2 → Black background, two-column (title left, text right) */}
      <section className="page-section black-section compact">
        <div className="info-container two-column">
          <h2 className="info-title">NOT EVERYONE MAKES IT IN.</h2>
          <p className="info-text info-text--enhanced">
            interviewprep is designed for the ambitious. our platform challenges
            you to think, adapt, and grow under real interview conditions. the
            goal isn’t just practice, it’s transformation — turning potential
            into confidence and preparation into results.
          </p>
        </div>
      </section>

      {/* SECTION 3 → Video background cliptwo.mp4 */}
      <section className="page-section">
        <video
          className="background-video"
          src="/cliptwo.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="center-text">
          <h2 className="story-heading">
            Learn from AI-driven feedback designed to sharpen your responses.
          </h2>
        </div>
      </section>

      {/* SECTION 4 → Black background, two-column (title right, text left) */}
      <section className="page-section black-section compact">
        <div className="info-container two-column reverse">
          <h2 className="info-title">BUILT TO RAISE YOUR GAME.</h2>
          <p className="info-text info-text--enhanced">
            beyond recording and feedback, interviewprep builds the mindset
            needed to stand out. it’s about consistency, discipline, and focus.
            whether you’re preparing for your first internship or your dream
            role, every session moves you closer to mastery.
          </p>
        </div>
      </section>

      {/* SECTION 5 → Video background clipthree.mp4 */}
      <section className="page-section">
        <video
          className="background-video"
          src="/clipthree.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="center-text">
          <h2 className="story-heading">
            Ready to ace your next interview? Let’s get started.
          </h2>
        </div>
      </section>
    </div>
  );
}

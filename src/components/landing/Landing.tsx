import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import Stats from "./Stats";
import ProblemSolution from "./ProblemSolution";
import Features from "./Features";
import Dimensions from "./Dimensions";
import Compare from "./Compare";
import Testimonials from "./Testimonials";
import CtaBand from "./CtaBand";
import Footer from "./Footer";

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Stats />
        <ProblemSolution />
        <Features />
        <Dimensions />
        <Compare />
        <Testimonials />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}

export default Landing;

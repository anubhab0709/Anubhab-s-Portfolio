import NavBar from '../components/layout/NavBar';
import ScrollProgress from '../components/layout/ScrollProgress';
import Footer from '../components/layout/Footer';
import Chatbot from '../components/chat/Chatbot';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Skills from '../sections/Skills';
import Projects from '../sections/Projects';
import Experience from '../sections/Experience';
import Achievements from '../sections/Achievements';
import Education from '../sections/Education';
import Certifications from '../sections/Certifications';
import Languages from '../sections/Languages';
import Contact from '../sections/Contact';

function HomePage() {
  useRevealOnScroll();

  return (
    <>
      <ScrollProgress />
      <NavBar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Achievements />
        <Education />
        <Certifications />
        <Languages />
        <Contact />
      </main>
      <Chatbot />
      <Footer />
    </>
  );
}

export default HomePage;

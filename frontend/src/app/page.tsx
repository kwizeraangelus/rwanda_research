"use client";
import React, { useState, useEffect } from "react";
import { Menu, X, Calendar, MapPin, Search, ArrowRight, BookOpen, Mic } from "lucide-react";

// ────────────────────── DATA ──────────────────────
const slidesData = [
  {
    images: [
      "agri.jpg",
      "brokechain.jpg",
      "old.jpg",
    ],
    metadata: {
      name: "Dr. Uwamahoro J.",
      title: "Developing Hydroponic Systems for Urban Food Security",
      field: "Agricultural Engineering",
    },
  },
  {
    images: [
      "agri.jpg",
      "brokechain.jpg",
      "old.jpg",
    ],
    metadata: {
      name: "Eng. Nkurunziza P.",
      title: "AI-Powered Early Detection of Malaria using Mobile Devices",
      field: "Biomedical Informatics",
    },
  },
  {
    images: [
      "agri.jpg",
      "brokechain.jpg",
      "old.jpg",
    ],
    metadata: {
      name: "Ms. Umutoni G.",
      title: "Decentralized Identity Solutions for Cross-Border Trade",
      field: "FinTech & Blockchain Development",
    },
  },
  {
    images: [
      "agri.jpg",
      "brokechain.jpg",
      "old.jpg",
    ],
    metadata: {
      name: "Prof. Kamali S.",
      title: "Preserving Oral Histories through Digital Archiving and VR",
      field: "Heritage Studies & Digital Humanities",
    },
  },
];

const MAIN_IMAGE_URL = "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1500&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const VIDEO_ID = "GJ1uW4L1HT8";
const VIDEO_EMBED_URL = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&controls=1&loop=1&playlist=${VIDEO_ID}`;

const navLinksData = [
  { name: 'Home', href: '#home', isInternal: true },
  { name: 'Publications', href: '/publications', isInternal: false },
  { name: 'Events', href: '/events', isInternal: false },
  { name: 'About', href: '/about', isInternal: false },
  { name: 'Contact', href: '/contact', isInternal: false },
];

// ────────────────────── COMPONENTS ──────────────────────
interface Metadata {
  name: string;
  title: string;
  field: string;
}

interface ImageSliderProps {
  images: string[];
  metadata: Metadata;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, metadata }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-80 overflow-hidden rounded-xl shadow-2xl transition-transform duration-300 hover:scale-[1.03] cursor-pointer group">
      <img
        src={images[index]}
        alt="Research Slide"
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5 opacity-100 group-hover:bg-opacity-70 transition duration-300">
        <p className="text-teal-400 text-sm font-semibold mb-1">
          {metadata.field}
        </p>
        <p className="text-white text-lg font-bold leading-tight line-clamp-2">
          {metadata.title}
        </p>
        <p className="text-gray-300 text-xs mt-1">
          By: {metadata.name}
        </p>
      </div>
    </div>
  );
};

const SimpleImage: React.FC<{ src: string; alt: string; className: string; style?: React.CSSProperties }> = ({ src, alt, className, style }) => (
  <img src={src} alt={alt} className={className} style={style} />
);

const MobileMenu: React.FC<{ isOpen: boolean; toggle: () => void; scrollToSection: (id: string) => void }> = ({ isOpen, toggle, scrollToSection }) => (
  <div className={`fixed top-0 left-0 w-full h-full bg-green-800 bg-opacity-95 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
    <button onClick={toggle} className="absolute top-4 right-4 text-white p-2">
      <X size={30} />
    </button>
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      {navLinksData.map((link) => (
        <a
          key={link.name}
          href={link.href}
          onClick={(e) => {
            toggle();
            if (link.isInternal) {
              e.preventDefault();
              scrollToSection(link.href.substring(1));
            }
          }}
          className="text-white text-3xl font-light hover:text-teal-300 transition"
        >
          {link.name}
        </a>
      ))}
    </div>
  </div>
);

// ────────────────────── EVENT LIST FROM API ──────────────────────
interface Event {
  title: string;
  date: string;
  location: string;
  icon: 'Mic' | 'BookOpen' | 'Calendar';
}

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/innovations/events/', {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setEvents(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const iconMap: Record<string, React.ElementType> = {
    Mic,
    BookOpen,
    Calendar,
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading events...</p>
      </div>
    );
  }

  if (error || events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <p>No upcoming events at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {events.map((conf, index) => {
        const Icon = iconMap[conf.icon] || Calendar;
        return (
          <div
            key={index}
            className="p-6 bg-green-50 rounded-xl shadow-lg border-t-4 border-teal-500 text-left transition duration-300 hover:shadow-2xl hover:border-teal-700"
          >
            <div className="flex items-center mb-3">
              <Icon className="w-6 h-6 mr-3 text-teal-600 shrink-0" />
              <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{conf.title}</h3>
            </div>
            <div className="text-base text-gray-700 pl-9">
              <p className="flex items-center mb-1">
                <Calendar className="w-4 h-4 mr-2 text-green-700" />
                {conf.date}
              </p>
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-green-700" />
                {conf.location}
              </p>
            </div>
            <a href="/events" className="mt-4 text-sm font-semibold text-teal-600 hover:text-teal-800 flex items-center">
              Details & Registration <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        );
      })}
    </div>
  );
};

// ────────────────────── MAIN PAGE ──────────────────────
export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMobileMenu = () => setMobileOpen(prev => !prev);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#4a772e] to-[#8c9c6f] text-white py-16">
      {/* NAV */}
      <nav className="bg-gradient-to-b from-[#4a772e] to-[#8c9c6f] text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 text-2xl font-extrabold text-green-700 tracking-wider">
              RRH
            </div>
            <div className="hidden md:flex space-x-2 lg:space-x-6 items-center">
              {navLinksData.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    if (link.isInternal) {
                      e.preventDefault();
                      scrollToSection(link.href.substring(1));
                    }
                  }}
                  className="text-gray-700 px-3 py-2 text-sm font-medium transition duration-150 ease-in-out hover:text-green-700 hover:bg-green-50 rounded-lg"
                >
                  {link.name}
                </a>
              ))}
              <div className="relative ml-4">
                <input
                  type="text"
                  placeholder="Search Publications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 px-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <button onClick={toggleMobileMenu} className="md:hidden p-2 text-gray-700">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={mobileOpen} toggle={toggleMobileMenu} scrollToSection={scrollToSection} />

      {/* HERO */}
      <section id="home" className="pt-8 pb-16 bg-[#e1fcd1] shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Driving <span className="text-teal-600">Rwanda’s Future</span> Through Research.
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                The national platform for discovery, publication, and collaboration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <a href="/submit-research" className="bg-green-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-green-850 transition transform hover:scale-105 text-center">
                  Publish Your Research
                </a>
                <a href="/publications" className="bg-teal-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-teal-600 transition transform hover:scale-105 flex items-center justify-center">
                  Explore Publications <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </div>
            </div>
            <div className="order-first md:order-last">
              <SimpleImage
                src={MAIN_IMAGE_URL}
                alt="Research and Innovation Collaboration"
                className="rounded-3xl object-cover shadow-2xl w-full h-auto transition duration-500 hover:shadow-2xl hover:scale-[1.01]"
                style={{ aspectRatio: '4/3' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED INNOVATIONS */}
      <section id="publications" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Featured <span className="text-green-700">Innovations</span>
          </h2>
          <p className="text-lg text-center text-gray-600 mb-12">
            A selection of the most impactful work currently on the hub.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {slidesData.map((slide, i) => (
              <ImageSlider key={i} images={slide.images} metadata={slide.metadata} />
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS – NOW FROM API */}
      <section id="events" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Upcoming <span className="text-teal-600">Events</span>
          </h2>
          <p className="text-lg text-center text-gray-600 mb-12">
            Don't miss the next opportunities to connect, learn, and collaborate.
          </p>
          <EventList />
        </div>
      </section>

      {/* VIDEO */}
      <section className="pt-8 pb-16 bg-[#e1fcd1] shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-2xl sm:text-3xl font-dark italic text-center max-w-4xl mx-auto mb-12">
            "Innovation drives knowledge, knowledge drives Rwanda."
          </p>
          <div className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl relative pb-[56.25%] h-0">
            <iframe
              src={VIDEO_EMBED_URL}
              title="Rwanda Health Innovation"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="bg-slate-700 text-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">RWANDA RESEARCH HUB</h3>
            <p className="text-sm">A central node for Rwanda's scientific progress and technological breakthroughs.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/publications" className="hover:text-teal-400">Publications</a></li>
              <li><a href="/events" className="hover:text-teal-400">Upcoming Events</a></li>
              <li><a href="/submit-work" className="hover:text-teal-400">Submit Work</a></li>
            </ul>
          </div>
          <div id="contact">
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <p className="text-sm mb-2">Email: <a href="mailto:info@researchhub.rw" className="hover:text-teal-400">info@researchhub.rw</a></p>
            <p className="text-sm">Phone: +250 788 XXX XXX</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy-policy" className="hover:text-teal-400">Privacy Policy</a></li>
              <li><a href="/terms-of-use" className="hover:text-teal-400">Terms of Use</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-700 pt-6 max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Rwanda Research Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
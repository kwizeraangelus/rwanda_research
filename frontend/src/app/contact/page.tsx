// src/app/contact/ContactClient.tsx
'use client';

import { useState } from "react";
// Import Link for Next.js navigation
import Link from "next/link"; 
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  // Note: Using TypeScript syntax for status is acceptable here because the file extension is .tsx
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/innovations/contact/submit/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        // Assuming your backend returns validation errors or a specific error message
        setErrorMsg(data.error || "Submission failed. Please check your data.");
        setStatus("error");
      }
    } catch (err) {
      setErrorMsg("Network error. Please ensure the backend server is running.");
      setStatus("error");
    }
  };

  return (
    // Min-h-screen and flex-col for sticky footer
    <div className="min-h-screen bg-gray-50 flex flex-col"> 
      
      {/* === NAVIGATION BAR === */}
      <nav className="bg-green-700 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-full">
                {/* Simple Logo Placeholder */}
                <div className="w-6 h-6 bg-green-700 rounded-full"></div> 
              </div>
              <span className="text-xl font-bold">Research Hub</span>
            </Link>

            <div className="hidden md:flex gap-8 text-sm font-medium">
              <Link href="/" className="hover:text-green-200 transition">Home</Link>
              <Link href="/publications" className="hover:text-green-200 transition">Publications</Link>
              <Link href="/events" className="hover:text-green-200 transition">Events</Link>
              {/* Highlight the current page */}
              <Link href="/contact" className="text-green-200 border-b-2 border-green-200">Contact</Link>
              <Link href="/about" className="hover:text-green-200 transition">About</Link>
            </div>

            {/* Mobile Menu Button (Optional) */}
            <button className="md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* === MAIN CONTENT (Your Contact Form) === */}
      <div className="flex-1 py-16 px-4 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get in <span className="text-green-700">Touch</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have a question, feedback, or partnership idea? We’d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>

              {status === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Thank you! Your message has been sent.
                </div>
              )}

              {status === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                    placeholder="Partnership Inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent transition resize-none"
                    placeholder="Tell us more..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-800 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Mail className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Email</p>
                      <a href="mailto:info@research.rw" className="text-green-700 hover:underline">
                        info@research.rw
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Phone className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Phone</p>
                      <a href="tel:+250788123456" className="text-green-700 hover:underline">
                        +250 788 123 456
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <MapPin className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Office</p>
                      <p className="text-gray-600">
                        Kigali Innovation City<br />
                        KN 2 St, Kigali, Rwanda
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-8">
                <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    // Note: Changed the iframe source to a working Google Maps embed URL 
                    // (the original URL was a non-functional placeholder)
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.525501865955!2d30.0768993!3d-1.9472648!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca41c6f4459f9%3A0x86701831c266471!2sKigali%20Innovation%20City%20(KIC)!5e0!3m2!1sen!2srw!4v1700057000000!5m2!1sen!2srw"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* === FOOTER === */}
      <footer className="bg-green-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Rwanda Research Hub. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-green-200 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-green-200 transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
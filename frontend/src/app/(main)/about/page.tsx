// app/about/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
  const teamMembers = [
    { name: 'Dr. Jean Bosco', role: 'Executive Director', email: 'jbosco@riri.gov.rw' },
    { name: 'Dr. Marie Claire', role: 'Research Director', email: 'mclaire@riri.gov.rw' },
    { name: 'Prof. Samuel', role: 'Academic Affairs Head', email: 'samuel@riri.gov.rw' },
    { name: 'Dr. Grace', role: 'Innovation Director', email: 'grace@riri.gov.rw' },
  ];

  const academicPartners = [
    'University of Rwanda', 'Rwanda Polytechnic', 'University of Kigali', 
    'Carnegie Mellon University Africa', 'African Leadership University', 
    'University of Global Health Equity', 'Akilah Institute', 'Adventist University of Central Africa'
  ];

  const governmentPartners = [
    'Ministry of Education', 'Rwanda Development Board', 
    'National Council for Science & Technology', 'Private Sector Federation',
    'Ministry of ICT & Innovation', 'Rwanda Biomedical Centre'
  ];

  const internationalPartners = [
    'UNESCO', 'World Bank', 'African Union', 'European Union', 
    'British Council', 'USAID', 'World Health Organization', 'African Development Bank'
  ];

  return (
    <div className="min-h-screen bg-[#E0F2FE] text-gray-900">
      {/* DARK NAVY TOP BAND */}
      <div className="h-28 bg-[#050A14]" aria-hidden="true" />

      {/* HERO SECTION */}
      <section className="relative -mt-28 pt-36 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-[#050A14] mb-6">
            About <span className="text-[#FFD700]">RIRI</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Rwanda Innovation & Research Institute - Connecting research to Rwanda's development
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* COMBINED MISSION & VISION SECTION */}
          <div className="mb-20">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-[#050A14] to-[#1a237e] p-8 text-center">
                <h2 className="text-4xl font-bold text-white mb-2">Our Purpose & Vision</h2>
                <p className="text-gray-300 text-lg">Driving Rwanda's research ecosystem forward</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Mission Side */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center">
                      <span className="text-3xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#050A14]">Mission</h3>
                      <p className="text-gray-600">Our core purpose</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      To democratize access to academic research in Rwanda by providing a centralized platform 
                      where researchers, students, and academics can share, discover, and collaborate on 
                      groundbreaking research that addresses national development challenges and contributes 
                      to global knowledge advancement.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#050A14] text-lg">What We Do:</h4>
                    <ul className="space-y-2">
                      {[
                        'Provide digital repository for research publications',
                        'Facilitate academic collaboration',
                        'Promote research commercialization',
                        'Support early-career researchers',
                        'Bridge academia-industry gap'
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
                          <span className="text-[#FFD700]">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Vision Side */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center">
                      <span className="text-3xl">🌟</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#050A14]">Vision</h3>
                      <p className="text-gray-600">Our future aspiration</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      To establish Rwanda as a continental leader in research and innovation, creating an 
                      ecosystem where academic knowledge directly translates into sustainable development, 
                      economic growth, and improved quality of life for all Rwandans by 2030.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-bold text-[#050A14] text-lg">Our Goals:</h4>
                    <ul className="space-y-2">
                      {[
                        'Connect all Rwandan academic institutions',
                        'Increase research publication by 300%',
                        'Commercialize 50+ research projects annually',
                        'Create 10,000 research jobs by 2030',
                        'Establish Rwanda as East Africa research hub'
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
                          <span className="text-[#FFD700]">→</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PARTNERSHIPS SECTION */}
          <div className="mb-20">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-[#050A14] to-[#1a237e] p-8 text-center">
                <h2 className="text-4xl font-bold text-white mb-2">Our Partnerships</h2>
                <p className="text-gray-300 text-lg">Collaborating for greater impact</p>
              </div>

              <div className="p-8 space-y-12">
                {/* Academic Partners */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🎓</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#050A14]">Academic Institutions</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {academicPartners.map((partner, index) => (
                      <span key={index} className="bg-blue-50 text-[#050A14] px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Government & Industry */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏛️</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#050A14]">Government & Industry</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {governmentPartners.map((partner, index) => (
                      <span key={index} className="bg-blue-50 text-[#050A14] px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>

                {/* International Partners */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🌍</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[#050A14]">International Collaborations</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {internationalPartners.map((partner, index) => (
                      <span key={index} className="bg-gradient-to-r from-[#050A14] to-[#1a237e] text-white px-4 py-2 rounded-full text-sm font-medium">
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TEAM SECTION */}
          <div className="mb-20">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-[#050A14] to-[#1a237e] p-8 text-center">
                <h2 className="text-4xl font-bold text-white mb-2">Leadership Team</h2>
                <p className="text-gray-300 text-lg">Driving innovation and research excellence</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
                {teamMembers.map((member, index) => (
                  <div key={index} className="bg-blue-50 rounded-2xl p-6 border border-blue-100 hover:border-[#FFD700] transition-all group">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <span className="text-4xl">👤</span>
                      </div>
                      <h3 className="text-xl font-bold text-[#050A14] mb-2">{member.name}</h3>
                      <p className="text-gray-600 mb-3">{member.role}</p>
                      <p className="text-sm text-gray-700 bg-white px-3 py-1 rounded-full">
                        {member.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CALL TO ACTION */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-[#050A14] to-[#1a237e] rounded-3xl p-12">
              <h3 className="text-3xl font-bold text-white mb-6">
                Ready to contribute to Rwanda's research ecosystem?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/publications"
                  className="bg-[#FFD700] text-[#050A14] px-10 py-4 rounded-full text-lg font-bold hover:bg-yellow-500 transition-all hover:scale-105"
                >
                  Browse Research
                </Link>
                <Link 
                  href="/login"
                  className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-white/10 transition-all"
                >
                  Join Our Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050A14] text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-6xl font-bold uppercase italic tracking-wider mb-4">RIRI</div>
          <p className="text-gray-300 text-lg">Rwanda Innovation & Research Institute</p>
          <p className="text-sm text-gray-500 mt-8">© 2025 RIRI • All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
import React from 'react';
import EoiForm from '../components/EoiForm';
import { Cpu, Zap, Sprout, MonitorPlay, Share2 } from 'lucide-react';

export default function LandingPage() {
  const handleShare = async () => {
    const url = window.location.href;
    const text = 'Check out Norton Youth Innovation Institute (NYII) - Help young people move into real careers in the AI age.';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NYII - Norton Youth Innovation Institute',
          text,
          url
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      // Fallback to clipboard or simply open WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-slate-200">
      
      {/* Navigation / Header */}
      <header className="px-6 py-8 md:px-12 max-w-5xl mx-auto flex justify-between items-center bg-[#FDFDFD]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
             <span className="text-white font-bold tracking-tighter">NY</span>
          </div>
          <span className="font-semibold tracking-tight text-slate-900">NYII</span>
        </div>
        <button onClick={handleShare} className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share via WhatsApp</span>
          <span className="sm:hidden">Share</span>
        </button>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-12 pb-24 md:px-12 md:pt-16 max-w-5xl mx-auto">
        <div className="max-w-4xl">
          <div className="inline-flex items-center px-3 py-1 mb-6 text-sm font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            A Proposal to the Community — Proof of Demand Initiative
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
            We don't just hand out degrees. We launch real careers and startups.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl leading-relaxed">
            The Norton Youth Innovation Institute (NYII) is a proposed career-launch ecosystem for Zimbabwe's youth. Unlike traditional colleges, our core mission is to ensure every student transitions directly into employment or enterprise through partnerships, incubation, and placement support. Before we secure further investments, we are gathering proof of demand from the community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#register" className="inline-flex items-center justify-center px-6 py-4 bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors w-full sm:w-auto">
              Register Interest
            </a>
            <a href="#why-this-matters" className="inline-flex items-center justify-center px-6 py-4 bg-[#F1F5F9] text-slate-900 font-medium rounded-md hover:bg-[#E2E8F0] transition-colors w-full sm:w-auto">
              Read the Proposal
            </a>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section id="why-this-matters" className="px-6 py-20 bg-slate-50 md:px-12 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium mb-8">Why we are proposing NYII</h2>
          <div className="grid md:grid-cols-2 gap-12 text-slate-600">
            <div>
              <p className="mb-6 leading-relaxed">
                Many young people finish school with immense potential but no clear direction. Under current structures, students are often pushed into standard degree programs without clear outcomes, leaving them to navigate a rapidly changing economy without practical support.
              </p>
              <p className="leading-relaxed">
                We believe that young people require more than theoretical knowledge. The AI age is shifting the global economy fast, creating new opportunities but also demanding new competencies.
              </p>
            </div>
            <div>
               <p className="mb-6 leading-relaxed">
                This is why we are proposing NYII. Instead of serving as a traditional university, it is designed to be an accelerator—a place to help youth find where they fit, bridge the gap between classroom and industry, and build real-world pathways to employment or self-reliance.
               </p>
               <p className="leading-relaxed font-medium text-slate-800">
                 This page is the first step. We are gathering proof of demand from the community before securing further investments to make this vision a reality.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* What NYII Will Offer */}
      <section className="px-6 py-24 md:px-12 max-w-5xl mx-auto">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-medium mb-4">What NYII will offer</h2>
          <p className="text-slate-600 max-w-3xl leading-relaxed">
            Our core learning areas form specialized departments, all designed to progress and be tailored according to current and future economic or industrial demands.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-8">
          {[
            { 
              title: "Department of AI Systems & Software Architecture", 
              desc: "Focusing on functional prompt engineering, localized data infrastructure management, software testing protocols, and deploying automated workflows for small-to-medium enterprises.", 
              icon: <Cpu className="w-5 h-5 text-slate-700"/> 
            },
            { 
              title: "Department of Smart Infrastructure & Renewable Energy", 
              desc: "Focusing on large-scale industrial solar grid design, smart inverter array troubleshooting, deep-well water solarization, and sensor-driven municipal automation.", 
              icon: <Zap className="w-5 h-5 text-slate-700"/> 
            },
            { 
              title: "Department of High-Yield Agritech & Food Logistics", 
              desc: "Focusing on precision vertical farming, sensor-monitored commercial poultry operations, automated nutritional delivery loops, and temperature-controlled supply chain logistics.", 
              icon: <Sprout className="w-5 h-5 text-slate-700"/> 
            },
            { 
              title: "Department of Creative Media Engineering & Design", 
              desc: "Focusing on high-definition digital video post-production, advanced audio engineering, modern podcast platform creation, interface design, and commercial digital asset production.", 
              icon: <MonitorPlay className="w-5 h-5 text-slate-700"/> 
            },
          ].map((item, i) => (
            <div key={i} className="p-6 border border-slate-200 rounded-lg bg-white shadow-sm">
              <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center mb-6">
                 {item.icon}
              </div>
              <h3 className="font-medium text-slate-900 mb-2 leading-snug">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it is for */}
      <section className="px-6 py-20 bg-slate-900 text-white md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-medium mb-8">Who it is for</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              This initiative is for young people seeking direction, and the community that supports them.
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-slate-200">
              <li className="flex items-start space-x-2"><span className="text-slate-500">•</span><span>Students & School Leavers</span></li>
              <li className="flex items-start space-x-2"><span className="text-slate-500">•</span><span>Unemployed Youth</span></li>
              <li className="flex items-start space-x-2"><span className="text-slate-500">•</span><span>Young Entrepreneurs</span></li>
              <li className="flex items-start space-x-2"><span className="text-slate-500">•</span><span>Parents & Guardians</span></li>
              <li className="flex items-start space-x-2"><span className="text-slate-500">•</span><span>Employers</span></li>
              <li className="flex items-start space-x-2"><span className="text-slate-500">•</span><span>Community Supporters</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Form / Expression of Interest */}
      <section id="register" className="px-6 py-24 md:px-12 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-[1fr_1.25fr] gap-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium mb-6">Expression of Interest</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              This form exists to collect proof of demand. NYII is currently a proposal. By understanding community interest now, we can present real numbers to partners and investors to secure the funding needed to bring the Norton Youth Innovation Institute to life.
            </p>
            
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                <h3 className="font-medium text-slate-900 mb-2">Demand Validation</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your interest represents real proof. It will help us refine our first phase and ensure we match programs directly to what the community actually needs.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                <h3 className="font-medium text-slate-900 mb-2">Our Commitment</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  NYII is a serious youth development initiative created to solve a pressing problem in Zimbabwe. It is designed purely for long-term community benefit.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border text-left border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
            <EoiForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 md:px-12 bg-slate-50 border-t border-slate-200 text-center text-slate-500 flex flex-col items-center">
        <span className="font-medium text-slate-900 mb-4 block">NYII</span>
        <p className="max-w-md mx-auto text-sm leading-relaxed mb-8">
          A youth development initiative focused on skills, careers, and the future of work in Zimbabwe.
        </p>

        <div className="text-xs text-slate-400 space-y-2">
           <p className="font-medium text-slate-500 mb-2">Privacy Notice</p>
           <p>Details will only be used for NYII updates and demand tracking. No information will be sold. Data will be stored securely. You can request removal of your information at any time. We respect your privacy.</p>
           <p className="mt-4 pt-4 border-t border-slate-200 space-x-4">
             <a href="mailto:support@nyii-project.info" className="hover:text-slate-900">Anonymous Project Inquiry</a>
             <span>&middot;</span>
             <a href="/admin" className="hover:text-slate-900">Admin Login</a>
           </p>
        </div>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is JEDI?",
      answer: "JEDI is a social media management platform that lets you post to Instagram, TikTok, Facebook, LinkedIn, and YouTube from one dashboard. Perfect for agencies, creators, and businesses."
    },
    {
      question: "How does the AI work?",
      answer: "Our AI analyzes your content and generates optimized captions, hashtags, and scripts tailored to your brand voice. It learns from your best-performing posts to improve over time."
    },
    {
      question: "Can I manage multiple clients?",
      answer: "Yes! The Pro and Agency plans let you manage unlimited clients from one dashboard. Each client has their own workspace with isolated content and analytics."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-level encryption and never store your social media passwords. All connections use secure OAuth, and you can revoke access anytime."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. No contracts, no commitments. Cancel your subscription anytime with one click. Your data remains accessible even on the free plan."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-purple px-6 py-20 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fadeInUp">
            Auto-Post to Social Media
            <br />
            <span className="text-white/90">from One Dashboard</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            Manage unlimited clients. Post to Instagram, TikTok, Facebook, LinkedIn & YouTube. All from one place.
          </p>

          <div className="flex gap-4 justify-center flex-wrap animate-fadeInUp" style={{animationDelay: '0.4s'}}>
            <Link href="/auth/sign-up" className="bg-white text-[#994899] px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
              Start Free Forever
            </Link>
            <button className="bg-transparent text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-white hover:bg-white hover:text-[#994899] transition">
              See How It Works
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Everything You Need to Scale
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Professional tools designed for agencies, creators, and businesses who take social media seriously.
          </p>

          <div className="grid md:grid-cols-3 gap-8 ">
            {[
              {
                title: "Multi-Client Dashboard",
                description: "Manage unlimited clients from one dashboard. Switch between accounts instantly with organized workspaces."
              },
              {
                title: "AI-Powered Content",
                description: "Generate professional captions, hashtags, and scripts in seconds. Our AI learns your brand voice."
              },
              {
                title: "Schedule & Auto-Post",
                description: "Upload content once, schedule across all platforms. We handle posting while you focus on strategy."
              },
              {
                title: "Advanced Analytics",
                description: "Track performance across all platforms. Identify trends, measure ROI, and optimize your strategy."
              },
              {
                title: "Team Collaboration",
                description: "Invite team members, assign roles, and manage client approvals all in one place."
              },
              {
                title: "Discovery Feed",
                description: "Get inspired by trending content in your niche. Find collaboration opportunities with other creators."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="glass-card p-8 hover:shadow-xl transition-all duration-300 bg-white border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reasons to Join */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
            Why Choose JEDI?
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                title: "Save Time",
                description: "Post to all platforms in one click. Save 10+ hours per week on content management."
              },
              {
                title: "Scale Faster",
                description: "Manage unlimited clients without hiring more people. One person can handle 50+ accounts."
              },
              {
                title: "Better Results",
                description: "AI-optimized content performs 40% better on average. Data-driven insights guide your strategy."
              },
              {
                title: "Always Free Option",
                description: "Start with our free plan. No credit card required. Upgrade only when you're ready to scale."
              }
            ].map((reason, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#994899]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-[#994899] rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Free Plan */}
            <div 
              className={`glass-card p-8 bg-white border-2 transition-all duration-300 ${hoveredCard === 0 ? 'scale-105 shadow-2xl border-[#994899]' : 'border-gray-200'}`}
              onMouseEnter={() => setHoveredCard(0)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/mo</span>
              </div>
              <ul className="space-y-3 text-gray-700 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>8 posts/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>2 social accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>3 AI captions/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>3 AI scripts/month</span> 
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>3 AI hashtags</span>   
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Basic scheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>World class cutomer support</span>
                </li>
              </ul>
              <button className="w-full bg-gray-200 text-gray-900 py-3 rounded-full font-semibold hover:bg-gray-300 transition">
                Get Started
              </button>
            </div>

            {/* Creator Plan */}
            <div 
              className={`glass-card p-8 bg-white border-2 transition-all duration-300 ${hoveredCard === 1 ? 'scale-105 shadow-2xl border-[#994899]' : 'border-gray-200'}`}
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="bg-[#994899] text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Creator</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$5</span>
                <span className="text-gray-600">/mo</span>
              </div>
              <ul className="space-y-3 text-gray-700 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>20 posts/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>3 social accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>20 AI captions/month</span>
                </li>
                 <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Unlimited AI hashtags</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>10 AI scripts/month</span>  
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>1 free JEDI boost/month</span>    
                  </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>World class cutomer support</span>
                </li>
              </ul>
              <button className="w-full bg-[#994899] text-white py-3 rounded-full font-semibold hover:bg-[#7d3a7d] transition">
                Start Free Trial
              </button>
            </div>

            {/* Pro Plan */}
            <div 
              className={`glass-card p-8 bg-white border-2 transition-all duration-300 ${hoveredCard === 2 ? 'scale-105 shadow-2xl border-[#994899]' : 'border-gray-200'}`}
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$12</span>
                <span className="text-gray-600">/mo</span>
              </div>
              <ul className="space-y-3 text-gray-700 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Unlimited posts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Unlimited accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Full analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>World class cutomer support</span>
                </li>
              </ul>
              <button className="w-full bg-[#994899] text-white py-3 rounded-full font-semibold hover:bg-[#7d3a7d] transition">
                Start Free Trial
              </button>
            </div>

            {/* Agency Plan */}
            <div 
              className={`glass-card p-8 bg-white border-2 transition-all duration-300 ${hoveredCard === 3 ? 'scale-105 shadow-2xl border-[#994899]' : 'border-gray-200'}`}
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Agency</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$79</span>
                <span className="text-gray-600">/mo</span>
              </div>
              <ul className="space-y-3 text-gray-700 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>White-label option</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Client approval workflow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Unlimited AI</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>API access</span>
                </li>
              </ul>
              <button className="w-full bg-[#994899] text-white py-3 rounded-full font-semibold hover:bg-[#7d3a7d] transition">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
                  <span className="text-2xl text-gray-400">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-purple text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-xl mb-12 text-white/90">
            Join thousands of creators and agencies using JEDI to scale their social media presence.
          </p>
          <Link href="/auth/sign-up" className="bg-white text-[#994899] px-12 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform">
            Start Free Forever
          </Link>
        </div>
      </section>
    </div>
  );
}
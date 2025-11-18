'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
// 1. IMPORT THE IMAGE DIRECTLY
// This ensures Next.js bundles the image correctly, regardless of path issues
import heroImage from './hero6.png'; // If image is in the same folder as page.tsx

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
    <div className="min-h-screen bg-white font-poppins overflow-x-hidden">
      {/* -------------------- Hero Section -------------------- */}
      <div className="flex items-center bg-gradient-to-r from-[#CBB2FE] via-[#E5C8FF] via-[#F7DFFF] to-[#FFF0E6]">
        <div className="container mx-auto flex flex-col lg:flex-row px-6 sm:px-8 md:px-12 lg:px-20 pt-12 sm:pt-16 lg:pt-20 pb-0">

          {/* Left Column - Text */}
          <div className="flex flex-col justify-center w-full lg:w-7/12 text-[#14181b] items-center lg:items-start text-center lg:text-left pt-20 md:pt-20 md:pb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-bold mb-4 sm:mb-6 leading-tight">
              Auto-Post to Social Media from One Dashboard
            </h2>
            <p className="mb-6 sm:mb-8 text-base sm:text-lg lg:text-xl max-w-xl">
              Manage unlimited clients. Post to Instagram, TikTok, Facebook, LinkedIn & YouTube. All from one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mb-8 sm:mb-12 lg:mb-0">
              <Link 
                href="/auth/sign-up" 
                className="px-6 sm:px-8 py-3 sm:py-4 bg-purple-700 text-white rounded-full font-semibold hover:scale-105 transition-transform text-center text-sm sm:text-base"
              >
                Start Free Forever
              </Link>
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-black border-2 border-white rounded-full font-semibold hover:bg-purple-700 hover:text-white transition text-sm sm:text-base">
                See How It Works
              </button>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="w-full lg:w-5/12 justify-center lg:justify-end items-end hidden md:flex">
            <div className="relative w-[80%] sm:w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[500px] aspect-square lg:aspect-auto lg:h-full max-h-[400px] sm:max-h-[500px] lg:max-h-[600px]">
              <Image
                src={heroImage} // 2. USE THE IMPORTED IMAGE VARIABLE
                alt="Hero Image showing social media dashboard"
                fill
                className="object-contain object-bottom"
                priority
                placeholder="blur" // Optional: adds a nice blur effect while loading
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Features Section ---------------- */}
      <section id="features" className="py-16 md:py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-6 text-gray-900">
            Everything You Need to Scale
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Professional tools designed for agencies, creators, and businesses who take social media seriously.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                className="glass-card p-6 md:p-8 hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 rounded-xl"
              >
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Reasons to Join Section ---------------- */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gray-900">
            Why Choose JEDI?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
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
              <div key={index} className="text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[#994899]/10 rounded-full flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-[#994899] rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-gray-600 max-w-xs">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Pricing Section ---------------- */}
      <section id="pricing" className="py-16 md:py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-6 text-gray-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl lg:max-w-none mx-auto">
            {/* Pricing Cards */}
            {[
              {
                title: "Free",
                price: "$0",
                features: [
                  "8 posts/month",
                  "2 social accounts",
                  "3 AI captions/month",
                  "3 AI scripts/month",
                  "3 AI hashtags",
                  "Basic scheduling",
                  "World class customer support"
                ],
                button: { text: "Get Started", className: "bg-gray-200 text-gray-900 hover:bg-gray-300" }
              },
              {
                title: "Creator",
                badge: "MOST POPULAR",
                price: "$5",
                features: [
                  "20 posts/month",
                  "3 social accounts",
                  "20 AI captions/month",
                  "Unlimited AI hashtags",
                  "10 AI scripts/month",
                  "1 free JEDI boost/month",
                  "Basic analytics",
                  "World class customer support"
                ],
                button: { text: "Start Free Trial", className: "bg-[#994899] text-white hover:bg-[#7d3a7d]" }
              },
              {
                title: "Pro",
                price: "$12",
                features: [
                  "Unlimited posts",
                  "Unlimited accounts",
                  "Full analytics",
                  "Team collaboration",
                  "World class customer support"
                ],
                button: { text: "Start Free Trial", className: "bg-[#994899] text-white hover:bg-[#7d3a7d]" }
              },
              {
                title: "Agency",
                price: "$79",
                features: [
                  "Everything in Pro",
                  "White-label option",
                  "Client approval workflow",
                  "Unlimited AI",
                  "API access"
                ],
                button: { text: "Start Free Trial", className: "bg-[#994899] text-white hover:bg-[#7d3a7d]" }
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`glass-card p-6 md:p-8 bg-white border-2 rounded-2xl transition-all duration-300 flex flex-col relative ${hoveredCard === index ? 'scale-105 shadow-2xl border-[#994899] z-10' : 'border-gray-200'}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {plan.badge && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#994899] text-white text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-2">{plan.title}</h3>
                <div className="mb-6">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1">/mo</span>
                </div>
                <ul className="space-y-3 text-gray-700 mb-8 flex-grow text-sm md:text-base">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-full font-semibold transition ${plan.button.className}`}>
                  {plan.button.text}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ Section ---------------- */}
      <section id="faq" className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900 text-base md:text-lg pr-4">{faq.question}</span>
                  <span className="text-2xl text-gray-400 flex-shrink-0">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA Section ---------------- */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#CBB2FE] via-[#E5C8FF] via-[#F7DFFF] to-[#FFF0E6]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#14181b]">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-lg md:text-xl mb-10 text-[#14181b]/80 max-w-2xl mx-auto">
            Join thousands of creators and agencies using JEDI to scale their social media presence.
          </p>
          <Link href="/auth/sign-up" className="inline-block bg-purple-700 text-white px-8 md:px-12 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
            Start Free Forever
          </Link>
        </div>
      </section>
    </div>
  );
}
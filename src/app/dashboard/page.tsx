"use client";

import { Button } from "@/components/button";
import { Calendar } from "@/components/Calendar";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import Link from "next/link";
import { useState } from "react";
import LogoIcon from "@/assets/lemora.png";
import { YoutubeSummarizer } from "@/components/YoutubeSummarizer";
import { getHoursRemainingInYear } from "@/utils/timeCalculations";
import dynamic from 'next/dynamic';

const AIHumanizer = dynamic(() => 
  import('@/components/AIHumanizer').then(mod => mod.AIHumanizer), 
  { ssr: false } 
);

const DashboardButton = ({ 
  children, 
  variant = 'primary', 
  active = false,
  onClick,
  className = ''
}: { 
  children: React.ReactNode, 
  variant?: 'primary' | 'secondary', 
  active?: boolean,
  onClick?: () => void,
  className?: string
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-[2.5rem] text-sm font-medium transition-all duration-200 px-6 py-2.5 relative overflow-hidden";
  
  const variants = {
    primary: `${active 
      ? 'bg-[#6D28D9] text-white' 
      : 'bg-[#6D28D9] text-white hover:bg-[#5B21B6]'} 
      transform hover:-translate-y-0.5 active:translate-y-0`,
    secondary: `${active 
      ? 'bg-[#7C3AED]/10 text-[#6D28D9] border-2 border-[#6D28D9]' 
      : 'bg-white text-gray-700 hover:text-[#6D28D9] border-2 border-gray-200 hover:border-[#6D28D9]'} 
      transform hover:-translate-y-0.5 active:translate-y-0`
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default function Dashboard() {
  const [activeView, setActiveView] = useState<'dashboard' | 'calendar' | 'pomodoro' | 'summaries' | 'humanizer'>('dashboard');
  const [activeFolderTab, setActiveFolderTab] = useState('Today');
  const [activeNoteTab, setActiveNoteTab] = useState('Today');

  const Sidebar = () => (
    <aside className="w-60 fixed left-0 top-0 h-screen bg-white border-r border-gray-100 p-6 flex flex-col">
      <div className="mb-6 pb-4 border-b border-gray-100">
        <Link href="/">
          <div className="inline-flex items-center justify-center">
            <img src={LogoIcon.src} className="h-8 w-auto" alt="Lemora Logo" />
          </div>
        </Link>
      </div>
      <nav className="space-y-1 flex-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { id: 'calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { id: 'summaries', label: 'AI Tools', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { id: 'humanizer', label: 'AI Humanizer', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
          { id: 'pomodoro', label: 'Pomodoro', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id as any);
              if (item.id === 'dashboard') {
                setActiveFolderTab('Today');
                setActiveNoteTab('Today');
              }
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeView === item.id 
                ? 'bg-purple-50 text-purple-600 font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* User Profile Section */}
      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-medium">
            U
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Riyaan Patel</p>
            <p className="text-xs text-gray-500">Computer Science</p>
          </div>
        </div>
      </div>
    </aside>
  );

  const ProductivityMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Today&apos;s Focus</p>
            <p className="text-2xl font-semibold text-gray-900">2h 45m</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tasks Completed</p>
            <p className="text-2xl font-semibold text-gray-900">4/6</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-1 bg-gray-100 rounded-full">
            <div className="h-1 bg-blue-500 rounded-full w-2/3"></div>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Weekly Progress</p>
            <p className="text-2xl font-semibold text-gray-900">78%</p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-xl">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Hours Left This Year</p>
            <p className="text-2xl font-semibold text-gray-900">
              {getHoursRemainingInYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const Content = () => (
    <main className="ml-64 h-screen">
      {/* Always render PomodoroTimer but control visibility */}
      <div className={`h-full ${activeView !== 'pomodoro' ? 'hidden' : ''}`}>
        <PomodoroTimer onComplete={() => setActiveView('dashboard')} />
      </div>

      {activeView === 'summaries' ? (
        <YoutubeSummarizer onClose={() => setActiveView('dashboard')} />
      ) : activeView === 'calendar' ? (
        <div className="h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
          </div>
          
          <Calendar />
        </div>
      ) : activeView === 'humanizer' ? (
        <AIHumanizer onClose={() => setActiveView('dashboard')} />
      ) : activeView === 'dashboard' ? (
        <div className="h-full overflow-y-auto p-8 pt-6">
          {/* Welcome Section */}
          <div className="mb-6">
            <div className="bg-gray-100/70 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">Good Morning, Riyaan</h1>
                  <p className="text-gray-600">You have 3 tasks to complete today</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <ProductivityMetrics />
          
          {/* Tasks & Schedule Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tasks List */}
            <div className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Today&apos;s Tasks</h2>
              <div className="space-y-4">
                {[
                  { title: 'Complete Biology Notes', time: '9:00 AM', completed: true },
                  { title: 'Study for Physics Test', time: '11:00 AM', completed: false },
                  { title: 'Review Calculus Problems', time: '2:00 PM', completed: false },
                ].map((task, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      task.completed ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                    }`}>
                      {task.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500">{task.time}</p>
                    </div>
                    <button className="text-gray-400 hover:text-purple-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Timeline */}
            <div className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Daily Schedule</h2>
              <div className="space-y-4">
                {[
                  { time: '9:00 AM', title: 'Biology Lecture', active: true },
                  { time: '11:00 AM', title: 'Study Session' },
                  { time: '2:00 PM', title: 'Group Project Meeting' },
                  { time: '4:00 PM', title: 'Research Work' },
                ].map((item, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${
                    item.active 
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-100 hover:border-purple-200 transition-colors'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 text-sm font-medium ${
                        item.active ? 'text-purple-600' : 'text-gray-500'
                      }`}>
                        {item.time}
                      </div>
                      <div className="h-px bg-gray-100 flex-1"></div>
                      <div className={`font-medium ${
                        item.active ? 'text-purple-600' : 'text-gray-700'
                      }`}>
                        {item.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Notes Section */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Notes</h2>
              <DashboardButton variant="secondary" className="gap-1.5">
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </DashboardButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <button className="text-gray-400 hover:text-purple-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900">Lecture Notes #{item}</h3>
                  <p className="text-sm text-gray-500 mb-4">Biology 101 - Cell Structure</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Last edited: 2h ago</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <Content />
      <div className="fixed bottom-4 left-4 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md z-50">
        BETA
      </div>
    </div>
  );
}
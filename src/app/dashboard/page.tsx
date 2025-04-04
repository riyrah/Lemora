"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/Calendar";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import Link from "next/link";
import { useState } from "react";
import LogoIcon from "@/assets/lemora.png";
import { YoutubeSummarizer } from "@/components/YoutubeSummarizer";
import { getHoursRemainingInYear } from "@/utils/timeCalculations";
import dynamic from 'next/dynamic';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  CalendarDays,
  NotebookText,
  BrainCircuit,
  Timer,
  User,
  Settings,
  ChevronLeft,
} from "lucide-react";

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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'summaries', label: 'AI Summarizer', icon: NotebookText },
    { id: 'humanizer', label: 'AI Humanizer', icon: BrainCircuit },
    { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  ];

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
    <div className="flex-1 h-screen overflow-hidden">
      <main className="h-full w-full overflow-y-auto">
      {/* Always render PomodoroTimer but control visibility */}
      <div className={`h-full ${activeView !== 'pomodoro' ? 'hidden' : ''}`}>
        <PomodoroTimer onComplete={() => setActiveView('dashboard')} />
      </div>

      {activeView === 'summaries' ? (
        <div className="h-full w-full">
          <YoutubeSummarizer onClose={() => setActiveView('dashboard')} />
        </div>
      ) : activeView === 'calendar' ? (
          <div className="h-full w-full">
          <Calendar />
        </div>
      ) : activeView === 'humanizer' ? (
        <AIHumanizer onClose={() => setActiveView('dashboard')} />
      ) : activeView === 'dashboard' ? (
          <div className="h-full w-full overflow-y-auto p-8 pt-6">
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
    </div>
  );

  return (
    <div className="h-screen w-screen max-w-[100vw] overflow-hidden bg-[#FAFAFA]">
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-full w-full overflow-hidden">
          <Sidebar 
            className="border-r border-gray-100 transition-all duration-300 ease-in-out z-20" 
            collapsible="icon"
            variant="sidebar"
          >
            <SidebarHeader className="border-b border-gray-100 p-4 pl-5 group-data-[collapsible=icon]:px-2">
              <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
                <div className="flex-shrink-0 pl-[8px] ml-[2px]">
                  <Link href="/">
                    <div className="flex items-center w-[120px] h-8 overflow-hidden group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all duration-300">
                      <img 
                        src={LogoIcon.src} 
                        className="h-8 w-[120px] object-contain flex-shrink-0" 
                        alt="Lemora Logo" 
                        style={{ objectFit: "contain", objectPosition: "left center" }}
                      />
                    </div>
                  </Link>
                </div>
                <div className="flex-1"></div>
                <SidebarTrigger className="rounded-full border border-gray-200 bg-white p-2 hover:bg-gray-50 data-[state=open]:rotate-180 flex-shrink-0 group-data-[collapsible=icon]:mx-auto"> 
                  <ChevronLeft className="w-4 h-4"/>
                </SidebarTrigger>
              </div>
            </SidebarHeader>
            <SidebarContent className="p-4 pl-5 group-data-[collapsible=icon]:px-2">
              <SidebarGroup className="space-y-2">
                {navItems.map((item) => (
                  <Tooltip key={item.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={activeView === item.id ? "secondary" : "ghost"}
                        className={`w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:px-0 gap-3 rounded-xl transition-all ${
                          activeView === item.id ? 'font-semibold' : ''
                        }`}
                        onClick={() => {
                          setActiveView(item.id as any);
                          if (item.id === 'dashboard') {
                            setActiveFolderTab('Today');
                            setActiveNoteTab('Today');
                          }
                        }}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0 group-data-[collapsible=icon]:mx-auto" />
                        <span className="text-sm group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2 group-data-[collapsible=icon]:block group-data-[collapsible=offcanvas]:hidden">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-gray-100 p-4 mt-auto group-data-[collapsible=icon]:px-2">
               <Tooltip delayDuration={0}>
                 <TooltipTrigger asChild>
                   <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-900 font-medium mx-auto">
                       <User className="w-5 h-5" /> 
                     </div>
                     <div className="flex-1 ml-3 group-data-[collapsible=icon]:hidden">
                       <p className="text-sm font-medium text-gray-900">Riyaan Patel</p>
                       <p className="text-xs text-gray-500">Computer Science</p>
                     </div>
                     <Button variant="ghost" size="icon" className="rounded-full group-data-[collapsible=icon]:hidden">
                        <Settings className="w-5 h-5"/>
                     </Button>
                   </div>
                 </TooltipTrigger>
                 <TooltipContent side="right" className="ml-2 group-data-[collapsible=icon]:block group-data-[collapsible=offcanvas]:hidden">
                   <p>Riyaan Patel</p>
                   <p className="text-xs text-muted-foreground">Computer Science</p>
                 </TooltipContent>
               </Tooltip>
            </SidebarFooter>
          </Sidebar>
          
          <div className="flex-1 min-w-0 overflow-hidden">
            <Content />
          </div>
          
          <div className="fixed bottom-4 right-4 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md z-50">
        BETA
      </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
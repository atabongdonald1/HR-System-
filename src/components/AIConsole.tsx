import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Terminal,
  Cpu,
  BrainCircuit,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Candidate, Employee, JobPost } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isToolCall?: boolean;
}

export function AIConsole({ isAuthReady }: { isAuthReady?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "NEXA-HR Intelligence System online. I am ready to manage your workforce lifecycle. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Real data from Firestore
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);

  useEffect(() => {
    // Candidates and Jobs are public
    const unsubCandidates = onSnapshot(collection(db, 'candidates'), (snapshot) => {
      setCandidates(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Candidate));
    });
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as JobPost));
    });

    // Employees is restricted
    let unsubEmployees = () => {};
    if (isAuthReady && auth.currentUser) {
      unsubEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
        setEmployees(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Employee));
      });
    }

    return () => {
      unsubCandidates();
      unsubEmployees();
      unsubJobs();
    };
  }, [isAuthReady]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = {
        candidates,
        employees,
        jobs,
        region: 'UAE'
      };
      
      const response = await geminiService.getHRRecommendation(input, context);
      
      let finalContent = response.text || "";
      
      // Handle tool calls
      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          finalContent += `\n\n**[NEXA-HR Action: ${call.name}]**\n`;
          if (call.name === 'generateJobPost') {
            finalContent += `Generating job description for ${call.args.role}...`;
            // In a real app, we'd call the actual function and maybe update state/DB
          } else if (call.name === 'sourceTalent') {
            finalContent += `Activating NEXA-SOURCE for ${call.args.location || 'global'} talent pool...`;
          } else if (call.name === 'analyzeCandidateCV') {
            finalContent += `Analyzing CV data for structural assessment...`;
          } else if (call.name === 'checkCompliance') {
            finalContent += `Verifying compliance against UAE Labor Law...`;
          } else if (call.name === 'generatePolicy') {
            finalContent += `Generating comprehensive HR policy for ${call.args.policyName}...`;
          }
        }
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: finalContent || "I encountered an error processing your request.",
        timestamp: new Date(),
        isToolCall: !!response.functionCalls
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I encountered a neural link error. Please check your connection to the NEXA core.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">NEXA-HR Core</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Autonomous Mode Active</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] text-slate-300 font-mono uppercase">Neural Engine v4.2</span>
          </div>
          <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[10px] text-slate-300 font-mono uppercase">Compliance Guard: ON</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex gap-4 max-w-[85%]",
            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'assistant' ? "bg-blue-600" : "bg-slate-700"
            )}>
              {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
            </div>
            <div className={cn(
              "px-5 py-3 rounded-2xl text-sm leading-relaxed",
              msg.role === 'assistant' 
                ? "bg-slate-900 text-slate-300 border border-slate-800" 
                : "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            )}>
              <div className="markdown-body prose prose-invert prose-sm max-w-none">
                <Markdown>{msg.content}</Markdown>
              </div>
              <p className={cn(
                "text-[10px] mt-2 font-mono",
                msg.role === 'assistant' ? "text-slate-500" : "text-blue-200"
              )}>
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-slate-900/50 border-t border-slate-800">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Execute HR command (e.g., 'Analyze Sarah's performance' or 'Hire a driver')..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[
            "Analyze housekeeping supervisor CVs",
            "Generate JD for Logistics Driver",
            "Check UAE labor law compliance",
            "Predict burnout risk for Intelligence dept",
            "Generate Remote Work Policy"
          ].map((suggestion) => (
            <button 
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all whitespace-nowrap flex items-center gap-2 uppercase tracking-wider font-bold"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

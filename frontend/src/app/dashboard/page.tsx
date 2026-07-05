"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { LayoutDashboard, MessageSquare, Target, Lightbulb, Activity, ArrowLeft, LogOut, User as UserIcon } from "lucide-react";
import UploadArea from "@/components/UploadArea";
import Link from "next/link";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("User");

  const router = useRouter();

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dashboard`);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    // Decode JWT to get user email (subject)
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      if (decoded.sub) setUserEmail(decoded.sub);
    } catch (e) {
      console.error("Failed to decode token");
    }

    fetchDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const handleChat = async () => {
    if (!chatQuery.trim()) return;
    
    const userMsg = { role: "user", content: chatQuery };
    setChatHistory([...chatHistory, userMsg]);
    setChatQuery("");
    setChatLoading(true);

    try {
      const res = await api.post(`/chat`, {
        query: userMsg.content,
        session_id: "test-session"
      });
      setChatHistory([...chatHistory, userMsg, { role: "assistant", content: res.data.response }]);
    } catch (error) {
      setChatHistory([...chatHistory, userMsg, { role: "assistant", content: "Sorry, I encountered an error answering that." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderChart = (chartSpec: any, idx: number) => {
    const { type, title, data: chartData } = chartSpec;
    
    let ChartComponent;
    if (type === "line") {
      ChartComponent = (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
          <XAxis dataKey="name" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }} />
          <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      );
    } else if (type === "bar") {
      ChartComponent = (
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
          <XAxis dataKey="name" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }} />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    } else if (type === "area") {
      ChartComponent = (
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
          <XAxis dataKey="name" stroke="#a1a1aa" />
          <YAxis stroke="#a1a1aa" />
          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }} />
          <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
        </AreaChart>
      );
    } else if (type === "pie") {
      ChartComponent = (
        <PieChart>
          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }} />
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      );
    } else {
      return <div className="p-4 text-center text-muted-foreground">Unsupported chart type: {type}</div>;
    }

    return (
      <div key={idx} className="glass p-6 rounded-2xl flex flex-col items-center justify-center min-h-[350px]">
        <h3 className="text-lg font-semibold mb-4 w-full text-left">{title}</h3>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            {ChartComponent}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 glass rounded-full hover:bg-cyan-500/10 transition-colors border border-cyan-500/20 text-cyan-400">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-zinc-100">
              <LayoutDashboard className="text-cyan-400" /> AI Dashboard
            </h1>
          </div>
          
          {/* User Profile & Logout */}
          <div className="flex items-center gap-4 glass px-4 py-2 rounded-full border-cyan-500/20 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
            <div className="flex items-center gap-2 pr-4 border-r border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-zinc-200 hidden md:block">{userEmail}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="text-zinc-400 hover:text-fuchsia-400 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <UploadArea onUploadSuccess={fetchDashboard} />
            
            {loading ? (
              <div className="glass p-12 rounded-2xl text-center animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading dashboard data...</p>
              </div>
            ) : data && (
              <>
                {/* Executive Summary */}
                <div className="glass p-8 rounded-2xl">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Target className="text-purple-500" /> Executive Summary
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {data.executive_summary}
                  </p>
                </div>

                {/* Metrics */}
                {data.important_metrics && Object.keys(data.important_metrics).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(data.important_metrics).map(([key, val], idx) => (
                      <div key={idx} className="glass p-6 rounded-xl flex flex-col justify-center border-t-4 border-t-blue-500">
                        <span className="text-sm text-muted-foreground mb-1">{key}</span>
                        <span className="text-2xl font-bold">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Charts */}
                {data.charts && data.charts.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {data.charts.map((c: any, i: number) => renderChart(c, i))}
                  </div>
                )}

                {/* Insights & Recommendations */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Lightbulb className="text-yellow-500" /> Key Insights
                    </h3>
                    <ul className="space-y-3">
                      {data.key_insights.map((insight: string, i: number) => (
                        <li key={i} className="flex gap-3 text-muted-foreground">
                          <span className="w-6 h-6 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0 text-sm">{i+1}</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Activity className="text-emerald-500" /> Recommendations
                    </h3>
                    <ul className="space-y-3">
                      {data.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex gap-3 text-muted-foreground">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 text-sm">{i+1}</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar Chat Agent */}
          <div className="lg:col-span-1 h-[800px]">
            <div className="glass rounded-2xl h-full flex flex-col border border-white/10 sticky top-8">
              <div className="p-4 border-b border-cyan-500/20 bg-black/40 rounded-t-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.5)]">
                  <MessageSquare className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">AI Analyst Agent</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
                  </p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                    <MessageSquare className="text-white w-4 h-4" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-foreground/90 border border-white/10">
                    Hello! I'm your AI Analyst. Upload a document and I'll generate a dashboard for you. You can also ask me specific questions about the data.
                  </div>
                </div>
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                        <MessageSquare className="text-white w-4 h-4" />
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl text-sm border border-white/10 max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-blue-600/50 rounded-tr-none ml-auto' 
                        : 'bg-white/5 rounded-tl-none text-foreground/90'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                      <MessageSquare className="text-white w-4 h-4" />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 text-sm border border-white/10 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-white/10 bg-black/20 rounded-b-2xl">
                <div className="relative">
                  <input 
                    type="text" 
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask about your data..."
                    className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-muted-foreground"
                  />
                  <button 
                    onClick={handleChat}
                    className="absolute right-2 top-2 p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

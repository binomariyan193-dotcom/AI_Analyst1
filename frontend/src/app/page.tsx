import Link from "next/link";
import { ArrowRight, FileText, BarChart3, TrendingUp, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="px-8 py-6 flex justify-between items-center z-10 glass border-b border-white/10 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">AI Analyst</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        </nav>
        <Link 
          href="/dashboard"
          className="px-5 py-2.5 rounded-full bg-foreground text-background font-medium hover:scale-105 transition-transform flex items-center gap-2"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider">Agentic RAG Platform 2.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Your Data, Analyzed by <br />
          <span className="gradient-text">Autonomous AI Agents</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Upload any document. Get instant executive summaries, interactive visualizations, and predictive forecasts powered by cutting-edge Agentic RAG.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/dashboard"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 flex items-center gap-2 justify-center"
          >
            Launch Workspace <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 max-w-5xl w-full px-4 text-left">
          <FeatureCard 
            icon={<FileText className="w-6 h-6 text-blue-500" />}
            title="Multi-Format Support"
            description="Upload PDF, DOCX, CSV, or Excel. Our agents extract text, tables, and KPIs flawlessly."
          />
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6 text-purple-500" />}
            title="Dynamic Dashboards"
            description="Auto-generated visualizations and metrics tailored to the unique context of your data."
          />
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
            title="Predictive Forecasts"
            description="Leverage historical data to predict future trends with advanced statistical modeling."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass p-8 rounded-2xl hover-lift">
      <div className="w-12 h-12 rounded-xl bg-background/50 border flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

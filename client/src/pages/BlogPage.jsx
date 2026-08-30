import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Footer from "../layout/Footer";
import { ArrowLeft, Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

export default function BlogPage() {
  const { darkMode } = useTheme();

  const blogPosts = [
    {
      slug: "top-ai-social-media-agents",
      title: "Top 5 AI Social Media Agents & Automation Tools in 2026",
      description: "Traditional social media managers are slow and complex. Compare the best AI social media agents (Buffer, Hootsuite, Lately, Taplio, and 11 o'clock) to choose the right copilot for your workflow.",
      date: "August 30, 2026",
      readTime: "6 min read",
      tags: ["AI Agent", "Social Media Automation", "Cross-Posting"],
      category: "Guides"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased relative">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-custom">
        <div className="w-full max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground uppercase">Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 select-none pointer-events-none ${darkMode ? "bg-white" : "bg-black"}`}>
              <img 
                src={darkMode ? "/logo_black.png" : "/logo_white.png"} 
                alt="11 o'clock" 
                className="h-5 w-5 object-contain select-none pointer-events-none"
                draggable="false"
              />
            </div>
            <span className="font-bold tracking-tight text-sm text-foreground">11 o'clock Blog</span>
          </div>
          
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-16 space-y-12">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            Our Blog & Insights
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            AI Social Media Agent Insights & Automation Guides
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Tutorials, reviews, comparative analyses, and design writeups focused on automating cross-platform content creation.
          </p>
        </div>

        {/* Blog Post List */}
        <div className="grid grid-cols-1 gap-8 pt-8">
          {blogPosts.map((post) => (
            <article 
              key={post.slug}
              className="p-6 sm:p-8 rounded-2xl border border-custom bg-card/20 hover:border-primary/20 transition-all duration-300 group flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2.5 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-muted-foreground border border-custom"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {post.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-custom/60 pt-4 mt-2">
                <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <Link 
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2.5 transition-all"
                >
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

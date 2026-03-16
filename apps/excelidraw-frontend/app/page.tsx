import Link from "next/link";
import {
    Pencil, Users, Maximize2, Share2, Shield, Zap,
    Pentagon, ArrowRight, Github, Twitter,
} from "lucide-react";

/* ─── Custom animations (can't express in plain Tailwind) ──────────────────── */
const GLOBAL_CSS = `
  html { scroll-behavior: smooth; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes drift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%      { transform: translate(20px, -30px) scale(1.05); }
    66%      { transform: translate(-15px, 15px) scale(0.97); }
  }

  .anim-fade-up   { animation: fadeUp  0.6s ease both; }
  .anim-fade-up-2 { animation: fadeUp  0.6s ease both; animation-delay: 0.15s; }
  .anim-fade-up-3 { animation: fadeUp  0.6s ease both; animation-delay: 0.3s; }
  .anim-fade-up-4 { animation: fadeUp  0.6s ease both; animation-delay: 0.45s; }
  .anim-fade-up-5 { animation: fadeUp  0.8s ease both; animation-delay: 0.55s; }
  .anim-fade-in   { animation: fadeIn  1s   ease both; animation-delay: 0.3s; }

  .orb { animation: drift 14s ease-in-out infinite; }
  .orb2 { animation: drift 18s ease-in-out infinite reverse; }

  .card-hover {
    transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card-hover:hover {
    border-color: rgba(124, 58, 237, 0.5);
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(124, 58, 237, 0.1);
  }

  .btn-primary {
    background: linear-gradient(135deg, #7c3aed, #3b82f6);
    transition: opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  }
  .btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
  }

  .btn-ghost {
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .btn-ghost:hover {
    background: rgba(255,255,255,0.06);
    transform: translateY(-1px);
  }

  .tech-pill {
    transition: border-color 0.15s ease, color 0.15s ease;
  }
  .tech-pill:hover {
    border-color: rgba(255,255,255,0.3);
    color: #fff;
  }
`;

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const FEATURES = [
    {
        icon: Users,
        iconBg: "linear-gradient(135deg,#7c3aed,#6d28d9)",
        title: "Real-time Collaboration",
        desc: "Draw together with your team in real-time. See changes and cursors flow instantly across every connected user.",
    },
    {
        icon: Maximize2,
        iconBg: "linear-gradient(135deg,#3b82f6,#2563eb)",
        title: "Infinite Canvas",
        desc: "Never run out of space. Pan, zoom, and organize your diagrams and ideas without any limits.",
    },
    {
        icon: Pentagon,
        iconBg: "linear-gradient(135deg,#ec4899,#db2777)",
        title: "Smart Shapes",
        desc: "Rectangles, circles, arrows, diamonds, and freehand drawing — all rendered with a natural hand-drawn style.",
    },
    {
        icon: Share2,
        iconBg: "linear-gradient(135deg,#10b981,#059669)",
        title: "Instant Sharing",
        desc: "Share your board with a link. No downloads, no installs, no friction — just open and collaborate.",
    },
    {
        icon: Shield,
        iconBg: "linear-gradient(135deg,#f59e0b,#d97706)",
        title: "Secure by Default",
        desc: "JWT-authenticated rooms ensure only invited users can view or edit your whiteboards.",
    },
    {
        icon: Zap,
        iconBg: "linear-gradient(135deg,#06b6d4,#0891b2)",
        title: "Lightning Fast",
        desc: "WebSocket-powered sync delivers sub-millisecond updates across all connected users simultaneously.",
    },
];

const TECH = ["Next.js 15", "TypeScript", "WebSockets", "PostgreSQL", "Prisma ORM", "Docker"];

const FOOTER = [
    { heading: "Product",    links: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { heading: "Developers", links: ["API Docs", "GitHub", "Docker Hub", "Self-host"] },
    { heading: "Company",    links: ["About", "Blog", "Contact", "Privacy Policy"] },
];

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
    return (
        <>
            <style>{GLOBAL_CSS}</style>

            <div style={{ backgroundColor: "#000", color: "#fff", minHeight: "100vh" }}>

                {/* ── Navbar ─────────────────────────────────────────────────── */}
                <header style={{
                    position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
                    backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                    <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
                        <Link href="/" className="flex items-center gap-2 font-semibold text-white no-underline">
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg"
                                  style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
                                <Pencil size={14} color="#fff" />
                            </span>
                            <span style={{ fontSize: 15, letterSpacing: "-0.02em" }}>Cali-Draw</span>
                        </Link>

                        <nav className="hidden sm:flex items-center gap-6">
                            <a href="#features" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}
                               className="hover:text-white transition-colors">Features</a>
                            <a href="#about" style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}
                               className="hover:text-white transition-colors">About</a>
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link href="/signin"
                                  style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none", padding: "6px 14px" }}
                                  className="hover:text-white transition-colors">
                                Sign In
                            </Link>
                            <Link href="/signup"
                                  className="btn-primary text-white font-medium rounded-lg"
                                  style={{ fontSize: 14, padding: "7px 16px", textDecoration: "none" }}>
                                Get Started
                            </Link>
                        </div>
                    </div>
                </header>

                {/* ── Hero ───────────────────────────────────────────────────── */}
                <section style={{ position: "relative", overflow: "hidden", paddingTop: 120, paddingBottom: 100 }}>
                    {/* Background orbs */}
                    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
                        <div className="orb" style={{
                            position: "absolute", top: "15%", left: "10%",
                            width: 500, height: 500, borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
                            filter: "blur(60px)",
                        }} />
                        <div className="orb2" style={{
                            position: "absolute", bottom: "10%", right: "10%",
                            width: 450, height: 450, borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
                            filter: "blur(60px)",
                        }} />
                        {/* Subtle grid */}
                        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.03 }}>
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="0.5"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    <div className="max-w-5xl mx-auto px-6 text-center" style={{ position: "relative", zIndex: 1 }}>
                        {/* Badge */}
                        <div className="anim-fade-up inline-flex items-center gap-2 rounded-full mb-8"
                             style={{
                                 padding: "5px 14px", fontSize: 12, fontWeight: 500,
                                 border: "1px solid rgba(124,58,237,0.3)",
                                 background: "rgba(124,58,237,0.08)",
                                 color: "#a78bfa",
                             }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#7c3aed", display: "inline-block" }} className="animate-pulse" />
                            Now with real-time WebSocket sync
                        </div>

                        {/* Heading */}
                        <h1 className="anim-fade-up-2 font-extrabold"
                            style={{
                                fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
                                lineHeight: 1.05,
                                letterSpacing: "-0.03em",
                                marginBottom: 24,
                            }}>
                            Real-time Collaborative
                            <br />
                            <span style={{
                                background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #06b6d4 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>
                                Whiteboard
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="anim-fade-up-3 mx-auto"
                           style={{
                               color: "#9ca3af", fontSize: "1.125rem", lineHeight: 1.7,
                               maxWidth: 560, marginBottom: 40,
                           }}>
                            Draw, sketch, and brainstorm together in real-time. A full-featured
                            collaborative canvas built for modern teams.
                        </p>

                        {/* CTAs */}
                        <div className="anim-fade-up-4 flex items-center justify-center flex-wrap gap-3" style={{ marginBottom: 72 }}>
                            <Link href="/signup"
                                  className="btn-primary inline-flex items-center gap-2 text-white font-semibold rounded-xl"
                                  style={{ padding: "13px 28px", fontSize: 15, textDecoration: "none" }}>
                                Get Started Free <ArrowRight size={16} />
                            </Link>
                            <a href="https://github.com/deeppatel026/excalidraw"
                               className="btn-ghost inline-flex items-center gap-2 font-semibold rounded-xl"
                               style={{
                                   padding: "13px 28px", fontSize: 15, textDecoration: "none",
                                   border: "1px solid rgba(255,255,255,0.12)", color: "#e5e7eb",
                               }}>
                                <Github size={16} /> View on GitHub
                            </a>
                        </div>

                        {/* Canvas mockup */}
                        <div className="anim-fade-up-5 mx-auto" style={{ maxWidth: 860 }}>
                            <div style={{
                                borderRadius: 16, overflow: "hidden",
                                border: "1px solid rgba(255,255,255,0.08)",
                                boxShadow: "0 0 60px rgba(124,58,237,0.2), 0 0 120px rgba(59,130,246,0.1), 0 40px 80px rgba(0,0,0,0.5)",
                            }}>
                                {/* Browser chrome */}
                                <div style={{
                                    background: "#111", padding: "10px 16px",
                                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    display: "flex", alignItems: "center", gap: 6,
                                }}>
                                    <span style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "rgba(239,68,68,0.6)" }} />
                                    <span style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "rgba(234,179,8,0.6)" }} />
                                    <span style={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: "rgba(34,197,94,0.6)" }} />
                                    <div style={{
                                        marginLeft: 12, flex: 1, maxWidth: 280, margin: "0 auto",
                                        background: "rgba(255,255,255,0.05)", borderRadius: 6,
                                        padding: "3px 12px", fontSize: 11, color: "#6b7280", textAlign: "center",
                                    }}>
                                        cali-draw/canvas/canvasId
                                    </div>
                                </div>

                                {/* Canvas area */}
                                <div style={{ position: "relative", background: "#fafafa", height: 340 }}>
                                    {/* Dot grid */}
                                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                                        <defs>
                                            <pattern id="cdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                <circle cx="1" cy="1" r="1" fill="#d1d5db" />
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#cdots)" />
                                    </svg>

                                    {/* Shapes */}
                                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                                         viewBox="0 0 860 340" preserveAspectRatio="xMidYMid meet">

                                        {/* Rectangle (rough style) */}
                                        <path d="M70,80 Q71,78 190,81 Q191,79 192,175 Q191,176 72,174 Q70,176 70,80 Z"
                                              stroke="#7c3aed" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                        <text x="131" y="200" fill="#7c3aed" fontSize="11" fontFamily="monospace"
                                              textAnchor="middle" opacity="0.7">Component</text>

                                        {/* Arrow right */}
                                        <path d="M195,127 Q240,127 268,127" stroke="#9ca3af" strokeWidth="2"
                                              fill="none" strokeLinecap="round"/>
                                        <path d="M260,121 L268,127 L260,133" stroke="#9ca3af" strokeWidth="2"
                                              fill="none" strokeLinecap="round"/>

                                        {/* Circle (rough) */}
                                        <ellipse cx="340" cy="127" rx="68" ry="50"
                                                 stroke="#3b82f6" strokeWidth="2.5" fill="none" />
                                        <text x="340" y="200" fill="#3b82f6" fontSize="11" fontFamily="monospace"
                                              textAnchor="middle" opacity="0.7">API Layer</text>

                                        {/* Arrow right */}
                                        <path d="M410,127 Q445,127 465,127" stroke="#9ca3af" strokeWidth="2"
                                              fill="none" strokeLinecap="round"/>
                                        <path d="M457,121 L465,127 L457,133" stroke="#9ca3af" strokeWidth="2"
                                              fill="none" strokeLinecap="round"/>

                                        {/* Diamond */}
                                        <path d="M540,77 L620,127 L540,177 L460,127 Z"
                                              stroke="#ec4899" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                                        <text x="540" y="200" fill="#ec4899" fontSize="11" fontFamily="monospace"
                                              textAnchor="middle" opacity="0.7">Database</text>

                                        {/* Arrow right */}
                                        <path d="M622,127 Q660,127 680,127" stroke="#9ca3af" strokeWidth="2"
                                              fill="none" strokeLinecap="round"/>
                                        <path d="M672,121 L680,127 L672,133" stroke="#9ca3af" strokeWidth="2"
                                              fill="none" strokeLinecap="round"/>

                                        {/* Rounded rect */}
                                        <rect x="682" y="95" width="120" height="64" rx="8"
                                              stroke="#10b981" strokeWidth="2.5" fill="none"/>
                                        <text x="742" y="131" fill="#10b981" fontSize="11" fontFamily="monospace"
                                              textAnchor="middle" opacity="0.7">Cache</text>

                                        {/* Freehand squiggle */}
                                        <path d="M70,260 Q100,240 130,255 T190,248 T250,258 T310,250 T360,260"
                                              stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

                                        {/* Cursor A */}
                                        <g transform="translate(680,55)">
                                            <path d="M0,0 L0,16 L4,12 L7,18 L9,17 L6,11 L10,11 Z"
                                                  fill="#7c3aed" stroke="white" strokeWidth="0.8"/>
                                            <rect x="11" y="-5" width="46" height="15" rx="3" fill="#7c3aed"/>
                                            <text x="34" y="7" fill="white" fontSize="8"
                                                  fontFamily="sans-serif" textAnchor="middle">Alex</text>
                                        </g>

                                        {/* Cursor B */}
                                        <g transform="translate(180,240)">
                                            <path d="M0,0 L0,16 L4,12 L7,18 L9,17 L6,11 L10,11 Z"
                                                  fill="#3b82f6" stroke="white" strokeWidth="0.8"/>
                                            <rect x="11" y="-5" width="40" height="15" rx="3" fill="#3b82f6"/>
                                            <text x="31" y="7" fill="white" fontSize="8"
                                                  fontFamily="sans-serif" textAnchor="middle">Sam</text>
                                        </g>
                                    </svg>
                                </div>

                                {/* Bottom strip */}
                                <div style={{
                                    background: "#111", padding: "8px 16px",
                                    borderTop: "1px solid rgba(255,255,255,0.06)",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        {["#7c3aed","#3b82f6","#ec4899","#10b981","#f59e0b"].map((c, i) => (
                                            <div key={i} style={{
                                                width: 14, height: 14, borderRadius: 3, backgroundColor: c,
                                                outline: i === 0 ? "2px solid white" : "none",
                                                outlineOffset: 1,
                                            }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: 11, color: "#6b7280" }}>2 collaborators online</span>
                                    <span style={{ fontSize: 11, color: "#6b7280" }}>100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Features ───────────────────────────────────────────────── */}
                <section id="features" style={{ backgroundColor: "#0a0a0a", padding: "96px 0" }}>
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center" style={{ marginBottom: 64 }}>
                            <h2 className="font-bold"
                                style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", letterSpacing: "-0.02em", marginBottom: 12 }}>
                                Everything you need{" "}
                                <span style={{
                                    background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
                                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                                }}>
                                    to create
                                </span>
                            </h2>
                            <p style={{ color: "#6b7280", fontSize: "1.0625rem", maxWidth: 480, margin: "0 auto" }}>
                                Powerful, focused tools designed for teams who think visually.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {FEATURES.map(({ icon: Icon, iconBg, title, desc }) => (
                                <div key={title} className="card-hover rounded-2xl p-6"
                                     style={{ backgroundColor: "#111", border: "1px solid #1a1a1a" }}>
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl mb-5"
                                         style={{ background: iconBg }}>
                                        <Icon size={18} color="#fff" />
                                    </div>
                                    <h3 className="font-semibold" style={{ color: "#f9fafb", marginBottom: 8, fontSize: 15 }}>
                                        {title}
                                    </h3>
                                    <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Tech stack ─────────────────────────────────────────────── */}
                <section id="about" style={{ borderTop: "1px solid #111", borderBottom: "1px solid #111", padding: "64px 0" }}>
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#4b5563",
                                    textTransform: "uppercase", marginBottom: 28 }}>
                            Built with
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {TECH.map(t => (
                                <span key={t} className="tech-pill rounded-full"
                                      style={{
                                          padding: "7px 18px", fontSize: 13, fontWeight: 500,
                                          color: "#9ca3af", border: "1px solid #1f1f1f",
                                          backgroundColor: "rgba(255,255,255,0.02)",
                                      }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ────────────────────────────────────────────────────── */}
                <section style={{ padding: "112px 0" }}>
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <h2 className="font-extrabold"
                            style={{ fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "-0.03em", marginBottom: 16 }}>
                            Start building{" "}
                            <span style={{
                                background: "linear-gradient(135deg,#7c3aed,#3b82f6,#06b6d4)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                            }}>
                                together
                            </span>
                        </h2>
                        <p style={{ color: "#6b7280", fontSize: "1.0625rem", marginBottom: 40, maxWidth: 420, margin: "0 auto 40px" }}>
                            Join teams already using Cali-draw to turn ideas into shared visual reality.
                        </p>
                        <Link href="/signup"
                              className="btn-primary inline-flex items-center gap-2 text-white font-semibold rounded-xl"
                              style={{ padding: "15px 36px", fontSize: 16, textDecoration: "none" }}>
                            Get Started Free <ArrowRight size={18} />
                        </Link>
                        <p style={{ marginTop: 14, fontSize: 13, color: "#4b5563" }}>No credit card required</p>
                    </div>
                </section>

                {/* ── Footer ─────────────────────────────────────────────────── */}
                <footer style={{ backgroundColor: "#0a0a0a", borderTop: "1px solid #111" }}>
                    <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 sm:grid-cols-4 gap-10">
                        {/* Brand */}
                        <div className="col-span-2 sm:col-span-1">
                            <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg"
                                      style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}>
                                    <Pencil size={14} color="#fff" />
                                </span>
                                <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>Cali-Draw</span>
                            </div>
                            <p style={{ color: "#4b5563", fontSize: 13, lineHeight: 1.65, maxWidth: 190 }}>
                                Real-time collaborative whiteboard for modern teams.
                            </p>
                        </div>

                        {/* Link columns */}
                        {FOOTER.map(({ heading, links }) => (
                            <div key={heading}>
                                <h4 style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db", marginBottom: 16 }}>{heading}</h4>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                                    {links.map(l => (
                                        <li key={l}>
                                            <a href="#"
                                               style={{ fontSize: 13, color: "#4b5563", textDecoration: "none" }}
                                               className="hover:text-white transition-colors">
                                                {l}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom row */}
                    <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                         style={{ borderTop: "1px solid #111", paddingTop: 20, paddingBottom: 20 }}>
                        <p style={{ fontSize: 12, color: "#374151" }}>
                            © {new Date().getFullYear()} Cali-Draw. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" style={{ color: "#374151" }} className="hover:text-white transition-colors">
                                <Github size={16} />
                            </a>
                            <a href="#" style={{ color: "#374151" }} className="hover:text-white transition-colors">
                                <Twitter size={16} />
                            </a>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}

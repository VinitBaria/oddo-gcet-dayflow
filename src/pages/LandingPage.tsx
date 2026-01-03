
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield, Zap, Globe, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const LandingPage = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground">
                            Dayflow HR
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary transition-colors">
                                Login
                            </Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all rounded-full px-6">
                                Register Company
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-500/[0.05] -z-10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] opacity-30 animate-pulse" />
                <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] opacity-20" />

                <div className="container mx-auto px-6 text-center z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        v2.0 is now live
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards">
                        The Future of <br className="hidden md:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-primary">Workforce Management</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-forwards">
                        Streamline your operations, empower your employees, and drive growth with an HR platform designed for the modern era.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-forwards">
                        <Link to="/signup" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full h-12 px-8 text-base rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-blue-600 border-0">
                                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full h-12 px-8 text-base rounded-full border-2 hover:bg-muted/50 transition-all duration-300">
                                Live Demo
                            </Button>
                        </Link>
                    </div>

                    {/* Stats/Social Proof */}
                    <div className="mt-20 pt-10 border-t border-border/40 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500 fill-mode-forwards opacity-0">
                        {[
                            { label: "Active Users", value: "10k+" },
                            { label: "Companies", value: "500+" },
                            { label: "Countries", value: "25+" },
                            { label: "Uptime", value: "99.9%" },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-muted/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to scale</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Powerful features packed into a simple, intuitive interface.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Clock className="w-6 h-6 text-blue-500" />,
                                title: "Smart Attendance",
                                description: "Automated tracking, geolocation verify, and seamless integration with payroll."
                            },
                            {
                                icon: <Users className="w-6 h-6 text-purple-500" />,
                                title: "Employee Profiles",
                                description: "Centralized directory with comprehensive profiles and document management."
                            },
                            {
                                icon: <Shield className="w-6 h-6 text-green-500" />,
                                title: "Secure & Compliant",
                                description: "Enterprise-grade security ensuring your data remains safe and compliant."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-6 transition-colors duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 -z-10" />
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-3xl mx-auto bg-background/50 backdrop-blur-sm rounded-3xl p-12 border border-primary/20 shadow-2xl">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to get started?</h2>
                        <p className="text-xl text-muted-foreground mb-10">
                            Join thousands of companies transforming their HR operations today.
                        </p>
                        <Link to="/signup">
                            <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-2xl hover:scale-105 transition-all duration-300 bg-foreground text-background hover:bg-primary hover:text-foreground">
                                Create Free Account
                            </Button>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">No credit card required • 14-day free trial</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border/40 bg-background text-sm">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-xs">D</span>
                        </div>
                        <span className="font-bold text-foreground">Dayflow HR</span>
                    </div>
                    <div className="flex gap-8 text-muted-foreground">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact</a>
                    </div>
                    <div className="text-muted-foreground">
                        © 2024 Dayflow HR Inc.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

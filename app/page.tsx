'use client';

import { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BookOpen, CheckCircle, AlertCircle, LogOut, Sparkles } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const COLORS = ['#38bdf8','#0284c7'];

// Define the expected type of decoded Google JWT
interface GoogleUser {
  given_name: string;
  family_name?: string;
  email: string;
  picture: string;
  name?: string;
  sub: string;
}

export default function Home() {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [syllabus, setSyllabus] = useState("");
  const [covered, setCovered] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLoginSuccess = (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    const decoded: GoogleUser = jwtDecode(credentialResponse.credential);
    setUser(decoded);
    localStorage.setItem("user", JSON.stringify(decoded));
    toast.success(`Welcome ${decoded.given_name}!`);
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    setResult(null);
    localStorage.removeItem("user");
    toast('Logged out', { icon: '👋' });
  };

  const generateAnalysis = async () => {
    if (!user) {
      toast.error("Please sign in first!");
      return;
    }
    if (!syllabus || !covered) {
      toast.error("Please fill in both Syllabus and Covered fields!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syllabus, covered }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
      toast.success("Analysis completed!");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? [
    { name: 'Covered', value: result.percentage_covered },
    { name: 'Remaining', value: 100 - result.percentage_covered }
  ] : [];

  return (
    <main className="min-h-screen bg-slate-50 relative">
      <Toaster position="top-center" />

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-sky-600" />
              <span className="font-bold text-xl text-slate-800">SmartStudy AI</span>
            </div>

            <div className="flex items-center gap-4">
              {!user ? (
                <GoogleLogin 
                  onSuccess={handleLoginSuccess} 
                  onError={() => toast.error("Login failed")}
                  type="standard"
                  theme="outline"
                  shape="pill"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold text-slate-700">{user.given_name}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                  <img src={user.picture} alt="profile" className="h-9 w-9 rounded-full border border-slate-200" />
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Left Side - Inputs */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 mb-3">
                <BookOpen size={20} />
                <h3 className="font-semibold">Syllabus</h3>
              </div>
              <textarea 
                className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm resize-none"
                placeholder="Paste the full course syllabus here..."
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
              />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 mb-3">
                <CheckCircle size={20} />
                <h3 className="font-semibold">What You've Covered</h3>
              </div>
              <textarea 
                className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none"
                placeholder="List the topics you have completed..."
                value={covered}
                onChange={(e) => setCovered(e.target.value)}
              />
            </div>

            <button 
              onClick={generateAnalysis}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all transform active:scale-95 shadow-lg
                ${loading ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-sky-500 hover:bg-sky-600'}
              `}
            >
              {loading ? "Analyzing Gaps..." : "Generate Study Plan"}
            </button>
          </div>

          {/* Right Side - Result */}
          <div className="space-y-6">
            {result && user ? (
              <>
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col items-center min-h-[300px]">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Progress Overview</h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-3xl font-extrabold text-sky-600">{result.percentage_covered}%</span>
                    <span className="text-slate-500 ml-2">Completed</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <AlertCircle className="text-amber-500" />
                    Missing Topics
                  </h3>
                  {result.gaps.map((gap: any, idx: number) => (
                    <div 
                      key={idx}
                      className="bg-white p-4 rounded-lg shadow-sm border-l-4 transition-all hover:shadow-md"
                      style={{ 
                        borderLeftColor: 
                          gap.priority === "High" ? "#0284c7" :
                          gap.priority === "Medium" ? "#38bdf8" : "#7dd3fc"
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800">{gap.topic}</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase 
                          ${gap.priority === 'High' ? 'bg-sky-200 text-blue-700' : 
                            gap.priority === 'Medium' ? 'bg-sky-100 text-blue-600' : 
                            'bg-sky-100 text-sky-700'}`}>
                          {gap.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{gap.reason}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 min-h-[400px] animate-pulse">
                <div className="w-full h-64 bg-slate-100 rounded-xl mb-4"></div>
                <div className="space-y-2 w-full">
                  <div className="h-12 bg-slate-100 rounded-lg"></div>
                  <div className="h-12 bg-slate-100 rounded-lg"></div>
                  <div className="h-12 bg-slate-100 rounded-lg"></div>
                </div>
                <p className="mt-4">Your AI analysis will appear here</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}

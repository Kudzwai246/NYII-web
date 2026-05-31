import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Stats, EoiSubmission } from '../types';
import { ArrowLeft, Users, Download, MapPin, Target } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth, db, signInWithGoogle, handleFirestoreError, OperationType } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [submissions, setSubmissions] = useState<EoiSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      if (currentUser) {
        fetchData();
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const eoisRef = collection(db, 'eois');
      const snap = await getDocs(eoisRef);
      
      const subs: EoiSubmission[] = [];
      const roleCounts: Record<string, number> = {};
      const locationCounts: Record<string, number> = {};
      const interestsCount: Record<string, number> = {};
      
      let optInUpdates = 0;

      snap.forEach(doc => {
        const data = doc.data();
        subs.push({ id: doc.id, ...data } as any);
        
        if (data.role) roleCounts[data.role] = (roleCounts[data.role] || 0) + 1;
        if (data.location) locationCounts[data.location] = (locationCounts[data.location] || 0) + 1;
        if (data.wantsUpdates) optInUpdates++;
        
        if (Array.isArray(data.interests)) {
          data.interests.forEach((interest: string) => {
            interestsCount[interest] = (interestsCount[interest] || 0) + 1;
          });
        }
      });

      subs.sort((a, b) => {
         const timeA = a.createdAt && (a.createdAt as any).toMillis ? (a.createdAt as any).toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
         const timeB = b.createdAt && (b.createdAt as any).toMillis ? (b.createdAt as any).toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
         return timeB - timeA;
      });

      const byRole = Object.entries(roleCounts)
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count);

      const byLocation = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count);

      const sortedInterests = Object.entries(interestsCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        total: snap.size,
        optInUpdates,
        byRole,
        byLocation,
        topInterests: sortedInterests.slice(0, 10),
      });
      setSubmissions(subs);
    } catch (e: any) {
      setError(e.message || "Access denied. Admin privileges required.");
      try {
        handleFirestoreError(e, OperationType.LIST, 'eois');
      } catch (e2) {}
    } finally {
      setLoading(false);
    }
  }

  const handleExport = () => {
    if (!submissions.length) return;
    
    const headers = ['ID', 'Date', 'Name', 'Phone', 'Email', 'Location', 'Role', 'Age Group', 'Interests', 'Likely to Enroll', 'Opted In', 'Comments'];
    
    const csvRows = [
      headers.join(','),
      ...submissions.map(sub => {
         const dateStr = sub.createdAt && (sub.createdAt as any).toDate 
           ? (sub.createdAt as any).toDate().toLocaleDateString() 
           : new Date(sub.createdAt).toLocaleDateString();

         return [
           sub.id,
           dateStr,
           `"${sub.fullname?.replace(/"/g, '""') || ''}"`,
           `"${(sub.phone || '').replace(/"/g, '""')}"`,
           `"${(sub.email || '').replace(/"/g, '""')}"`,
           `"${(sub.location || '').replace(/"/g, '""')}"`,
           `"${sub.role || ''}"`,
           `"${sub.ageGroup || ''}"`,
           `"${(sub.interests || []).join('; ')}"`,
           `"${sub.likelyToEnroll || ''}"`,
           sub.wantsUpdates ? 'Yes' : 'No',
           `"${(sub.comments || '').replace(/"/g, '""')}"`
         ].join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyii_demand_data_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Loading analytics...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-slate-200">
           <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
           <p className="text-slate-600 mb-8 text-sm">Please sign in as an administrator to view the demand pool data.</p>
           {error && (
             <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
               {error}
             </div>
           )}
           <button 
              onClick={async () => {
                try {
                  setError('');
                  setLoading(true);
                  await signInWithGoogle();
                } catch(e: any) {
                  setLoading(false);
                  setError(e.message || "Failed to sign in. If you are using the AI Studio preview, please open the app in a new tab.");
                }
              }}
              className="inline-flex justify-center w-full bg-slate-900 text-white font-medium py-3 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
              disabled={loading}
           >
             {loading ? 'Signing in...' : 'Sign In with Google'}
           </button>
        </div>
      </div>
    );
  }

  if (error || !stats) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center">
         <div className="max-w-md bg-white p-8 rounded-xl border border-red-200">
           <p className="text-red-600 font-medium mb-4">{error || "Access Denied."}</p>
           <p className="text-sm text-slate-500 mb-6">You do not have permission to view this resource.</p>
           <Link to="/" className="text-sm underline text-slate-800">Return to Home</Link>
         </div>
      </div>
     )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="px-6 py-6 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <Link to="/" className="text-slate-400 hover:text-slate-900">
               <ArrowLeft className="w-5 h-5" />
             </Link>
             <h1 className="font-semibold tracking-tight text-lg">NYII Demand Analytics</h1>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </header>

      <main className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
             <div className="flex justify-between items-start mb-4">
               <p className="text-sm font-medium text-slate-500">Total Demand</p>
               <Users className="w-4 h-4 text-slate-400" />
             </div>
             <p className="text-3xl font-semibold">{stats.total}</p>
             <p className="text-xs text-slate-400 mt-2">Registered Expressions of Interest</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
             <div className="flex justify-between items-start mb-4">
               <p className="text-sm font-medium text-slate-500">Engagement</p>
               <Target className="w-4 h-4 text-slate-400" />
             </div>
             <p className="text-3xl font-semibold">{stats.optInUpdates}</p>
             <p className="text-xs text-slate-400 mt-2">Opted in for communications</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm sm:col-span-2 md:col-span-2">
             <p className="text-sm font-medium text-slate-500 mb-4">Top Roles Expressing Interest</p>
             <div className="space-y-3">
               {stats.byRole.slice(0,3).map((r, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-1/3 text-sm text-slate-700 truncate">{r.role || 'Unknown'}</div>
                    <div className="w-2/3 cursor-default" title={`${r.count} submissions`}>
                      <div className="h-2 bg-slate-900 rounded-full" style={{ width: `${Math.max(5, (r.count/stats.total)*100)}%` }}></div>
                    </div>
                  </div>
               ))}
               {stats.byRole.length === 0 && <div className="text-xs text-slate-400">No data yet</div>}
             </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-medium mb-6 text-slate-700">Top Locations</h3>
            <div className="space-y-4">
                {stats.byLocation.slice(0,5).map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{l.location}</span>
                    </span>
                    <span className="font-medium">{l.count}</span>
                  </div>
                ))}
                {stats.byLocation.length === 0 && <div className="text-sm text-slate-400">No data yet</div>}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-medium mb-6 text-slate-700">Program Interests</h3>
            <div className="flex flex-wrap gap-2">
                {stats.topInterests.map((t, i) => (
                   <span key={i} className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200">
                     {t.name} ({t.count})
                   </span>
                ))}
                {stats.topInterests.length === 0 && <div className="text-sm text-slate-400">No data yet</div>}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4 text-slate-800">Recent Submissions (Last 500)</h2>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Intent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          No submissions recorded yet.
                        </td>
                      </tr>
                   ) : submissions.slice(0,50).map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          {sub.createdAt && (sub.createdAt as any).toDate 
                            ? (sub.createdAt as any).toDate().toLocaleDateString() 
                            : new Date(sub.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                           {sub.fullname}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                           {sub.role}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                           {sub.location}
                        </td>
                        <td className="px-6 py-4">
                           <span className={cn(
                             "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                             sub.likelyToEnroll.includes('Yes') ? "bg-green-100 text-green-700" :
                             sub.likelyToEnroll.includes('Maybe') ? "bg-yellow-100 text-yellow-800" :
                             "bg-slate-100 text-slate-600"
                           )}>
                             {sub.likelyToEnroll.includes('Yes') ? 'High Intent' : 
                              sub.likelyToEnroll.includes('Maybe') ? 'Warm Info' : 'Low Intent'}
                           </span>
                        </td>
                      </tr>
                   ))}
                </tbody>
              </table>
            </div>
            {submissions.length > 50 && (
               <div className="px-6 py-4 border-t border-slate-200 text-center text-sm text-slate-500">
                 Showing 50 most recent entries. Export to view all {submissions.length}.
               </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

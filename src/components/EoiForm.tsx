import React, { useState, useEffect } from 'react';
import type { EoiData } from '../types';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth, db, signInWithGoogle, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ROLES = [
  "Parent",
  "Student",
  "Guardian",
  "Employer",
  "Supporter",
  "Other"
];

const INTERESTS = [
  "Day program",
  "Boarding program",
  "AI Systems & Software Architecture",
  "Smart Infrastructure & Renewable Energy",
  "High-Yield Agritech & Food Logistics",
  "Creative Media Engineering & Design",
  "Other"
];

const INITIAL_STATE: EoiData = {
  fullname: '',
  phone: '',
  email: '',
  location: '',
  role: '',
  ageGroup: '',
  interests: [],
  likelyToEnroll: '',
  wantsUpdates: false,
  comments: ''
};

export default function EoiForm() {
  const [formData, setFormData] = useState<EoiData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Hydrate email if missing
        setFormData(prev => ({ ...prev, email: prev.email || currentUser.email || '' }));
        // Check if already submitted
        try {
          const docRef = doc(db, 'eois', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setAlreadySubmitted(true);
          }
        } catch (err: any) {
             // If we get permission denied on getDoc, it means they might not be owner? No, read allows if uid matches
             console.error("Error checking existing submission:", err);
        }
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in. If you are in the AI Studio preview, please open the app in a new tab to sign in.");
    } finally {
      setLoading(false);
    }
  };

  // Adaptive form helpers
  const showAgeField = ["Student", "Parent", "Guardian"].includes(formData.role);
  const ageFieldLabel = formData.role === "Student" 
    ? "Your age" 
    : "Age of prospective student";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      
      if (name === 'interests') {
        const updatedInterests = checked 
          ? [...formData.interests, value]
          : formData.interests.filter(i => i !== value);
        setFormData(prev => ({ ...prev, interests: updatedInterests }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else if (type === 'radio') {
       if ((e.target as HTMLInputElement).checked) {
         setFormData(prev => ({...prev, [name]: value}));
       }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
       setError("Please sign in with Google before submitting.");
       return;
    }
    if (!formData.fullname || !formData.role || !formData.likelyToEnroll) {
      setError("Please fill in all required fields.");
      return;
    }
    if (formData.interests.length === 0) {
      setError("Please select at least one area of interest.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const docRef = doc(db, 'eois', user.uid);
      
      // Clean up empty optional fields
      const submitData: any = {
        fullname: formData.fullname,
        location: formData.location,
        role: formData.role,
        interests: formData.interests,
        likelyToEnroll: formData.likelyToEnroll,
        wantsUpdates: formData.wantsUpdates,
        createdAt: serverTimestamp(),
      };
      
      if (formData.phone) submitData.phone = formData.phone;
      if (formData.email) submitData.email = formData.email;
      if (formData.ageGroup && showAgeField) submitData.ageGroup = formData.ageGroup;
      if (formData.comments) submitData.comments = formData.comments;

      await setDoc(docRef, submitData);
      
      setSuccess(true);
      setAlreadySubmitted(true);
    } catch (err: any) {
       try {
           handleFirestoreError(err, OperationType.CREATE, 'eois');
       } catch (firebaseErr: any) {
           setError("Failed to register. You may have already submitted this form.");
       }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthChecking) {
     return <div className="p-8 text-center text-slate-500">Checking session...</div>;
  }

  if (!user && !success && !alreadySubmitted) {
    return (
      <div className="text-center py-12 px-6">
        <h3 className="text-xl font-medium text-slate-900 mb-4">Join the Waitlist</h3>
        <p className="text-slate-600 mb-8 max-w-sm mx-auto leading-relaxed">
           To ensure we're gathering verified demand, please sign in with your Google account to access the form. Limit one expression of interest per person.
        </p>
        <button 
          onClick={handleLogin}
          disabled={loading}
          className="inline-flex items-center justify-center space-x-2 w-full max-w-sm py-4 px-6 text-slate-900 font-medium bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>{loading ? 'Opening Google Sign In...' : 'Continue with Google'}</span>
        </button>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-medium text-slate-900 mb-2">Thank you</h3>
        <p className="text-slate-600 mb-6">You have already registered your interest. Limit one expression of interest per verified Google account. This helps us build real proof of demand.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      {/* Personal Info */}

      <div className="space-y-4 text-left">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-900 mb-1">I am a... *</label>
          <select 
            id="role" 
            name="role" 
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
            required
          >
            <option value="" disabled>Select your role first</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {formData.role && (
          <>
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-slate-900 mb-1">Full Name *</label>
              <input 
                type="text" 
                id="fullname" 
                name="fullname" 
                value={formData.fullname}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-900 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-1">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-900 mb-1">Location / Town *</label>
                <input 
                  type="text" 
                  id="location" 
                  name="location" 
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>
            </div>

            {showAgeField && (
              <div>
                 <label htmlFor="ageGroup" className="block text-sm font-medium text-slate-900 mb-1">{ageFieldLabel}</label>
                 <input 
                    type="text" 
                    id="ageGroup" 
                    name="ageGroup" 
                    placeholder="e.g. 16-18, 19-24"
                    value={formData.ageGroup}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
              </div>
            )}
          </>
        )}
      </div>

      {formData.role && (
        <>
          {/* Program Interests */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-900">What {["Student", "Parent", "Guardian"].includes(formData.role) ? "programs are you interested in" : "areas do you want to support/recruit from"}? (Select all that apply) *</label>
            <div className="grid grid-cols-1 gap-3 text-sm">
              {INTERESTS.map(interest => (
                <label key={interest} className="flex items-start space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="interests" 
                    value={interest}
                    checked={formData.interests.includes(interest)}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                  />
                  <span className="text-slate-700">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Likelihood */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-900">If NYII launches, would you likely enroll, support, or recommend the project? *</label>
            <div className="space-y-2 text-sm">
              {['Yes, definitively', 'Maybe, I need more info', 'No'].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="likelyToEnroll" 
                    value={opt}
                    checked={formData.likelyToEnroll === opt}
                    onChange={handleChange}
                    className="w-4 h-4 text-slate-900 border-slate-300 focus:ring-slate-900"
                    required
                  />
                  <span className="text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label htmlFor="comments" className="block text-sm font-medium text-slate-900 mb-1">Optional Comments</label>
            <textarea 
              id="comments" 
              name="comments" 
              rows={3}
              value={formData.comments}
              onChange={handleChange}
              placeholder="Any thoughts or suggestions?"
              className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
             <label className="flex items-start space-x-3 cursor-pointer text-sm mb-6">
                <input 
                  type="checkbox" 
                  name="wantsUpdates" 
                  checked={formData.wantsUpdates}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                />
                <span className="text-slate-600 leading-snug">
                  I agree to be contacted about NYII updates and future opportunities. (Details will only be used for project communications)
                </span>
              </label>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 px-6 text-white font-medium bg-slate-900 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Join the Waitlist'}
              </button>
          </div>
        </>
      )}

    </form>
  )
}

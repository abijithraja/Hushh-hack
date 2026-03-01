'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { gigApi } from '@/lib/api';
import { uploadImage } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function PostGigPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated, isRegistered } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) { router.push('/'); return; }
      if (!isRegistered)    { router.push('/register'); return; }
    }
  }, [authLoading, isAuthenticated, isRegistered, router]);

  // ── Skill tag helpers ──
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || requiredSkills.includes(trimmed)) { setSkillInput(''); return; }
    setRequiredSkills(prev => [...prev, trimmed]);
    setSkillInput('');
  };
  const removeSkill = (s: string) => setRequiredSkills(prev => prev.filter(x => x !== s));
  const handleSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim())       newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      let image_url: string | undefined;
      if (imageFile) image_url = await uploadImage(imageFile);
      const result = await gigApi.create({
        title: formData.title,
        description: formData.description,
        image_url,
        required_skills: requiredSkills.length > 0 ? requiredSkills : undefined,
      });
      if (!result) {
        toast.error('Failed to post gig. Please try again.');
        setSubmitting(false);
        return;
      }
      toast.success('Gig posted successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error posting gig:', error);
      toast.error('Failed to post gig. Please try again.');
      setSubmitting(false);
    }
  };

  if (authLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h1 className="text-3xl font-semibold text-black mb-2">Post a Gig</h1>
          <p className="text-gray-600 mb-8">Share a task and let peers help you build skills together</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Gig Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Build a React component library"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                id="description"
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe what needs to be done, what you're looking for, and any specific requirements..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills (Optional)</label>
              {requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {requiredSkills.map((skill) => (
                    <span key={skill} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-blue-400 hover:text-blue-700 font-bold leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKey}
                  placeholder="e.g. React, Python — press Enter to add"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">Applicants will see their skill match % against these.</p>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image (Optional)</label>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >×</button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Click to upload an image</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#0A66C2] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#004182] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Posting...' : 'Post Gig'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


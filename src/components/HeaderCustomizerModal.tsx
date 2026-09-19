import React, { useState } from 'react';
import { Settings, Image, Sparkles, X, Save, Check } from 'lucide-react';
import { HeaderConfig } from '../types';
import { VsbCollegeLogo } from './VsbCollegeLogo';

interface HeaderCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HeaderConfig;
  onSave: (newConfig: HeaderConfig) => void;
}

export const HeaderCustomizerModal: React.FC<HeaderCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [formData, setFormData] = useState<HeaderConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'leftLogoUrl' | 'rightLogoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Logo file size exceeds 10MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setFormData(prev => ({ ...prev, [field]: ev.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#D4AF37] overflow-hidden my-8 text-[#171717]">
        
        {/* Header */}
        <div className="bg-[#FAFAFA] px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/15 rounded-xl border border-[#D4AF37]/35 text-[#A67C00]">
              <Settings className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-serif-title text-lg font-bold text-[#171717]">Edit Header & Website Branding</h2>
              <p className="text-xs text-[#666666]">Customize logos (Up to 10MB upload), site title, slogans, and announcement banner</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-[#171717] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Circular Logo Upload / Image URL Inputs */}
          <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm text-[#171717] flex items-center gap-2 border-b border-[#D4AF37]/20 pb-2">
              <Image className="w-4 h-4 text-[#D4AF37]" />
              <span>Circular Header Logos (Left & Right Uploads - Up to 10MB)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Logo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#171717]">
                  Left Circular Logo (College Emblem)
                </label>
                <div className="flex items-center gap-3">
                  {!formData.leftLogoUrl || formData.leftLogoUrl.includes('unsplash') || formData.leftLogoUrl.includes('placeholder') ? (
                    <VsbCollegeLogo className="w-12 h-12 shrink-0 drop-shadow-sm" />
                  ) : (
                    <img
                      src={formData.leftLogoUrl}
                      alt="Left Logo Preview"
                      className="w-12 h-12 rounded-full object-contain border-2 border-[#D4AF37] bg-white p-0.5 shadow-sm shrink-0"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e, 'leftLogoUrl')}
                    className="text-xs text-[#666666] file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37]/15 file:text-[#A67C00] cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Logo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#171717]">
                  Right Circular Logo (Lit Club Emblem)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.rightLogoUrl}
                    alt="Right Logo Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37] bg-white p-0.5 shadow-sm shrink-0"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e, 'rightLogoUrl')}
                    className="text-xs text-[#666666] file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37]/15 file:text-[#A67C00] cursor-pointer"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Titles & Slogans */}
          <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-3">
            <h3 className="font-semibold text-sm text-[#171717] flex items-center gap-2 border-b border-[#D4AF37]/20 pb-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Site Titles & Slogan</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Site Title</label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Subtitle / Institution Name</label>
                <input
                  type="text"
                  value={formData.siteSubtitle}
                  onChange={(e) => setFormData({ ...formData, siteSubtitle: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Hero Banner Slogan</label>
              <input
                type="text"
                value={formData.heroSlogan}
                onChange={(e) => setFormData({ ...formData, heroSlogan: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37] font-serif-title font-bold text-[#A67C00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Hero Subtext Description</label>
              <textarea
                rows={2}
                value={formData.heroSubtext}
                onChange={(e) => setFormData({ ...formData, heroSubtext: e.target.value })}
                className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Announcement Banner */}
          <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
              <label className="font-semibold text-sm text-[#171717]">Top Notification Banner</label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#171717]">
                <input
                  type="checkbox"
                  checked={formData.showAnnouncement}
                  onChange={(e) => setFormData({ ...formData, showAnnouncement: e.target.checked })}
                  className="rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                Show Announcement Banner
              </label>
            </div>

            {formData.showAnnouncement && (
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Announcement Text</label>
                <input
                  type="text"
                  value={formData.announcementText}
                  onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-[#666666] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Changes Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Save Header Changes</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

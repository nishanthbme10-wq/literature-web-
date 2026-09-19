import React, { useState } from 'react';
import { X, Save, Image as ImageIcon, Sparkles } from 'lucide-react';
import { HeaderConfig, User } from '../types';

interface HeaderEditModalProps {
  headerConfig: HeaderConfig;
  currentUser: User | null;
  onClose: () => void;
  onSave: (updated: HeaderConfig) => void;
}

export const HeaderEditModal: React.FC<HeaderEditModalProps> = ({
  headerConfig,
  currentUser,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<HeaderConfig>({ ...headerConfig });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userName: currentUser?.fullName || 'Admin',
          userRole: currentUser?.role || 'admin',
        }),
      });

      if (res.ok) {
        onSave(formData);
        onClose();
      } else {
        alert("Failed to update header configuration.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving header configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#F8F6F0] rounded-xl border-2 border-[#C9A24B] shadow-2xl w-full max-w-2xl overflow-hidden text-[#0A1F5A]">
        
        {/* Modal Header */}
        <div className="bg-[#0A1F5A] px-6 py-4 flex items-center justify-between text-[#F8F6F0] border-b-2 border-[#C9A24B]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A24B]" />
            <h3 className="font-serif-title text-lg font-bold">Edit Header & Site Identity</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0A1F5A] uppercase tracking-wider mb-1">
                Website Name
              </label>
              <input
                type="text"
                required
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#C9A24B]/40 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A1F5A] uppercase tracking-wider mb-1">
                College / Subtitle
              </label>
              <input
                type="text"
                required
                value={formData.siteSubtitle}
                onChange={(e) => setFormData({ ...formData, siteSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#C9A24B]/40 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
              />
            </div>
          </div>

          {/* Logo Placeholders */}
          <div className="p-4 bg-white border border-[#C9A24B]/30 rounded-xl space-y-4 shadow-sm">
            <h4 className="font-serif-title text-xs font-bold text-[#7A102A] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#C9A24B]" />
              Circular Header Logo Placeholders
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Left Circular Logo Image URL (e.g. College Logo)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    value={formData.leftLogoUrl}
                    onChange={(e) => setFormData({ ...formData, leftLogoUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#F8F6F0] border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0A1F5A]"
                  />
                  <div className="w-10 h-10 rounded-full border-2 border-[#C9A24B] overflow-hidden shrink-0 bg-white p-0.5">
                    <img src={formData.leftLogoUrl} alt="Left Logo Preview" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Right Circular Logo Image URL (e.g. Club Emblem)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    value={formData.rightLogoUrl}
                    onChange={(e) => setFormData({ ...formData, rightLogoUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#F8F6F0] border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#0A1F5A]"
                  />
                  <div className="w-10 h-10 rounded-full border-2 border-[#C9A24B] overflow-hidden shrink-0 bg-white p-0.5">
                    <img src={formData.rightLogoUrl} alt="Right Logo Preview" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Slogan & Subtext */}
          <div>
            <label className="block text-xs font-bold text-[#0A1F5A] uppercase tracking-wider mb-1">
              Hero Section Slogan
            </label>
            <input
              type="text"
              required
              value={formData.heroSlogan}
              onChange={(e) => setFormData({ ...formData, heroSlogan: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#C9A24B]/40 rounded-lg text-sm font-serif-body italic focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0A1F5A] uppercase tracking-wider mb-1">
              Hero Section Introduction Subtext
            </label>
            <textarea
              rows={2}
              value={formData.heroSubtext}
              onChange={(e) => setFormData({ ...formData, heroSubtext: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#C9A24B]/40 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#C9A24B]"
            />
          </div>

          {/* Announcement Banner Settings */}
          <div className="p-4 bg-white border border-[#C9A24B]/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0A1F5A] uppercase tracking-wider">
                Show Top Notification Banner
              </label>
              <input
                type="checkbox"
                checked={formData.showAnnouncement}
                onChange={(e) => setFormData({ ...formData, showAnnouncement: e.target.checked })}
                className="w-4 h-4 text-[#7A102A] accent-[#7A102A] rounded cursor-pointer"
              />
            </div>
            {formData.showAnnouncement && (
              <input
                type="text"
                value={formData.announcementText}
                onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                placeholder="Enter alert / announcement text..."
                className="w-full px-3 py-2 bg-[#F8F6F0] border border-gray-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0A1F5A]"
              />
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C9A24B]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-[#0A1F5A] hover:bg-[#0A1F5A]/90 text-[#F8F6F0] text-xs font-bold rounded-lg shadow-md transition-all border border-[#C9A24B]"
            >
              <Save className="w-4 h-4 text-[#C9A24B]" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

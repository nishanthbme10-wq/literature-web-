import React from 'react';
import { HeroBanner } from './HeroBanner';
import { WinnersSection } from './WinnersSection';
import { WorkshopsSection } from './WorkshopsSection';
import { GallerySection } from './GallerySection';
import { HeaderConfig, User, Workshop, Winner, GalleryItem, MonthlyActivity } from '../types';
import { BookOpen, Sparkles, Feather, ShieldCheck, Mail, Phone, MapPin, ExternalLink, Calendar } from 'lucide-react';

interface HomeSectionProps {
  headerConfig: HeaderConfig;
  currentUser: User | null;
  workshops: Workshop[];
  winners: Winner[];
  galleryItems: GalleryItem[];
  activities: MonthlyActivity[];
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenBulkCertModal: () => void;
  onAddWinner: (winner: Omit<Winner, 'id'>) => void;
  onUpdateWinner: (id: string, updated: Partial<Winner>) => void;
  onDeleteWinner: (id: string) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  headerConfig,
  currentUser,
  workshops,
  winners,
  galleryItems,
  activities,
  onOpenAuth,
  onOpenBulkCertModal,
  onAddWinner,
  onUpdateWinner,
  onDeleteWinner,
}) => {
  const upcomingWorkshop = workshops.find((w) => w.status === 'Open') || workshops[0];

  const handleQuickRegister = () => {
    if (upcomingWorkshop?.googleFormUrl) {
      window.open(upcomingWorkshop.googleFormUrl, '_blank');
    }
  };

  const currentMonthActivities = activities.filter((a) => !a.isPreviousMonth);
  const previousMonthActivities = activities.filter((a) => a.isPreviousMonth);

  return (
    <div className="space-y-0 text-[#0A1F5A]">
      
      {/* Hero Banner Section */}
      <HeroBanner
        headerConfig={headerConfig}
        upcomingWorkshop={upcomingWorkshop}
        onRegisterClick={handleQuickRegister}
        onDownloadCertificateClick={() => {
          if (!currentUser) {
            onOpenAuth('login');
          } else {
            const el = document.getElementById('student-dashboard-trigger');
            if (el) el.click();
          }
        }}
      />

      {/* About Literature Club Section */}
      <section className="py-16 bg-[#F8F6F0] border-b border-[#C9A24B]/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-2">
                <Feather className="w-5 h-5 text-[#7A102A]" />
                <span className="text-xs font-bold text-[#7A102A] uppercase tracking-widest">
                  ABOUT OUR LITERARY HAVEN
                </span>
              </div>

              <h2 className="font-serif-title text-3xl sm:text-4xl font-extrabold text-[#0A1F5A] leading-tight">
                Fostering Eloquence, Creative Thought & Research Rigor
              </h2>

              <p className="text-sm text-gray-700 leading-relaxed">
                The <strong>Literature Club at VSB Engineering College</strong> serves as a creative sanctuary for engineering minds to explore the intersection of technical innovation and artistic expression. Through structured masterclasses in research paper writing, parliamentary debate, short story spinning, and performance poetry, we empower students to articulate their ideas with clarity and impact.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border-l-4 border-[#0A1F5A] shadow-sm">
                  <h4 className="font-serif-title text-sm font-bold text-[#0A1F5A]">Academic Excellence</h4>
                  <p className="text-xs text-gray-600 mt-1">Guiding students on IEEE formatting, abstract writing, and research publication ethics.</p>
                </div>

                <div className="bg-white p-4 rounded-xl border-l-4 border-[#7A102A] shadow-sm">
                  <h4 className="font-serif-title text-sm font-bold text-[#7A102A]">Creative Oratory</h4>
                  <p className="text-xs text-gray-600 mt-1">Nurturing stage confidence, public debate, and poetry recitations across all engineering streams.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-4 border-[#C9A24B] shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800"
                  alt="VSB Literature Club Gathering"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F5A] via-transparent to-transparent flex items-end p-6">
                  <p className="text-white font-serif-body text-base italic">
                    “Language is the dress of thought.” — Samuel Johnson
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Latest Activities & Previous Month Highlights Section */}
      <section className="py-16 bg-white border-b border-[#C9A24B]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between border-b-2 border-[#C9A24B] pb-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-[#7A102A]" />
              <div>
                <h2 className="font-serif-title text-2xl sm:text-3xl font-black uppercase tracking-wider text-[#0A1F5A]">
                  Latest Activities & Previous Month Highlights
                </h2>
                <p className="text-xs text-gray-600 font-medium">Recent symposiums, competitions, and editorial discussions</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Current Month Activities Column */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="font-serif-title text-base font-bold text-[#7A102A] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A24B]" />
                Current Month Events (August 2026)
              </h3>

              <div className="space-y-4">
                {currentMonthActivities.map((act) => (
                  <div
                    key={act.id}
                    className="bg-[#F8F6F0] p-5 rounded-2xl border border-[#C9A24B]/30 shadow-sm hover:shadow-md transition-all border-l-4 border-l-[#0A1F5A] flex flex-col sm:flex-row gap-4 items-start"
                  >
                    <img
                      src={act.imageUrl}
                      alt={act.title}
                      className="w-full sm:w-28 h-24 object-cover rounded-xl shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-[#7A102A] bg-[#7A102A]/10 px-2 py-0.5 rounded">
                        {act.category}
                      </span>
                      <h4 className="font-serif-title text-base font-bold text-[#0A1F5A]">
                        {act.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {act.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Previous Month Highlights Column */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-serif-title text-base font-bold text-[#0A1F5A] uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C9A24B]" />
                Previous Month Highlights (July 2026)
              </h3>

              <div className="space-y-4">
                {previousMonthActivities.map((act) => (
                  <div
                    key={act.id}
                    className="bg-[#0A1F5A] text-[#F8F6F0] p-5 rounded-2xl border border-[#C9A24B] shadow-md space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-[#C9A24B]">
                      <span className="font-bold">{act.date}</span>
                      <span className="text-[10px] uppercase font-bold bg-[#7A102A] text-white px-2 py-0.5 rounded">
                        {act.category}
                      </span>
                    </div>
                    <h4 className="font-serif-title text-base font-bold text-white">
                      {act.title}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed opacity-90">
                      {act.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Monthly Winners Section */}
      <WinnersSection
        winners={winners}
        currentUser={currentUser}
        onOpenBulkDownloadModal={onOpenBulkCertModal}
        onAddWinner={onAddWinner}
        onUpdateWinner={onUpdateWinner}
        onDeleteWinner={onDeleteWinner}
      />

      {/* Workshops Section */}
      <WorkshopsSection
        workshops={workshops}
        currentUser={currentUser}
      />

      {/* Photo Gallery Preview */}
      <GallerySection
        galleryItems={galleryItems}
        currentUser={currentUser}
      />

      {/* Contact Details & Footer */}
      <footer className="bg-[#0A1F5A] text-[#F8F6F0] border-t-4 border-[#C9A24B] pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[#C9A24B]/30">
            
            {/* Col 1: Club Info */}
            <div className="space-y-3">
              <h3 className="font-serif-title text-xl font-bold text-[#F8F6F0]">
                Literature Club
              </h3>
              <p className="text-xs text-[#C9A24B] font-bold tracking-widest uppercase">
                VSB Engineering College
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                NH-67, Karur-Trichy Main Road, Kovai Road, Karur, Tamil Nadu 639111.
              </p>
            </div>

            {/* Col 2: Quick Contact */}
            <div className="space-y-3">
              <h4 className="font-serif-title text-sm font-bold text-[#C9A24B] uppercase tracking-wider">
                Contact Details
              </h4>
              <div className="space-y-2 text-xs text-gray-300">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C9A24B]" />
                  <span>literatureclub@vsbec.ac.in</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C9A24B]" />
                  <span>+91 98765 43210 / +91 98123 45678</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A24B]" />
                  <span>Admin Block & Central Library, VSBEC</span>
                </p>
              </div>
            </div>

            {/* Col 3: Social Links */}
            <div className="space-y-3">
              <h4 className="font-serif-title text-sm font-bold text-[#C9A24B] uppercase tracking-wider">
                Connect & Social Media
              </h4>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-3 py-1.5 bg-[#7A102A] rounded-lg border border-[#C9A24B]/40">FB / LiteratureVSB</span>
                <span className="px-3 py-1.5 bg-[#7A102A] rounded-lg border border-[#C9A24B]/40">IG / LiteratureVSB</span>
                <span className="px-3 py-1.5 bg-[#7A102A] rounded-lg border border-[#C9A24B]/40">TW / LiteratureVSB</span>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
            <p>&copy; {new Date().getFullYear()} VSB Engineering College Literature Club. All Rights Reserved.</p>
            <p className="italic text-[#C9A24B]">“Inspiring Reading, Writing, Research, and Creativity.”</p>
          </div>

        </div>
      </footer>

    </div>
  );
};

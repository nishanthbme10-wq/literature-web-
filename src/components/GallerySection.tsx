import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Image as ImageIcon,
  Plus,
  X,
  Maximize2,
  Trash2,
  Calendar,
  RefreshCw,
  Link as LinkIcon,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

import {
  GalleryItem,
  User,
} from '../types';

import {
  listContent,
} from '../services/contentManagement';

interface GallerySectionProps {
  galleryItems?: GalleryItem[];
  items?: GalleryItem[];

  currentUser?: User | null;
  currentUserRole?: string;

  onAddGalleryItem?: (
    item: Omit<GalleryItem, 'id'>
  ) => void;

  onDeleteGalleryItem?: (
    id: string
  ) => void;

  onAddImageClick?: () => void;
}

export const GallerySection: React.FC<
  GallerySectionProps
> = ({
  galleryItems,
  items,
  currentUser,
  currentUserRole,
  onAddGalleryItem,
  onDeleteGalleryItem,
  onAddImageClick,
}) => {
  /* =====================================================
     ACCESS CONTROL
  ===================================================== */

  const isStaff =
    (
      !!currentUser &&
      (
        currentUser.role === 'admin' ||
        currentUser.role === 'coordinator'
      )
    ) ||
    currentUserRole === 'admin' ||
    currentUserRole === 'coordinator';

  /* =====================================================
     FIREBASE STATE
  ===================================================== */

  const [
    firebaseItems,
    setFirebaseItems,
  ] = useState<GalleryItem[]>([]);

  const [
    loadingGallery,
    setLoadingGallery,
  ] = useState(true);

  const [
    galleryError,
    setGalleryError,
  ] = useState('');

  /* =====================================================
     UI STATE
  ===================================================== */

  const [
    activeAlbum,
    setActiveAlbum,
  ] = useState<string>('All');

  const [
    selectedPreview,
    setSelectedPreview,
  ] = useState<GalleryItem | null>(
    null
  );

  const [
    isUploadOpen,
    setIsUploadOpen,
  ] = useState(false);

  /* =====================================================
     PAYMENT-FREE ADD FORM
     IMAGE URL ONLY
  ===================================================== */

  const [
    newAlbum,
    setNewAlbum,
  ] = useState(
    'Literature Club Events'
  );

  const [
    newTitle,
    setNewTitle,
  ] = useState('');

  const [
    newImageUrl,
    setNewImageUrl,
  ] = useState('');

  /* =====================================================
     LOAD GALLERY FROM FIREBASE
  ===================================================== */

  const loadGallery = async () => {
    setLoadingGallery(true);
    setGalleryError('');

    try {
      const result =
        await listContent(
          'gallery'
        );

      const activeGallery =
        result
          .filter(
            (item: any) =>
              item.active !== false
          )
          .map(
            (item: any) => ({
              id: item.id,
              album:
                item.album || 'Literature Club Events',
              title:
                item.title || 'Literature Club Event',
              imageUrl:
                item.imageUrl || '',
              date:
                item.date || '',
            })
          ) as GalleryItem[];

      setFirebaseItems(
        activeGallery
      );
    } catch (error) {
      console.error(
        'Unable to load gallery from Firebase:',
        error
      );

      setFirebaseItems([]);

      setGalleryError(
        'Unable to load the latest gallery photos.'
      );
    } finally {
      setLoadingGallery(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    void loadGallery();
  }, []);

  /* =====================================================
     DATA SOURCE
     
     Firebase is preferred.
     Existing props remain as fallback.
  ===================================================== */

  const effectiveItems =
    useMemo<GalleryItem[]>(
      () => {
        if (
          firebaseItems.length > 0
        ) {
          return firebaseItems;
        }

        return (
          items ||
          galleryItems ||
          []
        );
      },
      [
        firebaseItems,
        items,
        galleryItems,
      ]
    );

  /* =====================================================
     UNIQUE ALBUMS
  ===================================================== */

  const albums =
    useMemo(() => {
      const uniqueAlbums =
        Array.from(
          new Set(
            effectiveItems
              .map(
                (item) =>
                  item.album
              )
              .filter(Boolean)
          )
        );

      return [
        'All',
        ...uniqueAlbums,
      ];
    }, [effectiveItems]);

  /* =====================================================
     FILTERED ITEMS
  ===================================================== */

  const filtered =
    useMemo(() => {
      if (
        activeAlbum === 'All'
      ) {
        return effectiveItems;
      }

      return effectiveItems.filter(
        (item) =>
          item.album ===
          activeAlbum
      );
    }, [
      effectiveItems,
      activeAlbum,
    ]);

  /* =====================================================
     IMAGE URL VALIDATION
  ===================================================== */

  const isValidImageUrl = (
    value: string
  ) => {
    try {
      const url =
        new URL(
          value.trim()
        );

      return (
        url.protocol ===
          'https:' ||
        url.protocol ===
          'http:'
      );
    } catch {
      return false;
    }
  };

  /* =====================================================
     OPEN ADD FORM
  ===================================================== */

  const openUploadForm = () => {
    if (onAddImageClick) {
      onAddImageClick();
    }

    setIsUploadOpen(true);
  };

  /* =====================================================
     SUBMIT GALLERY PHOTO
  ===================================================== */

  const handleUploadSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const title =
      newTitle.trim();

    const album =
      newAlbum.trim();

    const imageUrl =
      newImageUrl.trim();

    if (!album) {
      alert(
        'Please enter an album name.'
      );
      return;
    }

    if (!title) {
      alert(
        'Please enter an image title.'
      );
      return;
    }

    if (!imageUrl) {
      alert(
        'Please enter an image URL.'
      );
      return;
    }

    if (
      !isValidImageUrl(
        imageUrl
      )
    ) {
      alert(
        'Please enter a valid image URL.'
      );
      return;
    }

    if (onAddGalleryItem) {
      onAddGalleryItem({
        album,
        title,
        imageUrl,
        date:
          new Date().toLocaleDateString(
            'en-US',
            {
              month:
                'short',
              day: 'numeric',
              year: 'numeric',
            }
          ),
      });
    }

    setNewTitle('');
    setNewImageUrl('');
    setIsUploadOpen(false);
  };

  /* =====================================================
     CLOSE UPLOAD FORM
  ===================================================== */

  const closeUploadForm = () => {
    setIsUploadOpen(false);
    setNewTitle('');
    setNewImageUrl('');
  };

  /* =====================================================
     DELETE PHOTO
  ===================================================== */

  const handleDelete = (
    item: GalleryItem
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${item.title}" from the gallery?`
      );

    if (!confirmed) {
      return;
    }

    if (onDeleteGalleryItem) {
      onDeleteGalleryItem(
        item.id
      );
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section
      id="gallery-section"
      className="relative overflow-hidden py-16 md:py-24 bg-[#FBFAF6] text-[#171717] border-t border-[#D4AF37]/20"
    >

      {/* =================================================
          BACKGROUND DECOR
      ================================================= */}

      <style>
        {`
          @keyframes galleryGlowOne {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              opacity: 0.20;
            }

            50% {
              transform: translate3d(20px, 12px, 0) scale(1.08);
              opacity: 0.35;
            }
          }

          @keyframes galleryGlowTwo {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              opacity: 0.15;
            }

            50% {
              transform: translate3d(-15px, -10px, 0) scale(1.1);
              opacity: 0.3;
            }
          }

          @keyframes galleryShimmer {
            0% {
              transform: translateX(-120%);
            }

            100% {
              transform: translateX(120%);
            }
          }

          .gallery-glow-one {
            animation: galleryGlowOne 11s ease-in-out infinite;
          }

          .gallery-glow-two {
            animation: galleryGlowTwo 13s ease-in-out infinite;
          }

          .gallery-shimmer {
            animation: galleryShimmer 6s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .gallery-glow-one,
            .gallery-glow-two,
            .gallery-shimmer {
              animation: none !important;
            }
          }
        `}
      </style>

      <div className="pointer-events-none absolute -top-36 -right-32 w-[400px] h-[400px] rounded-full bg-[#D4AF37]/8 blur-3xl gallery-glow-one" />

      <div className="pointer-events-none absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full bg-[#D4AF37]/6 blur-3xl gallery-glow-two" />

      <div className="pointer-events-none absolute top-32 left-0 w-28 h-28 rounded-full border border-[#D4AF37]/10 -translate-x-1/2" />

      <div className="pointer-events-none absolute bottom-20 right-0 w-36 h-36 rounded-full border border-[#D4AF37]/10 translate-x-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-7 border-b border-[#D4AF37]/20 pb-7">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/15 to-[#F5E7A8]/25 border border-[#D4AF37]/35 shadow-sm">

              <ImageIcon className="w-3.5 h-3.5 text-[#A67C00]" />

              <span className="text-[10px] sm:text-xs font-extrabold tracking-[0.16em] uppercase text-[#92700B]">
                Photo Archives
              </span>

            </div>

            <h2 className="font-serif-title mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-[#171717] leading-[1.02]">

              Event Photo
              <span className="block text-[#936F05]">
                Gallery
              </span>

            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#666666] max-w-2xl leading-7">
              Memories and highlights from
              literary symposiums, book fairs,
              debates, poetry slams, workshops,
              and Literature Club events.
            </p>

          </div>

          {/* =================================================
              ACTION BUTTON
          ================================================= */}

          {isStaff && (
            <button
              type="button"
              onClick={
                openUploadForm
              }
              className="self-start xl:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#A67C00] text-white text-xs font-extrabold shadow-[0_6px_18px_rgba(212,175,55,0.2)] hover:shadow-[0_10px_28px_rgba(212,175,55,0.3)] hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Upload Event Photo
            </button>
          )}

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {galleryError && (
          <div className="mt-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            {galleryError}
          </div>
        )}

        {/* =================================================
            ALBUM FILTERS
        ================================================= */}

        <div className="mt-7 flex flex-wrap items-center gap-2">

          {albums.map(
            (album) => (
              <button
                key={album}
                type="button"
                onClick={() =>
                  setActiveAlbum(
                    album
                  )
                }
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                  activeAlbum ===
                  album
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white shadow-[0_6px_18px_rgba(212,175,55,0.18)] -translate-y-0.5'
                    : 'bg-white text-[#666666] border border-gray-200 hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 hover:text-[#8F6D08]'
                }`}
              >
                {album}
              </button>
            )
          )}

          {/* REFRESH */}

          <button
            type="button"
            onClick={() =>
              void loadGallery()
            }
            disabled={
              loadingGallery
            }
            className="ml-1 w-9 h-9 rounded-xl bg-white border border-gray-200 text-[#777777] hover:text-[#8F6D08] hover:border-[#D4AF37]/40 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            title="Refresh gallery"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loadingGallery
                  ? 'animate-spin'
                  : ''
              }`}
            />
          </button>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loadingGallery &&
          effectiveItems.length ===
            0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center">

              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">

                <RefreshCw className="w-6 h-6 text-[#A67C00] animate-spin" />

              </div>

              <h3 className="font-serif-title text-xl font-bold">
                Loading photo archives...
              </h3>

              <p className="mt-2 text-sm text-[#777777]">
                Fetching the latest Literature Club memories.
              </p>

            </div>
          )}

        {/* =================================================
            GALLERY GRID
        ================================================= */}

        {(!loadingGallery ||
          effectiveItems.length >
            0) && (
          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {filtered.map(
              (item, index) => (
                <article
                  key={
                    item.id
                  }
                  className="group relative overflow-hidden bg-white rounded-[26px] border border-[#D4AF37]/25 shadow-[0_8px_28px_rgba(80,60,20,0.06)] hover:shadow-[0_18px_42px_rgba(80,60,20,0.13)] hover:-translate-y-1 transition-all duration-500"
                  style={{
                    animationDelay: `${index * 60}ms`,
                  }}
                >

                  {/* TOP SHIMMER */}

                  <div className="absolute top-0 left-0 right-0 h-px bg-[#D4AF37]/15 overflow-hidden z-10 pointer-events-none">

                    <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent gallery-shimmer" />

                  </div>

                  {/* IMAGE */}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPreview(
                        item
                      )
                    }
                    className="block w-full text-left cursor-pointer"
                  >

                    <div className="relative h-64 overflow-hidden bg-[#F7F2E5]">

                      {item.imageUrl ? (
                        <img
                          src={
                            item.imageUrl
                          }
                          alt={
                            item.title
                          }
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(
                            e
                          ) => {
                            e.currentTarget.style.display =
                              'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#A67C00]">

                          <ImageIcon className="w-9 h-9 mb-2" />

                          <span className="text-xs font-bold">
                            No Image
                          </span>

                        </div>
                      )}

                      {/* DARK OVERLAY */}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

                      {/* ALBUM */}

                      <div className="absolute top-4 left-4">

                        <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#8B6905] text-[10px] font-extrabold px-3 py-1.5 rounded-xl border border-[#D4AF37]/25 shadow-sm">

                          <ImageIcon className="w-3 h-3" />

                          {
                            item.album ||
                            'Literature Club'
                          }

                        </span>

                      </div>

                      {/* OPEN ICON */}

                      <div className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300">

                        <Maximize2 className="w-4 h-4" />

                      </div>

                      {/* BOTTOM CONTENT */}

                      <div className="absolute left-4 right-4 bottom-4">

                        <h3 className="text-white font-serif-title text-base sm:text-lg font-bold leading-snug line-clamp-2">

                          {
                            item.title ||
                            'Literature Club Event'
                          }

                        </h3>

                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-white/80">

                          <Calendar className="w-3 h-3 text-[#F5E7A8]" />

                          {
                            item.date ||
                            'Date not available'
                          }

                        </div>

                      </div>

                    </div>

                  </button>

                  {/* CARD FOOTER */}

                  <div className="px-4 py-3.5 flex items-center justify-between gap-3">

                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold text-[#999999]">

                      <Sparkles />

                      Literature Club

                    </div>

                    {isStaff &&
                      onDeleteGalleryItem && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              item
                            )
                          }
                          className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}

                  </div>

                </article>
              )
            )}

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loadingGallery &&
          filtered.length ===
            0 && (
            <div className="mt-10 py-20 rounded-[28px] border border-dashed border-[#D4AF37]/30 bg-white/70 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">

                <ImageIcon className="w-7 h-7 text-[#A67C00]" />

              </div>

              <h3 className="mt-5 font-serif-title text-xl font-bold">
                No gallery photos yet
              </h3>

              <p className="mt-2 text-sm text-[#777777] max-w-md mx-auto px-4">
                Add event memories from the
                Management Portal using a public
                image URL.
              </p>

            </div>
          )}

        {/* =================================================
            ADD PHOTO MODAL
        ================================================= */}

        {isUploadOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={
              closeUploadForm
            }
          >

            <div
              className="relative w-full max-w-lg bg-white rounded-[28px] border border-[#D4AF37]/50 shadow-2xl overflow-hidden"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* TOP GOLD LINE */}

              <div className="h-1 bg-gradient-to-r from-[#D4AF37] via-[#F5E7A8] to-[#A67C00]" />

              {/* HEADER */}

              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

                <div>

                  <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#A67C00]">

                    <ImageIcon className="w-3.5 h-3.5" />

                    Photo Archives

                  </div>

                  <h3 className="mt-1 font-serif-title text-xl font-bold">
                    Add Event Gallery Photo
                  </h3>

                </div>

                <button
                  type="button"
                  onClick={
                    closeUploadForm
                  }
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#171717] transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleUploadSubmit
                }
                className="p-6 space-y-5"
              >

                {/* ALBUM */}

                <div>

                  <label className="block text-xs font-bold mb-1.5">
                    Album Category *
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      newAlbum
                    }
                    onChange={(e) =>
                      setNewAlbum(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Debate Championship 2026"
                    className="w-full px-3.5 py-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#D4AF37]"
                  />

                </div>

                {/* TITLE */}

                <div>

                  <label className="block text-xs font-bold mb-1.5">
                    Image Title *
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      newTitle
                    }
                    onChange={(e) =>
                      setNewTitle(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Award distribution ceremony"
                    className="w-full px-3.5 py-3 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#D4AF37]"
                  />

                </div>

                {/* IMAGE URL */}

                <div className="p-4 rounded-2xl bg-[#FBF8EF] border border-[#D4AF37]/25">

                  <div className="flex items-center gap-2 mb-2">

                    <LinkIcon className="w-4 h-4 text-[#A67C00]" />

                    <label className="text-xs font-bold">
                      Public Image URL *
                    </label>

                  </div>

                  <p className="text-[10px] text-[#777777] leading-5 mb-3">
                    Paste the direct image URL.
                    Firebase Storage and billing
                    are not required.
                  </p>

                  <input
                    type="url"
                    required
                    value={
                      newImageUrl
                    }
                    onChange={(e) =>
                      setNewImageUrl(
                        e.target.value
                      )
                    }
                    placeholder="https://i.ibb.co/example/photo.jpg"
                    className="w-full px-3.5 py-3 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-[#D4AF37]"
                  />

                </div>

                {/* PREVIEW */}

                {newImageUrl && (
                  <div>

                    <p className="text-[10px] font-bold text-[#777777] mb-2">
                      Preview
                    </p>

                    <img
                      src={
                        newImageUrl
                      }
                      alt="Gallery preview"
                      className="w-full h-48 object-cover rounded-2xl border border-[#D4AF37]/30"
                    />

                  </div>
                )}

                {/* BUTTONS */}

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-gray-100">

                  <button
                    type="button"
                    onClick={
                      closeUploadForm
                    }
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-[#666666] hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#A67C00] text-white text-xs font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    Publish Photo
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* =================================================
            IMAGE LIGHTBOX
        ================================================= */}

        {selectedPreview && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() =>
              setSelectedPreview(null)
            }
          >

            <div
              className="relative w-full max-w-5xl bg-white rounded-[28px] overflow-hidden border border-[#D4AF37]/40 shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* CLOSE */}

              <button
                type="button"
                onClick={() =>
                  setSelectedPreview(
                    null
                  )
                }
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* IMAGE */}

              <div className="max-h-[72vh] overflow-hidden bg-black flex items-center justify-center">

                <img
                  src={
                    selectedPreview.imageUrl
                  }
                  alt={
                    selectedPreview.title
                  }
                  className="max-h-[72vh] max-w-full w-auto object-contain"
                />

              </div>

              {/* DETAILS */}

              <div className="p-5 sm:p-6">

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#8B6905] bg-[#FBF8EF] border border-[#D4AF37]/20 px-2.5 py-1 rounded-lg">

                        <ImageIcon className="w-3 h-3" />

                        {
                          selectedPreview.album ||
                          'Literature Club'
                        }

                      </span>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#777777]">

                        <Calendar className="w-3 h-3 text-[#D4AF37]" />

                        {
                          selectedPreview.date ||
                          'Date not available'
                        }

                      </span>

                    </div>

                    <h3 className="mt-3 font-serif-title text-xl sm:text-2xl font-bold text-[#171717]">
                      {
                        selectedPreview.title
                      }
                    </h3>

                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold text-[#A0A0A0]">
                    VSBEC
                    <ArrowUpRight className="w-3 h-3 text-[#D4AF37]" />
                  </span>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
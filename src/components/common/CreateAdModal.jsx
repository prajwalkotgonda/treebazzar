import React, { useEffect, useState, useRef } from 'react';
import { 
  X, Megaphone, Building2, Phone, Image as ImageIcon, 
  FileText, Upload, Sparkles, Tag, Check, AlertCircle, Eye, Loader2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { compressAdPhoto, MAX_AD_PHOTO_FILE_SIZE } from '../../utils/adPhoto';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export default function CreateAdModal({ 
  isOpen, 
  onClose, 
  onCreateAd, 
  nurseries = [] 
}) {
  const { lang } = useLanguage();
  const fileInputRef = useRef(null);
  const adIdRef = useRef(null);

  const [formData, setFormData] = useState({
    branchName: '',
    mobile: '',
    photo: '',
    title: '',
    description: '',
    badge: 'Special Offer',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [filePreview, setFilePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' | 'url'

  useEffect(() => {
    if (!selectedFile) {
      setFilePreview('');
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  if (!isOpen) return null;

  const photoPreview = selectedFile ? filePreview : formData.photo;

  // Sample presets for quick testing
  const sampleImages = [
    {
      name: lang === 'mr' ? 'फळझाडे' : 'Fruit Plants',
      url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: lang === 'mr' ? 'रोपवाटिका' : 'Nursery Garden',
      url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: lang === 'mr' ? 'फुले व इनडोअर' : 'Flowers & Indoor',
      url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const handleBranchSelect = (e) => {
    const val = e.target.value;
    if (!val) return;
    const selectedNursery = nurseries.find(n => n.id === val || n.name === val);
    if (selectedNursery) {
      setFormData(prev => ({
        ...prev,
        branchName: selectedNursery.name || selectedNursery.nurseryName,
        mobile: selectedNursery.phone || selectedNursery.contactNumber || prev.mobile
      }));
      if (errors.branchName) setErrors(prev => ({ ...prev, branchName: '' }));
      if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, photo: '' }));

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ 
        ...prev, 
        photo: lang === 'mr' ? 'कृपया वैध प्रतिमा (Image) निवडा' : 'Please select a valid image file' 
      }));
      return;
    }

    if (file.size > MAX_AD_PHOTO_FILE_SIZE) {
      setErrors(prev => ({ 
        ...prev, 
        photo: lang === 'mr' ? 'प्रतिमेचा आकार १० MB पर्यंत असावा' : 'Image size must be 10 MB or less'
      }));
      return;
    }

    setSelectedFile(file);
    setErrors(prev => ({ ...prev, photo: '' }));
  };

  const handleUrlChange = (val) => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, photo: val }));
    if (errors.photo) setErrors(prev => ({ ...prev, photo: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.branchName.trim()) {
      newErrors.branchName = lang === 'mr' ? 'शाखेचे नाव टाकणे आवश्यक आहे' : 'Branch name is required';
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!formData.mobile.trim()) {
      newErrors.mobile = lang === 'mr' ? 'मोबाईल नंबर टाकणे आवश्यक आहे' : 'Mobile number is required';
    } else if (cleanMobile.length < 10) {
      newErrors.mobile = lang === 'mr' ? 'कृपया वैध १० अंकी मोबाईल नंबर टाका' : 'Enter a valid 10-digit mobile number';
    }

    const photoUrl = formData.photo.trim();
    if (!selectedFile && !photoUrl) {
      newErrors.photo = errors.photo || (lang === 'mr' ? 'जाहिरातीचा फोटो निवडणे आवश्यक आहे' : 'Ad photo is required');
    } else if (!selectedFile && !/^https?:\/\//i.test(photoUrl)) {
      newErrors.photo = lang === 'mr' ? 'फोटोची वैध वेब लिंक टाका' : 'Enter a valid image URL';
    }

    if (!formData.description.trim()) {
      newErrors.description = lang === 'mr' ? 'माहिती व तपशील टाकणे आवश्यक आहे' : 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);

    try {
      let photoData;
      if (selectedFile) {
        setUploadStatusText(lang === 'mr' ? 'फोटो कॉम्प्रेस होत आहे...' : 'Compressing photo...');
        try {
          photoData = await compressAdPhoto(selectedFile);
        } catch {
          setErrors(prev => ({
            ...prev,
            photo: lang === 'mr' ? 'फोटो उघडता आला नाही. दुसरा फोटो निवडा.' : 'Could not process the photo. Choose another image.'
          }));
          return;
        }
      }

      setUploadStatusText(lang === 'mr' ? 'जाहिरात डेटाबेसमध्ये सेव्ह होत आहे...' : 'Saving advertisement to database...');

      adIdRef.current ??= `ad-${crypto.randomUUID()}`;
      const newAd = {
        id: adIdRef.current,
        branchName: formData.branchName.trim(),
        mobile: formData.mobile.trim(),
        photo: formData.photo.trim(),
        title: formData.title.trim() || (lang === 'mr' ? 'विशेष जाहिरात' : 'Special Advertisement'),
        description: formData.description.trim(),
        badge: formData.badge.trim(),
        status: formData.status || 'active',
        createdAt: new Date().toISOString()
      };

      if (onCreateAd) {
        await onCreateAd(newAd, photoData);
      }

      onClose();
    } catch (err) {
      console.error('Error submitting ad:', err);
      setErrors(prev => ({
        ...prev,
        submit: lang === 'mr' ? 'जाहिरात सेव्ह करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' : 'Failed to save ad. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
      setUploadStatusText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-6 flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-[#1E5631] via-[#246b3c] to-[#2E7D32] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white ring-1 ring-white/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {lang === 'mr' ? 'नवीन जाहिरात तयार करा' : 'Create New Advertisement'}
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                {lang === 'mr' ? 'शाखेचे नाव, मोबाईल क्र., फोटो आणि माहिती भरा' : 'Fill branch name, mobile no, photo and description'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto text-slate-800">
          
          {/* Quick Branch Autofill Helper */}
          {nurseries.length > 0 && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1E5631]">
                <Sparkles className="w-4 h-4 shrink-0 text-[#2E7D32]" />
                <span>{lang === 'mr' ? 'नोंदणीकृत रोपवाटिकेतून थेट माहिती भरा:' : 'Auto-fill from registered nursery:'}</span>
              </div>
              <select
                onChange={handleBranchSelect}
                defaultValue=""
                className="text-xs font-semibold py-1.5 px-3 rounded-lg bg-white border border-emerald-300 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32]"
              >
                <option value="">{lang === 'mr' ? '-- रोपवाटिका निवडा --' : '-- Select Nursery --'}</option>
                {nurseries.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name || n.nurseryName} ({n.city || 'N/A'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 1. Branch Name (शाखेचे नाव) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#1E5631]" />
              <span>{lang === 'mr' ? 'शाखेचे नाव (Branch Name)' : 'Branch Name'} *</span>
            </label>
            <input 
              type="text"
              value={formData.branchName}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, branchName: e.target.value }));
                if (errors.branchName) setErrors(prev => ({ ...prev, branchName: '' }));
              }}
              placeholder={lang === 'mr' ? 'उदा. हरित संजीवनी रोपवाटिका (पुणे शाखा)' : 'e.g. Green Valley Nursery (Pune Branch)'}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32]/20 ${
                errors.branchName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#2E7D32]'
              }`}
            />
            {errors.branchName && (
              <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.branchName}</span>
              </p>
            )}
          </div>

          {/* 2. Mobile Number (मोबाईल क्र.) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#1E5631]" />
              <span>{lang === 'mr' ? 'मोबाईल नंबर (Mobile No.)' : 'Mobile Number'} *</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                +91
              </span>
              <input 
                type="tel"
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData(prev => ({ ...prev, mobile: val }));
                  if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
                }}
                placeholder="98XXXXXXXX"
                className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32]/20 ${
                  errors.mobile ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#2E7D32]'
                }`}
              />
            </div>
            {errors.mobile && (
              <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.mobile}</span>
              </p>
            )}
          </div>

          {/* 3. Photo (फोटो / प्रतिमा) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#1E5631]" />
                <span>{lang === 'mr' ? 'जाहिरातीचा फोटो (Photo)' : 'Ad Photo'} *</span>
              </label>
              <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setUploadMode('upload')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    uploadMode === 'upload' ? 'bg-[#1E5631] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'mr' ? 'अपलोड करा' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    uploadMode === 'url' ? 'bg-[#1E5631] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang === 'mr' ? 'वेब लिंक (URL)' : 'URL'}
                </button>
              </div>
            </div>

            {uploadMode === 'upload' ? (
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-emerald-300 hover:border-[#2E7D32] bg-emerald-50/40 hover:bg-emerald-50 text-slate-600 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group"
                >
                  <Upload className="w-5 h-5 text-[#2E7D32] group-hover:-translate-y-0.5 transition-transform" />
                  <span className="text-xs font-bold text-slate-700">
                    {lang === 'mr' ? 'डिव्हाइसमधून फोटो निवडा' : 'Choose photo from device'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {lang === 'mr' ? 'JPG, PNG, WebP (१० MB पर्यंत)' : 'JPG, PNG, WebP (up to 10 MB)'}
                  </span>
                </button>
              </div>
            ) : (
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/ad-image.jpg"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:border-[#2E7D32]"
              />
            )}

            {/* Preset Samples */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {lang === 'mr' ? 'नमुना फोटो:' : 'Presets:'}
              </span>
              {sampleImages.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUrlChange(s.url)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-[#1E5631] hover:border-emerald-300 transition-colors cursor-pointer"
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Photo Preview */}
            {photoPreview && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 group">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleUrlChange('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/70 text-white text-[10px] font-bold flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{lang === 'mr' ? 'पूर्वावलोकन' : 'Preview'}</span>
                </div>
              </div>
            )}

            {errors.photo && (
              <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.photo}</span>
              </p>
            )}
          </div>

          {/* Optional Title & Offer Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#1E5631]" />
                <span>{lang === 'mr' ? 'जाहिरातीचे शीर्षक (पर्यायी)' : 'Ad Title (Optional)'}</span>
              </label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={lang === 'mr' ? 'उदा. मान्सून स्पेशल सवलत' : 'e.g. Monsoon Special Discount'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#2E7D32]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1E5631]" />
                <span>{lang === 'mr' ? 'ऑफर बॅज' : 'Offer Badge'}</span>
              </label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:border-[#2E7D32]"
              >
                <option value="Special Offer">{lang === 'mr' ? 'विशेष ऑफर (Special Offer)' : 'Special Offer'}</option>
                <option value="New Arrival">{lang === 'mr' ? 'नवीन रोपे (New Arrival)' : 'New Arrival'}</option>
                <option value="Best Price">{lang === 'mr' ? 'उत्तम दर (Best Price)' : 'Best Price'}</option>
                <option value="Monsoon Sale">{lang === 'mr' ? 'मान्सून सेल (Monsoon Sale)' : 'Monsoon Sale'}</option>
                <option value="Direct Farm Stock">{lang === 'mr' ? 'थेट शेती स्टॉक (Direct Farm)' : 'Direct Farm Stock'}</option>
              </select>
            </div>
          </div>

          {/* 4. Description / Information (माहिती व तपशील) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#1E5631]" />
              <span>{lang === 'mr' ? 'माहिती व तपशील (Description)' : 'Information & Description'} *</span>
            </label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
              placeholder={lang === 'mr' 
                ? 'उदा. आमच्या शाखेत उच्च दर्जाची केशर आंबा, कागदी लिंबू, पेरू व चिकू रोपे उपलब्ध आहेत. ५० पेक्षा जास्त रोपांच्या खरेदीवर विशेष सूट.' 
                : 'e.g. Premium grafted mango, lemon, guava plants available. Free delivery on bulk farm orders.'}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-[#2E7D32]/20 ${
                errors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#2E7D32]'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Status selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">
                {lang === 'mr' ? 'जाहिरात लगेच सक्रिय करा' : 'Publish Ad Immediately'}
              </p>
              <p className="text-[11px] text-slate-400">
                {lang === 'mr' ? 'डॅशबोर्ड आणि वेबसाइटवर दिसेल' : 'Visible on dashboard and website'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.status === 'active'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'paused' }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E7D32]"></div>
            </label>
          </div>

          {errors.submit && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#1E5631] hover:bg-[#2E7D32] disabled:opacity-75 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/20 hover:shadow-lg transition-all cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{uploadStatusText || (lang === 'mr' ? 'अपलोड होत आहे...' : 'Uploading...')}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{lang === 'mr' ? 'जाहिरात तयार करा' : 'Create Advertisement'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

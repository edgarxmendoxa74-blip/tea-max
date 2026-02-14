import React, { useState } from 'react';
import { Save, Upload, X, Edit, Plus, Trash2 } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useImageUpload } from '../hooks/useImageUpload';

const SiteSettingsManager: React.FC = () => {
  const { siteSettings, loading, updateSiteSettings } = useSiteSettings();
  const { uploadImage, uploading } = useImageUpload();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    currency: '',
    currency_code: '',
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    store_hours: '',
    contact_number: '',
    address: '',
    facebook_url: '',
    facebook_handle: '',
    site_tagline: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [heroSlides, setHeroSlides] = useState<Array<{
    url: string;
    title: string;
    subtitle: string;
    description: string;
  }>>([]);
  const [slideFiles, setSlideFiles] = useState<Map<number, File>>(new Map());

  React.useEffect(() => {
    if (siteSettings) {
      setFormData({
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        currency: siteSettings.currency,
        currency_code: siteSettings.currency_code,
        hero_title: siteSettings.hero_title,
        hero_subtitle: siteSettings.hero_subtitle,
        hero_description: siteSettings.hero_description,
        store_hours: siteSettings.store_hours,
        contact_number: siteSettings.contact_number,
        address: siteSettings.address,
        facebook_url: siteSettings.facebook_url,
        facebook_handle: siteSettings.facebook_handle,
        site_tagline: siteSettings.site_tagline
      });
      setLogoPreview(siteSettings.site_logo);
      setLogoPreview(siteSettings.site_logo);
      if (siteSettings.hero_slides && siteSettings.hero_slides.length > 0) {
        setHeroSlides(siteSettings.hero_slides);
      } else {
        // Initialize with single hero settings if no slides exist
        setHeroSlides([{
          url: siteSettings.hero_image,
          title: siteSettings.hero_title,
          subtitle: siteSettings.hero_subtitle,
          description: siteSettings.hero_description
        }]);
      }
    }
  }, [siteSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSlide = () => {
    setHeroSlides(prev => [
      ...prev,
      {
        url: 'https://images.unsplash.com/photo-1544787210-22dbdc1763f6?q=80&w=2070&auto=format&fit=crop',
        title: 'New Slide',
        subtitle: 'Subtitle',
        description: 'Description'
      }
    ]);
  };

  const handleRemoveSlide = (index: number) => {
    setHeroSlides(prev => prev.filter((_, i) => i !== index));
    const newFiles = new Map(slideFiles);
    newFiles.delete(index);
    setSlideFiles(newFiles);
  };

  const handleSlideChange = (index: number, field: string, value: string) => {
    setHeroSlides(prev => prev.map((slide, i) =>
      i === index ? { ...slide, [field]: value } : slide
    ));
  };

  const handleSlideImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setHeroSlides(prev => prev.map((slide, i) =>
          i === index ? { ...slide, url: e.target?.result as string } : slide
        ));
      };
      reader.readAsDataURL(file);

      const newFiles = new Map(slideFiles);
      newFiles.set(index, file);
      setSlideFiles(newFiles);
    }
  };

  const handleSave = async () => {
    try {
      let logoUrl = logoPreview;
      // Upload slide images if any
      const updatedSlides = await Promise.all(heroSlides.map(async (slide, index) => {
        const file = slideFiles.get(index);
        if (file) {
          const uploadedUrl = await uploadImage(file, `hero-slide-${index}-${Date.now()}`);
          return { ...slide, url: uploadedUrl };
        }
        return slide;
      }));

      // Update all settings
      await updateSiteSettings({
        site_name: formData.site_name,
        site_description: formData.site_description,
        currency: formData.currency,
        currency_code: formData.currency_code,
        site_logo: logoUrl,
        hero_slides: updatedSlides,
        store_hours: formData.store_hours,
        contact_number: formData.contact_number,
        address: formData.address,
        facebook_url: formData.facebook_url,
        facebook_handle: formData.facebook_handle,
        site_tagline: formData.site_tagline
      });

      setIsEditing(false);
      setLogoFile(null);
      setHeroFile(null);
    } catch (error) {
      console.error('Error saving site settings:', error);
    }
  };

  const handleCancel = () => {
    if (siteSettings) {
      setFormData({
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        currency: siteSettings.currency,
        currency_code: siteSettings.currency_code,
        hero_title: siteSettings.hero_title,
        hero_subtitle: siteSettings.hero_subtitle,
        hero_description: siteSettings.hero_description,
        store_hours: siteSettings.store_hours,
        contact_number: siteSettings.contact_number,
        address: siteSettings.address,
        facebook_url: siteSettings.facebook_url,
        facebook_handle: siteSettings.facebook_handle,
        site_tagline: siteSettings.site_tagline
      });
      setLogoPreview(siteSettings.site_logo);
      setLogoPreview(siteSettings.site_logo);
      if (siteSettings.hero_slides && siteSettings.hero_slides.length > 0) {
        setHeroSlides(siteSettings.hero_slides);
      }
    }
    setIsEditing(false);
    setLogoFile(null);
    setHeroFile(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-semibold text-teamax-dark">Site Settings</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-white text-black border-2 border-black px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2 shadow-md"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Settings</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-black px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className="bg-white text-black border-2 border-black px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 shadow-md"
            >
              <Save className="h-4 w-4" />
              <span>{uploading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Site Logo */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Site Logo
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Site Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-2xl text-gray-400">☕</div>
              )}
            </div>
            {isEditing && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="bg-white text-black border-2 border-black px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2 cursor-pointer border border-black shadow-sm"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Logo</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Site Name & Tagline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Site Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="site_name"
                value={formData.site_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter site name"
              />
            ) : (
              <p className="text-lg font-medium text-black">{siteSettings?.site_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Site Tagline
            </label>
            {isEditing ? (
              <input
                type="text"
                name="site_tagline"
                value={formData.site_tagline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="e.g., Milk Tea Hub"
              />
            ) : (
              <p className="text-lg font-medium text-black">{siteSettings?.site_tagline}</p>
            )}
          </div>
        </div>

        {/* Site Description (About) */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            About Section / Description
          </label>
          {isEditing ? (
            <textarea
              name="site_description"
              value={formData.site_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Enter about section text"
            />
          ) : (
            <p className="text-black">{siteSettings?.site_description}</p>
          )}
        </div>

        {/* Hero Slides Management */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-black">Hero Slides</h3>
            {isEditing && (
              <button
                onClick={handleAddSlide}
                className="flex items-center gap-2 text-sm bg-white text-black border-2 border-black px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Slide
              </button>
            )}
          </div>

          <div className="space-y-6">
            {heroSlides.map((slide, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                {isEditing && heroSlides.length > 1 && (
                  <button
                    onClick={() => handleRemoveSlide(index)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Image Preview & Upload */}
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Slide Image</label>
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-200 border border-gray-300 relative group">
                      <img
                        src={slide.url}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
                            <Upload className="w-4 h-4 text-black" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleSlideImageChange(index, e)}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slide Content */}
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={slide.title}
                            onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                          />
                        ) : (
                          <p className="text-sm font-medium text-black">{slide.title}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={slide.subtitle}
                            onChange={(e) => handleSlideChange(index, 'subtitle', e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                          />
                        ) : (
                          <p className="text-sm font-medium text-black">{slide.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                      {isEditing ? (
                        <textarea
                          value={slide.description}
                          onChange={(e) => handleSlideChange(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                        />
                      ) : (
                        <p className="text-sm text-gray-600">{slide.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Hours & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Store Hours
            </label>
            {isEditing ? (
              <input
                type="text"
                name="store_hours"
                value={formData.store_hours}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="e.g., 06:00 AM - 10:00 PM"
              />
            ) : (
              <p className="text-lg font-medium text-black">{siteSettings?.store_hours}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Contact Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="e.g., 0945 210 6254"
              />
            ) : (
              <p className="text-lg font-medium text-black">{siteSettings?.contact_number}</p>
            )}
          </div>
        </div>

        {/* Physical Address */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Physical Address
          </label>
          {isEditing ? (
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Enter full address"
            />
          ) : (
            <p className="text-black">{siteSettings?.address}</p>
          )}
        </div>

        {/* Facebook Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Facebook Page URL
            </label>
            {isEditing ? (
              <input
                type="text"
                name="facebook_url"
                value={formData.facebook_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="https://facebook.com/yourpage"
              />
            ) : (
              <p className="text-black text-sm">{siteSettings?.facebook_url}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Facebook Handle
            </label>
            {isEditing ? (
              <input
                type="text"
                name="facebook_handle"
                value={formData.facebook_handle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="@yourhandle"
              />
            ) : (
              <p className="text-black">{siteSettings?.facebook_handle}</p>
            )}
          </div>
        </div>

        {/* Currency Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Currency Symbol
            </label>
            {isEditing ? (
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="e.g., ₱, $, €"
              />
            ) : (
              <p className="text-lg font-medium text-black">{siteSettings?.currency}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Currency Code
            </label>
            {isEditing ? (
              <input
                type="text"
                name="currency_code"
                value={formData.currency_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="e.g., PHP, USD, EUR"
              />
            ) : (
              <p className="text-lg font-medium text-black">{siteSettings?.currency_code}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsManager;

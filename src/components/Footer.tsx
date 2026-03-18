import React, { memo } from 'react';
import { Clock, MapPin, Phone, Facebook } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import EnvStatus from './EnvStatus';

const Footer: React.FC = () => {
  const { siteSettings } = useSiteSettings();

  return (
    <footer className="bg-teamax-warm border-t border-teamax-border text-teamax-primary py-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-serif font-bold text-teamax-primary mb-6">{siteSettings?.site_name || 'Tea Max Milk Tea Hub'}</h3>
            <p className="text-teamax-secondary leading-relaxed mb-6 max-w-xs text-sm">
              {siteSettings?.site_description || 'Crafting the perfect blend of tradition and flavor. From refreshing milk teas to aromatic coffees, we bring you the ultimate beverage experience.'}
            </p>
          </div>

          {/* Operating Hours */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operating Hours
            </h4>
            <div className="space-y-3 text-teamax-primary text-sm">
              <div className="flex justify-between items-center py-2 border-b border-teamax-border">
                <span className="font-medium">Store Hours</span>
                <span>{siteSettings?.store_hours || '06:00 AM - 10:00 PM'}</span>
              </div>
              <div className="flex items-center gap-2 mt-4 text-green-600">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="font-bold text-xs uppercase tracking-wider">Open Daily</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold text-teamax-primary uppercase tracking-widest mb-6">Contact Us</h4>
            <div className="space-y-4 text-teamax-secondary text-sm">
              <div className="flex items-start gap-4">
                <MapPin className="h-4 w-4 text-teamax-accent flex-shrink-0 mt-0.5" />
                <span>{siteSettings?.address || 'Purok 3 Barangay Trenchera, Tayug Pangasinan'}</span>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-4 w-4 text-teamax-accent flex-shrink-0 mt-0.5" />
                <a href={`tel:${siteSettings?.contact_number?.replace(/\s/g, '') || '09452106254'}`} className="hover:text-teamax-accent transition-colors font-medium">
                  {siteSettings?.contact_number || '0945 210 6254'}
                </a>
              </div>
              <div className="flex items-start gap-4">
                <Facebook className="h-4 w-4 text-teamax-accent flex-shrink-0 mt-0.5" />
                <a
                  href={siteSettings?.facebook_url || "https://www.facebook.com/teamaxmilkteahub"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teamax-accent transition-colors font-medium"
                >
                  {siteSettings?.facebook_handle || '@teamaxmilkteahub'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-teamax-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-teamax-secondary/60 text-xs font-medium uppercase tracking-widest">
            © {new Date().getFullYear()} {siteSettings?.site_name || 'Tea Max Milk Tea Hub'}
          </p>
          <div className="w-full md:w-auto">
            <EnvStatus />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);


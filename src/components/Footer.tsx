import React, { memo } from 'react';
import { Clock, MapPin, Phone, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-natalna-dark text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-natalna-gold mb-4">Natalna's Restaurant</h3>
            <p className="text-natalna-cream/80 leading-relaxed mb-4">
              Where authentic homemade cuisine meets warm hospitality. Experience delicious meals prepared with love and the finest ingredients.
            </p>
          </div>

          {/* Operating Hours */}
          <div>
            <h4 className="text-lg font-serif font-semibold text-natalna-gold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operating Hours
            </h4>
            <div className="space-y-2 text-natalna-cream/80">
              <div className="flex justify-between items-center py-1 border-b border-natalna-cream/10">
                <span className="font-medium">Breakfast</span>
                <span>6:00 AM - 10:00 AM</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-natalna-cream/10">
                <span className="font-medium">Lunch</span>
                <span>11:00 AM - 2:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-natalna-cream/10">
                <span className="font-medium">Dinner</span>
                <span>5:00 PM - 10:00 PM</span>
              </div>
              <div className="flex items-center gap-2 mt-3 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Open Daily</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-serif font-semibold text-natalna-gold mb-4">Contact Us</h4>
            <div className="space-y-3 text-natalna-cream/80">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-natalna-gold flex-shrink-0 mt-0.5" />
                <span>Purok 3 Barangay Trenchera, Tayug Pangasinan</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-natalna-gold flex-shrink-0 mt-0.5" />
                <a href="tel:09452106254" className="hover:text-natalna-gold transition-colors">
                  0945 210 6254
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Facebook className="h-5 w-5 text-natalna-gold flex-shrink-0 mt-0.5" />
                <a 
                  href="https://www.facebook.com/Natalnaph" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-natalna-gold transition-colors"
                >
                  @Natalnaph
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-natalna-cream/10 mt-8 pt-6 text-center">
          <p className="text-natalna-cream/60 text-sm">
            © {new Date().getFullYear()} Natalna's Restaurant. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);


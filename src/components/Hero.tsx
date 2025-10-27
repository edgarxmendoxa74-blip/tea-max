import React, { memo, useState } from 'react';
import { X, Calendar, Clock, Users, User, Phone, MessageSquare } from 'lucide-react';

const Hero: React.FC = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    contact: '',
    date: '',
    time: '',
    partySize: 2,
    specialRequests: ''
  });

  const handleBookNow = () => {
    setShowBookingForm(true);
  };

  const handleSubmitBooking = () => {
    // Validate required fields
    if (!bookingDetails.name.trim() || !bookingDetails.contact.trim() || 
        !bookingDetails.date || !bookingDetails.time) {
      alert('Please fill in all required fields (Name, Contact, Date, and Time)');
      return;
    }

    // Format time to 12-hour format
    const formatTime = (timeString: string) => {
      const [hour, minute] = timeString.split(':');
      const hourNum = parseInt(hour);
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      return `${hour12}:${minute} ${period}`;
    };

    // Format date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    // Create receipt-style message
    const bookingReceipt = `
🏪 NATALNA'S RESTAURANT
━━━━━━━━━━━━━━━━━━━━━━
📋 RESERVATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━

👤 Guest Name: ${bookingDetails.name}
📞 Contact: ${bookingDetails.contact}
📅 Date: ${formatDate(bookingDetails.date)}
🕐 Time: ${formatTime(bookingDetails.time)}
👥 Party Size: ${bookingDetails.partySize} ${bookingDetails.partySize === 1 ? 'person' : 'people'}

${bookingDetails.specialRequests ? `📝 Special Requests:\n${bookingDetails.specialRequests}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━

Please confirm this reservation. Thank you for choosing Natalna's Restaurant! 🍽️

Operating Hours: 6:00 AM - 10:00 PM Daily
    `.trim();

    const encodedMessage = encodeURIComponent(bookingReceipt);
    const messengerUrl = `https://m.me/Natalnaph?text=${encodedMessage}`;
    
    window.open(messengerUrl, '_blank');
    
    // Close modal and reset form
    setShowBookingForm(false);
    setBookingDetails({
      name: '',
      contact: '',
      date: '',
      time: '',
      partySize: 2,
      specialRequests: ''
    });
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <>
    <section 
      className="relative py-24 px-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(27, 67, 50, 0.75), rgba(45, 122, 79, 0.65)), url('/hero-background.jpg')`
      }}
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 animate-fade-in drop-shadow-2xl">
          Authentic Homemade Cuisine
          <span className="block text-natalna-gold mt-3 text-4xl md:text-5xl">at Natalna's Restaurant</span>
        </h1>
        <p className="text-xl text-white/95 mb-6 max-w-2xl mx-auto animate-slide-up font-sans leading-relaxed drop-shadow-lg">
          Experience the warmth of home-cooked meals prepared with love and the finest ingredients. 
          Delicious flavors and unforgettable dining experiences await you.
        </p>
        
        {/* Operating Hours Badge */}
        <div className="inline-flex items-center justify-center gap-3 bg-white/95 backdrop-blur-sm border-2 border-white rounded-full px-6 py-3 mb-8 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-natalna-dark">Open Daily</span>
          </div>
          <div className="w-px h-6 bg-natalna-beige"></div>
          <div className="flex items-center gap-2 text-natalna-primary font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">6:00 AM - 10:00 PM</span>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="#menu"
            className="bg-white text-natalna-primary px-8 py-3 rounded-lg hover:bg-natalna-gold hover:text-natalna-dark transition-all duration-300 transform hover:scale-105 font-medium shadow-2xl border-2 border-white"
          >
            View Menu
          </a>
          <button 
            onClick={handleBookNow}
            className="bg-natalna-primary text-white border-2 border-white px-8 py-3 rounded-lg hover:bg-natalna-wood transition-all duration-300 transform hover:scale-105 font-medium shadow-2xl"
          >
            Book Now
          </button>
        </div>
      </div>
    </section>

    {/* Booking Form Modal */}
    {showBookingForm && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBookingForm(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-gradient-to-r from-natalna-primary to-natalna-wood p-6 border-b border-natalna-beige flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-white">Make a Reservation</h2>
            <button
              onClick={() => setShowBookingForm(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Guest Name */}
            <div>
              <label className="block text-sm font-medium text-natalna-dark mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Guest Name *
              </label>
              <input
                type="text"
                value={bookingDetails.name}
                onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                className="w-full px-4 py-3 border border-natalna-beige rounded-lg focus:ring-2 focus:ring-natalna-primary focus:border-transparent transition-all duration-200"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-natalna-dark mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Number *
              </label>
              <input
                type="tel"
                value={bookingDetails.contact}
                onChange={(e) => setBookingDetails({ ...bookingDetails, contact: e.target.value })}
                className="w-full px-4 py-3 border border-natalna-beige rounded-lg focus:ring-2 focus:ring-natalna-primary focus:border-transparent transition-all duration-200"
                placeholder="09XX XXX XXXX"
                required
              />
            </div>

            {/* Date and Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-natalna-dark mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Reservation Date *
                </label>
                <input
                  type="date"
                  value={bookingDetails.date}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                  min={getTodayDate()}
                  className="w-full px-4 py-3 border border-natalna-beige rounded-lg focus:ring-2 focus:ring-natalna-primary focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-natalna-dark mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Reservation Time *
                </label>
                <input
                  type="time"
                  value={bookingDetails.time}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, time: e.target.value })}
                  min="06:00"
                  max="22:00"
                  className="w-full px-4 py-3 border border-natalna-beige rounded-lg focus:ring-2 focus:ring-natalna-primary focus:border-transparent transition-all duration-200"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Operating hours: 6:00 AM - 10:00 PM</p>
              </div>
            </div>

            {/* Party Size */}
            <div>
              <label className="block text-sm font-medium text-natalna-dark mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Guests
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setBookingDetails({ ...bookingDetails, partySize: Math.max(1, bookingDetails.partySize - 1) })}
                  className="w-10 h-10 bg-natalna-beige text-natalna-dark rounded-lg hover:bg-natalna-secondary transition-colors duration-200 font-bold"
                >
                  −
                </button>
                <input
                  type="number"
                  value={bookingDetails.partySize}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, partySize: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-20 px-4 py-3 border border-natalna-beige rounded-lg text-center focus:ring-2 focus:ring-natalna-primary focus:border-transparent transition-all duration-200"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => setBookingDetails({ ...bookingDetails, partySize: bookingDetails.partySize + 1 })}
                  className="w-10 h-10 bg-natalna-beige text-natalna-dark rounded-lg hover:bg-natalna-secondary transition-colors duration-200 font-bold"
                >
                  +
                </button>
                <span className="text-natalna-dark font-medium">{bookingDetails.partySize === 1 ? 'person' : 'people'}</span>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-medium text-natalna-dark mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Special Requests (Optional)
              </label>
              <textarea
                value={bookingDetails.specialRequests}
                onChange={(e) => setBookingDetails({ ...bookingDetails, specialRequests: e.target.value })}
                className="w-full px-4 py-3 border border-natalna-beige rounded-lg focus:ring-2 focus:ring-natalna-primary focus:border-transparent transition-all duration-200"
                placeholder="Any dietary restrictions, seating preferences, or special occasions..."
                rows={3}
              />
            </div>

            {/* Info Box */}
            <div className="bg-natalna-cream border-2 border-natalna-gold rounded-lg p-4">
              <p className="text-sm text-natalna-dark">
                📱 After submitting, you'll be redirected to Messenger to send your reservation request. We'll confirm your booking shortly!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingForm(false)}
                className="flex-1 py-3 border-2 border-natalna-beige text-natalna-dark rounded-lg hover:bg-natalna-cream transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitBooking}
                className="flex-1 py-3 bg-gradient-to-r from-natalna-primary to-natalna-wood text-white rounded-lg hover:from-natalna-wood hover:to-natalna-wood transition-all duration-200 font-medium shadow-md"
              >
                Send Reservation
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default memo(Hero);
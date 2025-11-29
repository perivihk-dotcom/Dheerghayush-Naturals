import React from 'react';

// Certification badge images
const certificationImages = [
  {
    src: "https://customer-assets.emergentagent.com/job_b1975b45-1c10-40f1-aa57-d8fe88c6e242/artifacts/1ldfjpnq_generated-image.png",
    alt: "100% Natural - No Preservatives"
  },
  {
    src: "https://customer-assets.emergentagent.com/job_b1975b45-1c10-40f1-aa57-d8fe88c6e242/artifacts/cb8d5x99_generated-image%20%284%29.png",
    alt: "Organic 100% Certified"
  },
  {
    src: "https://customer-assets.emergentagent.com/job_b1975b45-1c10-40f1-aa57-d8fe88c6e242/artifacts/3u9abnoi_generated-image%20%281%29.png",
    alt: "Chemical Free"
  },
  {
    src: "https://customer-assets.emergentagent.com/job_b1975b45-1c10-40f1-aa57-d8fe88c6e242/artifacts/fco7m4ed_generated-image%20%283%29.png",
    alt: "USDA Organic Approved"
  }
];

// Main component that displays all 4 badges horizontally
const CertificationBadges = ({ className = "" }) => {
  return (
    <div className={`py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 lg:gap-16">
          {certificationImages.map((badge, index) => (
            <div key={index} className="flex-shrink-0">
              <img 
                src={badge.src} 
                alt={badge.alt}
                className={`object-contain transform hover:scale-105 transition-transform duration-300 ${
                  index === 3 
                    ? 'w-40 h-40' 
                    : index === 0
                    ? 'h-40'
                    : 'w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36'
                }`}
                style={
                  index === 3 
                    ? { width: '10rem', height: '10rem' } 
                    : index === 0 
                    ? { width: '9rem', height: '10rem' } 
                    : {}
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Compact version for smaller spaces
export const CertificationBadgesCompact = ({ className = "" }) => {
  return (
    <div className={`py-4 ${className}`}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
          {certificationImages.map((badge, index) => (
            <div key={index} className="flex-shrink-0">
              <img 
                src={badge.src} 
                alt={badge.alt}
                className={`object-contain transform hover:scale-105 transition-transform duration-300 ${
                  index === 3 
                    ? 'w-40 h-40' 
                    : index === 0
                    ? 'h-40'
                    : 'w-16 h-16 md:w-24 md:h-24'
                }`}
                style={
                  index === 3 
                    ? { width: '10rem', height: '10rem' } 
                    : index === 0 
                    ? { width: '9rem', height: '10rem' } 
                    : {}
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificationBadges;

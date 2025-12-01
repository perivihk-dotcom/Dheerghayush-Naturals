import React from 'react';

// Certification badge images
const certificationImages = [
  {
    src: "https://customer-assets.emergentagent.com/job_3ccccf1b-85b9-4ba5-89ed-9254a0935033/artifacts/qkuqf1ws_ChatGPT%20Image%20Nov%2030%2C%202025%2C%2003_22_21%20PM.png",
    alt: "Chemical Free"
  },
  {
    src: "https://customer-assets.emergentagent.com/job_3ccccf1b-85b9-4ba5-89ed-9254a0935033/artifacts/n2a528s2_ChatGPT%20Image%20Nov%2030%2C%202025%2C%2003_26_03%20PM.png",
    alt: "Organic 100% Certified"
  },
  {
    src: "https://customer-assets.emergentagent.com/job_3ccccf1b-85b9-4ba5-89ed-9254a0935033/artifacts/baw4vgau_ChatGPT%20Image%20Nov%2030%2C%202025%2C%2003_28_07%20PM.png",
    alt: "USDA Organic Approved"
  },
  {
    src: "https://customer-assets.emergentagent.com/job_cert-update/artifacts/uh2vdqbd_ChatGPT%20Image%20Nov%2030%2C%202025%2C%2003_53_18%20PM.png",
    alt: "100% Natural - No Preservatives"
  }
];

// Main component that displays all 4 badges horizontally
const CertificationBadges = ({ className = "" }) => {
  return (
    <div className={`py-8 bg-background ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center gap-3 md:gap-10 lg:gap-16">
          {certificationImages.map((badge, index) => (
            <div key={index} className="flex-shrink-0">
              <img 
                src={badge.src} 
                alt={badge.alt}
                className="object-contain transform hover:scale-105 transition-transform duration-300 w-16 h-16 md:w-36 md:h-36 lg:w-40 lg:h-40"
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
                className="object-contain transform hover:scale-105 transition-transform duration-300 w-20 h-20 md:w-28 md:h-28"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificationBadges;

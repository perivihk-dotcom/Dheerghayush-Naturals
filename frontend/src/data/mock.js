// Mock data for Dheerghayush Naturals e-commerce website

export const categories = [
  {
    id: 1,
    name: "Pulses",
    image: "https://images.unsplash.com/photo-1705475388190-775066fd69a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxwdWxzZXN8ZW58MHx8fHwxNzY0MzEyODgyfDA&ixlib=rb-4.1.0&q=85",
    slug: "pulses"
  },
  {
    id: 2,
    name: "Millets",
    image: "https://images.unsplash.com/photo-1651241587503-a874db54a1a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtaWxsZXRzfGVufDB8fHx8MTc2NDMxMjg3Nnww&ixlib=rb-4.1.0&q=85",
    slug: "millets"
  },
  {
    id: 3,
    name: "Wood Pressed Oil",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsc3xlbnwwfHx8fDE3NjQzMTI4OTh8MA&ixlib=rb-4.1.0&q=85",
    slug: "wood-pressed-oil"
  },
  {
    id: 4,
    name: "Wild Honey",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxob25leXxlbnwwfHx8fDE3NjQzMTI4OTN8MA&ixlib=rb-4.1.0&q=85",
    slug: "wild-honey"
  },
  {
    id: 5,
    name: "Desi Ghee",
    image: "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85",
    slug: "desi-ghee"
  },
  {
    id: 6,
    name: "Skin Care",
    image: "https://images.unsplash.com/photo-1599847935464-fde3827639c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwc2tpbmNhcmV8ZW58MHx8fHwxNzY0MzEyOTAzfDA&ixlib=rb-4.1.0&q=85",
    slug: "skin-care"
  },
  {
    id: 7,
    name: "Crockery",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=85",
    slug: "crockery"
  }
];

export const products = [
  // Pulses
  {
    id: 1,
    name: "Organic Toor Dal",
    category: "pulses",
    weight: "500 gms",
    price: 145,
    originalPrice: 175,
    image: "https://images.unsplash.com/photo-1723999817243-e18f2904b140?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxwdWxzZXN8ZW58MHx8fHwxNzY0MzEyODgyfDA&ixlib=rb-4.1.0&q=85",
    isBestseller: true
  },
  {
    id: 2,
    name: "Organic Moong Dal",
    category: "pulses",
    weight: "500 gms",
    price: 165,
    originalPrice: 195,
    image: "https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=400",
    isBestseller: true
  },
  {
    id: 3,
    name: "Organic Chana Dal",
    category: "pulses",
    weight: "500 gms",
    price: 120,
    originalPrice: 150,
    image: "https://images.unsplash.com/photo-1705475388190-775066fd69a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxwdWxzZXN8ZW58MHx8fHwxNzY0MzEyODgyfDA&ixlib=rb-4.1.0&q=85",
    isBestseller: false
  },
  {
    id: 4,
    name: "Organic Urad Dal",
    category: "pulses",
    weight: "500 gms",
    price: 155,
    originalPrice: 185,
    image: "https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=400",
    isBestseller: false
  },
  // Millets
  {
    id: 5,
    name: "Foxtail Millet (Korralu)",
    category: "millets",
    weight: "500 gms",
    price: 110,
    originalPrice: 140,
    image: "https://images.unsplash.com/photo-1651241587503-a874db54a1a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtaWxsZXRzfGVufDB8fHx8MTc2NDMxMjg3Nnww&ixlib=rb-4.1.0&q=85",
    isBestseller: true
  },
  {
    id: 6,
    name: "Little Millet (Samalu)",
    category: "millets",
    weight: "500 gms",
    price: 105,
    originalPrice: 130,
    image: "https://images.pexels.com/photos/27959280/pexels-photo-27959280.jpeg?auto=compress&cs=tinysrgb&w=400",
    isBestseller: true
  },
  {
    id: 7,
    name: "Barnyard Millet (Udalu)",
    category: "millets",
    weight: "500 gms",
    price: 115,
    originalPrice: 145,
    image: "https://images.unsplash.com/photo-1651241587503-a874db54a1a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtaWxsZXRzfGVufDB8fHx8MTc2NDMxMjg3Nnww&ixlib=rb-4.1.0&q=85",
    isBestseller: false
  },
  {
    id: 8,
    name: "Pearl Millet (Bajra)",
    category: "millets",
    weight: "500 gms",
    price: 85,
    originalPrice: 110,
    image: "https://images.pexels.com/photos/27959280/pexels-photo-27959280.jpeg?auto=compress&cs=tinysrgb&w=400",
    isBestseller: false
  },
  // Wood Pressed Oil
  {
    id: 9,
    name: "Wood Pressed Groundnut Oil",
    category: "wood-pressed-oil",
    weight: "1 Litre",
    price: 380,
    originalPrice: 450,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsc3xlbnwwfHx8fDE3NjQzMTI4OTh8MA&ixlib=rb-4.1.0&q=85",
    isBestseller: true
  },
  {
    id: 10,
    name: "Wood Pressed Coconut Oil",
    category: "wood-pressed-oil",
    weight: "1 Litre",
    price: 420,
    originalPrice: 500,
    image: "https://images.pexels.com/photos/8469436/pexels-photo-8469436.jpeg?auto=compress&cs=tinysrgb&w=400",
    isBestseller: true
  },
  {
    id: 11,
    name: "Wood Pressed Sesame Oil",
    category: "wood-pressed-oil",
    weight: "500 ml",
    price: 290,
    originalPrice: 350,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsc3xlbnwwfHx8fDE3NjQzMTI4OTh8MA&ixlib=rb-4.1.0&q=85",
    isBestseller: false
  },
  {
    id: 12,
    name: "Wood Pressed Mustard Oil",
    category: "wood-pressed-oil",
    weight: "1 Litre",
    price: 340,
    originalPrice: 400,
    image: "https://images.pexels.com/photos/8469436/pexels-photo-8469436.jpeg?auto=compress&cs=tinysrgb&w=400",
    isBestseller: false
  },
  // Wild Honey
  {
    id: 13,
    name: "Raw Wild Forest Honey",
    category: "wild-honey",
    weight: "500 gms",
    price: 450,
    originalPrice: 550,
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxob25leXxlbnwwfHx8fDE3NjQzMTI4OTN8MA&ixlib=rb-4.1.0&q=85",
    isBestseller: true
  },
  {
    id: 14,
    name: "Himalayan Wild Honey",
    category: "wild-honey",
    weight: "250 gms",
    price: 320,
    originalPrice: 400,
    image: "https://images.pexels.com/photos/33260/honey-sweet-syrup-organic.jpg?auto=compress&cs=tinysrgb&w=400",
    isBestseller: true
  },
  {
    id: 15,
    name: "Multiflora Wild Honey",
    category: "wild-honey",
    weight: "500 gms",
    price: 380,
    originalPrice: 470,
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxob25leXxlbnwwfHx8fDE3NjQzMTI4OTN8MA&ixlib=rb-4.1.0&q=85",
    isBestseller: false
  },
  // Desi Ghee
  {
    id: 16,
    name: "A2 Desi Cow Ghee",
    category: "desi-ghee",
    weight: "500 gms",
    price: 750,
    originalPrice: 900,
    image: "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85",
    isBestseller: true
  },
  {
    id: 17,
    name: "Bilona Desi Ghee",
    category: "desi-ghee",
    weight: "500 gms",
    price: 850,
    originalPrice: 1000,
    image: "https://images.unsplash.com/photo-1707425197195-240b7ad69047?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85",
    isBestseller: true
  },
  {
    id: 18,
    name: "Buffalo Ghee Traditional",
    category: "desi-ghee",
    weight: "500 gms",
    price: 600,
    originalPrice: 720,
    image: "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85",
    isBestseller: false
  },
  // Skin Care
  {
    id: 19,
    name: "Natural Aloe Vera Gel",
    category: "skin-care",
    weight: "200 gms",
    price: 180,
    originalPrice: 220,
    image: "https://images.unsplash.com/photo-1599847935464-fde3827639c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwc2tpbmNhcmV8ZW58MHx8fHwxNzY0MzEyOTAzfDA&ixlib=rb-4.1.0&q=85",
    isBestseller: true
  },
  {
    id: 20,
    name: "Herbal Face Pack",
    category: "skin-care",
    weight: "100 gms",
    price: 150,
    originalPrice: 190,
    image: "https://images.unsplash.com/photo-1626783416763-67a92e5e7266?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxuYXR1cmFsJTIwc2tpbmNhcmV8ZW58MHx8fHwxNzY0MzEyOTAzfDA&ixlib=rb-4.1.0&q=85",
    isBestseller: true
  },
  {
    id: 21,
    name: "Turmeric Body Lotion",
    category: "skin-care",
    weight: "200 ml",
    price: 220,
    originalPrice: 280,
    image: "https://images.unsplash.com/photo-1599847935464-fde3827639c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwc2tpbmNhcmV8ZW58MHx8fHwxNzY0MzEyOTAzfDA&ixlib=rb-4.1.0&q=85",
    isBestseller: false
  },
  // Crockery
  {
    id: 22,
    name: "Terracotta Water Pot",
    category: "crockery",
    weight: "5 Litres",
    price: 450,
    originalPrice: 550,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=85",
    isBestseller: true
  },
  {
    id: 23,
    name: "Brass Cooking Utensils Set",
    category: "crockery",
    weight: "Set of 3",
    price: 1200,
    originalPrice: 1500,
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=85",
    isBestseller: false
  },
  {
    id: 24,
    name: "Clay Kadai Traditional",
    category: "crockery",
    weight: "Medium",
    price: 350,
    originalPrice: 420,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=85",
    isBestseller: false
  }
];

// Combo Products
export const combos = [
  {
    id: 101,
    name: "Healthy Kitchen Starter Pack",
    description: "Essential oils and ghee for your healthy kitchen",
    products: [9, 16], // Groundnut Oil + A2 Cow Ghee
    originalPrice: 1350,
    comboPrice: 1099,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsc3xlbnwwfHx8fDE3NjQzMTI4OTh8MA&ixlib=rb-4.1.0&q=85",
    isBestseller: true,
    savings: 251
  },
  {
    id: 102,
    name: "Millet Power Combo",
    description: "Complete millet variety for balanced nutrition",
    products: [5, 6, 7, 8], // All 4 millets
    originalPrice: 525,
    comboPrice: 399,
    image: "https://images.unsplash.com/photo-1651241587503-a874db54a1a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtaWxsZXRzfGVufDB8fHx8MTc2NDMxMjg3Nnww&ixlib=rb-4.1.0&q=85",
    isBestseller: true,
    savings: 126
  },
  {
    id: 103,
    name: "Daily Dal Essentials",
    description: "Premium organic pulses for everyday cooking",
    products: [1, 2, 3, 4], // All 4 pulses
    originalPrice: 705,
    comboPrice: 549,
    image: "https://images.unsplash.com/photo-1705475388190-775066fd69a5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxwdWxzZXN8ZW58MHx8fHwxNzY0MzEyODgyfDA&ixlib=rb-4.1.0&q=85",
    isBestseller: false,
    savings: 156
  },
  {
    id: 104,
    name: "Sweet Immunity Booster",
    description: "Wild honey collection for natural immunity",
    products: [13, 14, 15], // All 3 honey variants
    originalPrice: 1420,
    comboPrice: 1099,
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxob25leXxlbnwwfHx8fDE3NjQzMTI4OTN8MA&ixlib=rb-4.1.0&q=85",
    isBestseller: true,
    savings: 321
  },
  {
    id: 105,
    name: "Complete Skincare Ritual",
    description: "Natural skincare essentials for glowing skin",
    products: [19, 20, 21], // All skincare products
    originalPrice: 690,
    comboPrice: 499,
    image: "https://images.unsplash.com/photo-1599847935464-fde3827639c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxuYXR1cmFsJTIwc2tpbmNhcmV8ZW58MHx8fHwxNzY0MzEyOTAzfDA&ixlib=rb-4.1.0&q=85",
    isBestseller: false,
    savings: 191
  },
  {
    id: 106,
    name: "Premium Ghee Collection",
    description: "Traditional ghee varieties for authentic taste",
    products: [16, 17, 18], // All ghee products
    originalPrice: 2620,
    comboPrice: 1999,
    image: "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85",
    isBestseller: true,
    savings: 621
  }
];

// Google Reviews - 5 Star Reviews from Google Maps
export const googleReviews = [
  {
    id: 1,
    name: "Srinivas Reddy",
    rating: 5,
    timeAgo: "2 months ago",
    image: "https://ui-avatars.com/api/?name=Srinivas+Reddy&background=4CAF50&color=fff&size=100",
    text: "Excellent quality organic products! I have been buying their wood pressed groundnut oil and A2 cow ghee for the past 6 months. The taste and aroma are just like the traditional homemade ones. Highly recommended for health-conscious people.",
    isGoogleReview: true
  },
  {
    id: 2,
    name: "Lakshmi Devi",
    rating: 5,
    timeAgo: "3 weeks ago",
    image: "https://ui-avatars.com/api/?name=Lakshmi+Devi&background=8BC34A&color=fff&size=100",
    text: "Best place for pure and natural products in Nellore. Their wild honey is 100% genuine and millets are of premium quality. The shop owner is very knowledgeable and helpful. Will definitely continue buying from here.",
    isGoogleReview: true
  },
  {
    id: 3,
    name: "Venkat Rao",
    rating: 5,
    timeAgo: "1 month ago",
    image: "https://ui-avatars.com/api/?name=Venkat+Rao&background=FF9800&color=fff&size=100",
    text: "Amazing collection of organic products. I switched to their millets and pulses 3 months back and can feel the difference in health. Products are fresh, well-packed and reasonably priced. Great customer service too!",
    isGoogleReview: true
  },
  {
    id: 4,
    name: "Padma Kumari",
    rating: 5,
    timeAgo: "2 weeks ago",
    image: "https://ui-avatars.com/api/?name=Padma+Kumari&background=E91E63&color=fff&size=100",
    text: "Finally found a trustworthy store for natural products! Their desi ghee made using traditional bilona method is absolutely pure. My family loves the quality. They also have excellent skincare products. 5 stars!",
    isGoogleReview: true
  },
  {
    id: 5,
    name: "Ravi Krishna",
    rating: 5,
    timeAgo: "1 week ago",
    image: "https://ui-avatars.com/api/?name=Ravi+Krishna&background=2196F3&color=fff&size=100",
    text: "Outstanding quality and service! Bought their complete millet combo and wood pressed oils. Everything is authentic and chemical-free. The owner personally ensures quality. This is the go-to shop for organic products.",
    isGoogleReview: true
  }
];

// Google Business Rating Info
export const googleRating = {
  rating: 4.9,
  totalReviews: 14,
  mapsUrl: "https://www.google.com/maps/place/Dheerghayush+naturals/@14.4393297,79.9758369,14z/data=!4m8!3m7!1s0x3a4cf3877a32464f:0x83e265bb829c59f8!8m2!3d14.4291837!4d79.971481!9m1!1b1!16s%2Fg%2F11wmtbsd71?entry=ttu"
};

export const testimonials = googleReviews;

export const healthBenefits = [
  { id: 1, name: "Digestive Health", icon: "Salad" },
  { id: 2, name: "Heart Health", icon: "Heart" },
  { id: 3, name: "Weight Management", icon: "Scale" },
  { id: 4, name: "Immunity Boost", icon: "Shield" },
  { id: 5, name: "Skin & Hair", icon: "Sparkles" }
];

export const navItems = [
  { name: "Shop by Categories", hasDropdown: true },
  { name: "Best Sellers", href: "#bestsellers" },
  { name: "New Arrivals", href: "#newarrivals" },
  { name: "Combos", href: "/combos" },
  { name: "Our Story", href: "/our-story" },
  { name: "Contact", href: "/contact" }
];

export const businessInfo = {
  name: "Dheerghayush Naturals",
  tagline: "Pure & Natural Products from Farm to Table",
  phone: "+91 7032254736",
  phone2: "+91 9866569995",
  gstin: "37DKGPD9949Q1Z4",
  email: "info@dheerghayushnaturals.com",
  address: "Hyderabad, Telangana, India",
  logo: "https://customer-assets.emergentagent.com/job_c67aaa90-dc21-46a0-b563-98e200682ef0/artifacts/d1j3jlmb_images.jpeg"
};

export const heroSlides = [
  {
    id: 1,
    title: "Pure & Natural",
    subtitle: "Wood Pressed Oils",
    description: "Experience the authentic taste and health benefits of traditionally extracted oils",
    bgColor: "#4CAF50",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb29raW5nJTIwb2lsc3xlbnwwfHx8fDE3NjQzMTI4OTh8MA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: 2,
    title: "Organic Millets",
    subtitle: "For Healthy Living",
    description: "Unpolished, chemical-free millets sourced directly from farmers",
    bgColor: "#FF9800",
    image: "https://images.unsplash.com/photo-1651241587503-a874db54a1a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxtaWxsZXRzfGVufDB8fHx8MTc2NDMxMjg3Nnww&ixlib=rb-4.1.0&q=85"
  },
  {
    id: 3,
    title: "A2 Desi Ghee",
    subtitle: "Traditional Bilona Method",
    description: "Pure cow ghee made using the ancient bilona churning process",
    bgColor: "#8BC34A",
    image: "https://images.unsplash.com/photo-1573812461383-e5f8b759d12e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxnaGVlfGVufDB8fHx8MTc2NDMxMjg4N3ww&ixlib=rb-4.1.0&q=85"
  }
];

import sugunawetgriender from '../assets/sugunawetgriender.webp';
import sugunawetgriender2 from '../assets/sugunawetgriender2.webp';
import vidiemwetgriender from '../assets/vidiemwetgriender.webp';
import butterflywetgriender from '../assets/butterflywetgriender.webp';
import prestigegasstove from '../assets/prestigegasstove.webp';
import butterflygasstove from '../assets/butterflygasstove.webp';
import suryagasstove from '../assets/suryagasstove.webp';
import cromptonfan from '../assets/cromptonfan.webp';
import orientfan from '../assets/orientfan.webp';
import suryafan from '../assets/suryafan.webp';
import samsungtv from '../assets/samsungtv.webp';
import sonytv from '../assets/sonytv.webp';
import philipstv from '../assets/philipstv.webp';
import preethi from '../assets/Preethi Zodiac Mixer Grinder 750W.webp';
import philipsiron from '../assets/Philips Steam Iron GC1905.webp';
import havells from '../assets/Havells Aquas Water Purifier.webp';
import hiflo from '../assets/HiFlo Rechargeable Mosquito Racket.webp';

// Helper: calculate minimum monthly EMI (12-month tenure, 14% p.a.)
function calcEmi(price, months = 12, ratePercent = 14) {
  const r = ratePercent / 12 / 100;
  return Math.round((price * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

export const products = [
  // Wet Grinders
  {
    id: 1,
    name: "Suguna Table Top Wet Grinder - 2L",
    brand: "Suguna",
    category: "Wet Grinder",
    price: 1,
    originalPrice: 5999,
    discount: 25,
    rating: 4.8,
    reviews: 1240,
    image: sugunawetgriender,
    inStock: true,
    badge: "Best Seller",
    emi: { available: true, minMonths: 6, maxMonths: 24, monthlyFrom: calcEmi(4499, 6) },
    specs: { "Capacity": "2 Litres", "Motor": "150W", "Material": "Stainless Steel" }
  },
  {
    id: 2,
    name: "Vidiem Jewel ST Wet Grinder",
    brand: "Vidiem",
    category: "Wet Grinder",
    price: 5200,
    originalPrice: 6500,
    discount: 20,
    rating: 4.6,
    reviews: 850,
    image: vidiemwetgriender,
    inStock: true,
    emi: { available: true, minMonths: 6, maxMonths: 24, monthlyFrom: calcEmi(5200, 6) },
    specs: { "Capacity": "2 Litres", "Motor": "140W", "Weight": "12kg" }
  },
  {
    id: 3,
    name: "Butterfly Rhino Plus Wet Grinder",
    brand: "Butterfly",
    category: "Wet Grinder",
    price: 3999,
    originalPrice: 4999,
    discount: 20,
    rating: 4.5,
    reviews: 2100,
    image: butterflywetgriender,
    inStock: true,
    badge: "New",
    emi: { available: true, minMonths: 6, maxMonths: 24, monthlyFrom: calcEmi(3999, 6) },
    specs: { "Capacity": "2 Litres", "Motor": "150W", "Body": "ABS Plastic" }
  },
  {
    id: 4,
    name: "Suguna Commercial Tilting Grinder - 5L",
    brand: "Suguna",
    category: "Wet Grinder",
    price: 12500,
    originalPrice: 15000,
    discount: 16,
    rating: 4.9,
    reviews: 320,
    image: sugunawetgriender2,
    inStock: true,
    badge: "Deal",
    emi: { available: true, minMonths: 6, maxMonths: 24, monthlyFrom: calcEmi(12500, 12) },
    specs: { "Capacity": "5 Litres", "Motor": "0.5 HP", "Type": "Tilting" }
  },

  // Gas Stoves
  {
    id: 5,
    name: "Prestige Royale 2-Burner Gas Stove",
    brand: "Prestige",
    category: "Gas Stove",
    price: 2800,
    originalPrice: 3500,
    discount: 20,
    rating: 4.4,
    reviews: 1500,
    image: prestigegasstove,
    inStock: true,
    emi: { available: true, minMonths: 3, maxMonths: 12, monthlyFrom: calcEmi(2800, 3) },
    specs: { "Burners": "2", "Material": "Glass Top", "Ignition": "Manual" }
  },
  {
    id: 6,
    name: "Butterfly Smart Glass Top 3 Burner",
    brand: "Butterfly",
    category: "Gas Stove",
    price: 3499,
    originalPrice: 4999,
    discount: 30,
    rating: 4.3,
    reviews: 2800,
    image: butterflygasstove,
    inStock: true,
    badge: "Best Seller",
    emi: { available: true, minMonths: 3, maxMonths: 12, monthlyFrom: calcEmi(3499, 3) },
    specs: { "Burners": "3", "Material": "Toughened Glass", "Ignition": "Manual" }
  },
  {
    id: 7,
    name: "Surya Flame 2 Burner Stainless Steel",
    brand: "Surya",
    category: "Gas Stove",
    price: 1999,
    originalPrice: 2499,
    discount: 20,
    rating: 4.2,
    reviews: 980,
    image: suryagasstove,
    inStock: true,
    emi: { available: true, minMonths: 3, maxMonths: 12, monthlyFrom: calcEmi(1999, 3) },
    specs: { "Burners": "2", "Material": "Stainless Steel", "Ignition": "Manual" }
  },

  // Fans
  {
    id: 8,
    name: "Crompton Hill Briz 48-inch Ceiling Fan",
    brand: "Crompton",
    category: "Fan",
    price: 1599,
    originalPrice: 2100,
    discount: 24,
    rating: 4.5,
    reviews: 5400,
    image: cromptonfan,
    inStock: true,
    emi: { available: true, minMonths: 3, maxMonths: 12, monthlyFrom: calcEmi(1599, 3) },
    specs: { "Type": "Ceiling", "Sweep": "1200mm", "Speed": "380 RPM" }
  },
  {
    id: 9,
    name: "Orient Electric Stand-37 Trend Fan",
    brand: "Orient",
    category: "Fan",
    price: 2499,
    originalPrice: 3200,
    discount: 22,
    rating: 4.4,
    reviews: 1200,
    image: orientfan,
    inStock: true,
    emi: { available: true, minMonths: 3, maxMonths: 12, monthlyFrom: calcEmi(2499, 3) },
    specs: { "Type": "Pedestal", "Speed": "1300 RPM", "Oscillation": "Yes" }
  },
  {
    id: 10,
    name: "Surya Table Fan 12-inch",
    brand: "Surya",
    category: "Fan",
    price: 1299,
    originalPrice: 1799,
    discount: 28,
    rating: 4.1,
    reviews: 650,
    image: suryafan,
    inStock: true,
    emi: { available: false },
    specs: { "Type": "Table", "Speed": "2000 RPM", "Blades": "3" }
  },

  // TVs
  {
    id: 11,
    name: "Samsung 43-inch Crystal 4K Smart TV",
    brand: "Samsung",
    category: "TV",
    price: 32990,
    originalPrice: 45000,
    discount: 27,
    rating: 4.7,
    reviews: 12500,
    image: samsungtv,
    inStock: true,
    badge: "Best Seller",
    emi: { available: true, minMonths: 6, maxMonths: 24, monthlyFrom: calcEmi(32990, 12) },
    specs: { "Size": "43 inch", "Resolution": "4K Ultra HD", "Smart TV": "Yes" }
  },
  {
    id: 12,
    name: "Sony Bravia 32-inch HD Ready",
    brand: "Sony",
    category: "TV",
    price: 24990,
    originalPrice: 29900,
    discount: 16,
    rating: 4.8,
    reviews: 8400,
    image: sonytv,
    inStock: true,
    emi: { available: true, minMonths: 6, maxMonths: 24, monthlyFrom: calcEmi(24990, 12) },
    specs: { "Size": "32 inch", "Resolution": "HD Ready", "Smart TV": "Yes" }
  },
  {
    id: 13,
    name: "Philips 50-inch 4K UHD LED",
    brand: "Philips",
    category: "TV",
    price: 38999,
    originalPrice: 52000,
    discount: 25,
    rating: 4.5,
    reviews: 3200,
    image: philipstv,
    inStock: true,
    badge: "Deal",
    emi: { available: true, minMonths: 6, maxMonths: 24, monthlyFrom: calcEmi(38999, 12) },
    specs: { "Size": "50 inch", "Resolution": "4K UHD", "Smart TV": "Yes" }
  },

  // Kitchen Appliances
  {
    id: 14,
    name: "Preethi Zodiac Mixer Grinder 750W",
    brand: "Preethi",
    category: "Kitchen",
    price: 8500,
    originalPrice: 10500,
    discount: 19,
    rating: 4.6,
    reviews: 15200,
    image: preethi,
    inStock: true,
    badge: "Best Seller",
    emi: { available: true, minMonths: 6, maxMonths: 24, monthlyFrom: calcEmi(8500, 6) },
    specs: { "Motor": "750W", "Jars": "5", "Color": "Black" }
  },
  {
    id: 15,
    name: "Philips Steam Iron GC1905",
    brand: "Philips",
    category: "Kitchen",
    price: 1599,
    originalPrice: 1999,
    discount: 20,
    rating: 4.3,
    reviews: 4500,
    image: philipsiron,
    inStock: true,
    emi: { available: false },
    specs: { "Type": "Steam", "Power": "1440W", "Soleplate": "Non-stick" }
  },
  {
    id: 16,
    name: "Havells Aquas Water Purifier",
    brand: "Havells",
    category: "Kitchen",
    price: 12999,
    originalPrice: 15999,
    discount: 19,
    rating: 4.4,
    reviews: 890,
    image: havells,
    inStock: true,
    emi: { available: true, minMonths: 6, maxMonths: 24, monthlyFrom: calcEmi(12999, 12) },
    specs: { "Purification": "RO + UV", "Capacity": "7L", "Type": "Wall Mounted" }
  },

  // Small Appliances
  {
    id: 17,
    name: "HiFlo Rechargeable Mosquito Racket",
    brand: "HiFlo",
    category: "Small Appliances",
    price: 499,
    originalPrice: 699,
    discount: 28,
    rating: 4.2,
    reviews: 2100,
    image: hiflo,
    inStock: true,
    badge: "Best Seller",
    emi: { available: false },
    specs: { "Battery": "1200mAh", "Charge Time": "4 hours", "Warranty": "6 months" }
  }
];
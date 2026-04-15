import 'dotenv/config';
import { query } from '../src/config/db.js';

// ============================================
// SEED DATA — 8 Categories, 50+ Products
// ============================================

const categories = [
  { name: 'Electronics', slug: 'electronics', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200', children: [
    { name: 'Laptops', slug: 'laptops', image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200' },
    { name: 'Headphones', slug: 'headphones', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200' },
    { name: 'Cameras', slug: 'cameras', image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200' },
  ]},
  { name: 'Mobiles', slug: 'mobiles', image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200', children: [
    { name: 'Smartphones', slug: 'smartphones', image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200' },
    { name: 'Cases & Covers', slug: 'cases-covers', image_url: 'https://images.unsplash.com/photo-1601972599720-36938d4ecd31?w=200' },
  ]},
  { name: 'Fashion Men', slug: 'fashion-men', image_url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=200', children: [] },
  { name: 'Fashion Women', slug: 'fashion-women', image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200', children: [] },
  { name: 'Home & Kitchen', slug: 'home-kitchen', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200', children: [] },
  { name: 'Books', slug: 'books', image_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200', children: [] },
  { name: 'Sports', slug: 'sports', image_url: 'https://images.unsplash.com/photo-1461896836934-bd45ba6343b4?w=200', children: [] },
  { name: 'Beauty', slug: 'beauty', image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200', children: [] },
];

interface ProductSeed {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  mrp: number;
  category_slug: string;
  brand: string;
  stock_quantity: number;
  specifications: Record<string, Record<string, string>>;
  highlights: string[];
  images: { url: string; alt: string; is_primary: boolean }[];
}

const products: ProductSeed[] = [
  // ========== ELECTRONICS - LAPTOPS ==========
  {
    name: 'Apple MacBook Air M2 (2023) 13.6-inch Laptop',
    slug: 'apple-macbook-air-m2-2023',
    description: 'The redesigned MacBook Air is supercharged by the M2 chip. With an impossibly thin design, 13.6-inch Liquid Retina display, and up to 18 hours of battery life.',
    short_description: 'M2 chip, 8GB RAM, 256GB SSD, 13.6" Liquid Retina',
    price: 99990, mrp: 119900, category_slug: 'laptops', brand: 'Apple', stock_quantity: 25,
    specifications: { General: { Brand: 'Apple', Model: 'MacBook Air M2', Type: 'Ultrabook', Color: 'Midnight' }, Processor: { Chip: 'Apple M2', 'CPU Cores': '8', 'GPU Cores': '8' }, Memory: { RAM: '8 GB', Storage: '256 GB SSD' }, Display: { Size: '13.6 inches', Resolution: '2560 x 1664', Type: 'Liquid Retina' }, Battery: { Life: 'Up to 18 hours', Charging: 'MagSafe' } },
    highlights: ['Apple M2 chip with 8-core CPU and 8-core GPU', '13.6-inch Liquid Retina display', 'Up to 18 hours of battery life', '1080p FaceTime HD camera', 'Four-speaker sound system with Spatial Audio', 'MagSafe charging port'],
    images: [
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', alt: 'MacBook Air front view', is_primary: true },
      { url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600', alt: 'MacBook Air side view', is_primary: false },
      { url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600', alt: 'MacBook Air keyboard', is_primary: false },
    ]
  },
  {
    name: 'ASUS ROG Strix G15 Gaming Laptop',
    slug: 'asus-rog-strix-g15-gaming',
    description: 'Dominate the gaming world with the ROG Strix G15, featuring AMD Ryzen 7, NVIDIA RTX 4060, and a 165Hz FHD display.',
    short_description: 'Ryzen 7, RTX 4060, 16GB RAM, 512GB SSD, 165Hz',
    price: 89990, mrp: 114990, category_slug: 'laptops', brand: 'ASUS', stock_quantity: 15,
    specifications: { General: { Brand: 'ASUS', Model: 'ROG Strix G15', Type: 'Gaming Laptop' }, Processor: { CPU: 'AMD Ryzen 7 7735HS', Cores: '8', Threads: '16' }, Graphics: { GPU: 'NVIDIA RTX 4060', VRAM: '8GB GDDR6' }, Memory: { RAM: '16 GB DDR5', Storage: '512 GB NVMe SSD' }, Display: { Size: '15.6 inches', 'Refresh Rate': '165 Hz', Resolution: '1920 x 1080' } },
    highlights: ['AMD Ryzen 7 7735HS Processor', 'NVIDIA GeForce RTX 4060 8GB', '165Hz FHD IPS display', 'RGB backlit keyboard', 'Wi-Fi 6E, MUX Switch'],
    images: [
      { url: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600', alt: 'ROG Strix front', is_primary: true },
      { url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600', alt: 'ROG Strix open', is_primary: false },
    ]
  },
  {
    name: 'HP Pavilion 14 Intel Core i5 12th Gen Laptop',
    slug: 'hp-pavilion-14-i5-12th-gen',
    description: 'Sleek and powerful. The HP Pavilion 14 offers everyday performance with a vibrant 14-inch FHD display.',
    short_description: 'i5-1235U, 16GB RAM, 512GB SSD, 14" FHD',
    price: 54990, mrp: 69999, category_slug: 'laptops', brand: 'HP', stock_quantity: 30,
    specifications: { Processor: { CPU: 'Intel Core i5-1235U', Generation: '12th Gen' }, Memory: { RAM: '16 GB DDR4', Storage: '512 GB SSD' }, Display: { Size: '14 inches', Resolution: '1920 x 1080 FHD' } },
    highlights: ['12th Gen Intel Core i5 processor', '16GB DDR4 RAM', '512GB SSD storage', 'Micro-edge anti-glare display', 'B&O Audio speakers'],
    images: [
      { url: 'https://images.unsplash.com/photo-1544099858-75feeb57f01b?w=600', alt: 'HP Pavilion', is_primary: true },
      { url: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=600', alt: 'HP Pavilion angle', is_primary: false },
    ]
  },
  {
    name: 'Lenovo IdeaPad Slim 3 AMD Ryzen 5 Laptop',
    slug: 'lenovo-ideapad-slim-3-ryzen5',
    description: 'Thin, light, and ready for anything. The IdeaPad Slim 3 balances performance and portability.',
    short_description: 'Ryzen 5 7530U, 8GB RAM, 512GB SSD, 15.6" FHD',
    price: 41990, mrp: 56691, category_slug: 'laptops', brand: 'Lenovo', stock_quantity: 40,
    specifications: { Processor: { CPU: 'AMD Ryzen 5 7530U' }, Memory: { RAM: '8 GB DDR4', Storage: '512 GB SSD' }, Display: { Size: '15.6 inches', Resolution: '1920 x 1080' } },
    highlights: ['AMD Ryzen 5 7530U processor', '8GB RAM, expandable', '512GB SSD', '15.6 FHD anti-glare display', 'Dolby Audio speakers'],
    images: [
      { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600', alt: 'IdeaPad Slim', is_primary: true },
    ]
  },

  // ========== ELECTRONICS - HEADPHONES ==========
  {
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    slug: 'sony-wh-1000xm5',
    description: 'Industry-leading noise cancellation with exceptional sound quality. 30 hours of battery life.',
    short_description: 'ANC, LDAC, 30hr battery, Multipoint',
    price: 26990, mrp: 34990, category_slug: 'headphones', brand: 'Sony', stock_quantity: 35,
    specifications: { General: { Brand: 'Sony', Color: 'Black', Weight: '250g' }, Audio: { Driver: '30mm', 'Noise Cancellation': 'Active (ANC)', Codec: 'LDAC, AAC, SBC' }, Battery: { Life: '30 hours', Charging: 'USB-C', 'Quick Charge': '3 min = 3 hours' } },
    highlights: ['Industry-leading noise cancellation', 'Exceptional sound quality with LDAC', '30 hours battery life', 'Multipoint connection', 'Speak-to-chat auto-pause', 'Comfortable lightweight design (250g)'],
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', alt: 'Sony headphones', is_primary: true },
      { url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600', alt: 'Sony headphones side', is_primary: false },
    ]
  },
  {
    name: 'JBL Tune 760NC Wireless Over-Ear Headphones',
    slug: 'jbl-tune-760nc',
    description: 'JBL Pure Bass Sound with Active Noise Cancelling. Up to 50 hours of battery.',
    short_description: 'ANC, JBL Pure Bass, 50hr battery',
    price: 4499, mrp: 7999, category_slug: 'headphones', brand: 'JBL', stock_quantity: 50,
    specifications: { Audio: { Driver: '40mm', 'Noise Cancellation': 'Active' }, Battery: { Life: '50 hours (ANC off)', Charging: 'USB-C' } },
    highlights: ['JBL Pure Bass Sound', 'Active Noise Cancelling', '50 hours playtime', 'Lightweight & foldable', 'Multi-point connection'],
    images: [
      { url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600', alt: 'JBL headphones', is_primary: true },
    ]
  },
  {
    name: 'boAt Rockerz 450 Wireless Headphone',
    slug: 'boat-rockerz-450',
    description: 'Immersive audio experience with 40mm drivers and up to 15 hours of playback.',
    short_description: '40mm drivers, 15hr battery, lightweight',
    price: 999, mrp: 2990, category_slug: 'headphones', brand: 'boAt', stock_quantity: 100,
    specifications: { Audio: { Driver: '40mm' }, Battery: { Life: '15 hours' } },
    highlights: ['40mm powerful drivers', '15 hours playback', 'Padded ear cushions', 'Lightweight design', 'Built-in mic'],
    images: [
      { url: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600', alt: 'boAt headphones', is_primary: true },
    ]
  },

  // ========== MOBILES - SMARTPHONES ==========
  {
    name: 'Apple iPhone 15 Pro Max (256GB) - Natural Titanium',
    slug: 'apple-iphone-15-pro-max-256gb',
    description: 'iPhone 15 Pro Max features a strong and light aerospace-grade titanium design with the A17 Pro chip.',
    short_description: 'A17 Pro, 256GB, 48MP Camera, Titanium',
    price: 149900, mrp: 159900, category_slug: 'smartphones', brand: 'Apple', stock_quantity: 20,
    specifications: { General: { Brand: 'Apple', Model: 'iPhone 15 Pro Max', OS: 'iOS 17' }, Processor: { Chip: 'A17 Pro', 'CPU Cores': '6' }, Display: { Size: '6.7 inches', Type: 'Super Retina XDR OLED', Resolution: '2796 x 1290' }, Camera: { Main: '48 MP', Ultrawide: '12 MP', Telephoto: '12 MP (5x)', Front: '12 MP TrueDepth' }, Storage: { Internal: '256 GB' } },
    highlights: ['A17 Pro chip for incredible performance', 'Titanium design — strong and light', '48MP main camera with 5x optical zoom', 'Action button for quick access', 'USB-C with USB 3 speeds', 'All-day battery life'],
    images: [
      { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', alt: 'iPhone 15 Pro Max front', is_primary: true },
      { url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600', alt: 'iPhone close up', is_primary: false },
      { url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600', alt: 'iPhone in hand', is_primary: false },
    ]
  },
  {
    name: 'Samsung Galaxy S24 Ultra 5G (12GB/256GB) - Titanium Gray',
    slug: 'samsung-galaxy-s24-ultra-256gb',
    description: 'Galaxy AI is here. Titanium frame, 200MP camera, built-in S Pen, and the power of Snapdragon 8 Gen 3.',
    short_description: 'Snapdragon 8 Gen 3, 200MP, S Pen, Galaxy AI',
    price: 129999, mrp: 139999, category_slug: 'smartphones', brand: 'Samsung', stock_quantity: 18,
    specifications: { Processor: { Chip: 'Snapdragon 8 Gen 3' }, Display: { Size: '6.8 inches', Type: 'Dynamic AMOLED 2X' }, Camera: { Main: '200 MP', Ultrawide: '12 MP', Telephoto: '50 MP + 10 MP' }, Storage: { RAM: '12 GB', Internal: '256 GB' } },
    highlights: ['Galaxy AI built-in', '200MP advanced camera system', 'Titanium frame durability', 'Embedded S Pen', '6.8" QHD+ Dynamic AMOLED 2X', 'Snapdragon 8 Gen 3 for Galaxy'],
    images: [
      { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600', alt: 'Galaxy S24 Ultra', is_primary: true },
      { url: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600', alt: 'Samsung phone', is_primary: false },
    ]
  },
  {
    name: 'OnePlus 12 5G (16GB/256GB) - Silky Black',
    slug: 'oneplus-12-5g-256gb',
    description: 'The OnePlus 12 redefines flagship performance with Snapdragon 8 Gen 3 and Hasselblad 4th Gen camera.',
    short_description: 'Snapdragon 8 Gen 3, 50MP Hasselblad, 100W',
    price: 59999, mrp: 69999, category_slug: 'smartphones', brand: 'OnePlus', stock_quantity: 30,
    specifications: { Processor: { Chip: 'Snapdragon 8 Gen 3' }, Display: { Size: '6.82 inches', Type: 'LTPO AMOLED', 'Refresh Rate': '120 Hz' }, Camera: { Main: '50 MP', Ultrawide: '48 MP', Telephoto: '64 MP' }, Battery: { Capacity: '5400 mAh', Charging: '100W SUPERVOOC' } },
    highlights: ['Snapdragon 8 Gen 3 mobile platform', '50MP Hasselblad camera system', '100W SUPERVOOC fast charging', '5400mAh battery', '6.82" 2K 120Hz ProXDR display', 'Aqua Touch for wet-screen use'],
    images: [
      { url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600', alt: 'OnePlus 12', is_primary: true },
    ]
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro+ 5G (8GB/256GB)',
    slug: 'redmi-note-13-pro-plus-5g',
    description: 'Pro-grade 200MP camera, 120W HyperCharge, and curved AMOLED display at an incredible price.',
    short_description: '200MP camera, 120W charge, curved AMOLED',
    price: 27999, mrp: 33999, category_slug: 'smartphones', brand: 'Xiaomi', stock_quantity: 45,
    specifications: { Processor: { Chip: 'MediaTek Dimensity 7200 Ultra' }, Camera: { Main: '200 MP OIS' }, Battery: { Capacity: '5000 mAh', Charging: '120W HyperCharge' } },
    highlights: ['200MP OIS main camera', '120W HyperCharge', '1.5K 120Hz curved AMOLED', 'IP68 water resistance', '5000mAh battery'],
    images: [
      { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', alt: 'Redmi Note', is_primary: true },
    ]
  },
  {
    name: 'realme narzo 70x 5G (4GB/128GB)',
    slug: 'realme-narzo-70x-5g',
    description: 'Powerful 5G smartphone with Dimensity 6100+ and 120Hz display at a budget-friendly price.',
    short_description: 'Dimensity 6100+, 120Hz, 5000mAh',
    price: 11499, mrp: 14999, category_slug: 'smartphones', brand: 'realme', stock_quantity: 60,
    specifications: { Processor: { Chip: 'Dimensity 6100+' }, Display: { 'Refresh Rate': '120 Hz' }, Battery: { Capacity: '5000 mAh' } },
    highlights: ['MediaTek Dimensity 6100+ 5G', '120Hz Ultra Smooth display', '50MP AI camera', '5000mAh battery', 'Side fingerprint sensor'],
    images: [
      { url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600', alt: 'realme narzo', is_primary: true },
    ]
  },

  // ========== FASHION MEN ==========
  {
    name: 'Levi\'s Men\'s 511 Slim Fit Jeans - Dark Blue',
    slug: 'levis-511-slim-fit-dark-blue',
    description: 'Classic slim from hip to ankle. The 511 is a modern slim that sits below the waist with a narrow leg.',
    short_description: 'Slim Fit, Stretch Denim, Dark Blue',
    price: 2299, mrp: 4499, category_slug: 'fashion-men', brand: "Levi's", stock_quantity: 80,
    specifications: { General: { Fit: 'Slim', Fabric: '98% Cotton, 2% Elastane', Rise: 'Mid Rise', Closure: 'Zip Fly' } },
    highlights: ['Slim fit from hip to ankle', 'Stretch denim for comfort', 'Classic 5-pocket styling', 'Durable construction', 'Versatile dark wash'],
    images: [
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', alt: 'Jeans', is_primary: true },
    ]
  },
  {
    name: 'Nike Dri-FIT Men\'s Training T-Shirt - Black',
    slug: 'nike-dri-fit-training-tshirt-black',
    description: 'Sweat-wicking technology keeps you dry and comfortable through every rep.',
    short_description: 'Dri-FIT, Regular Fit, Polyester',
    price: 1295, mrp: 1795, category_slug: 'fashion-men', brand: 'Nike', stock_quantity: 100,
    specifications: { General: { Fit: 'Regular', Fabric: '100% Polyester', Technology: 'Dri-FIT' } },
    highlights: ['Dri-FIT moisture-wicking fabric', 'Breathable mesh panels', 'Regular fit', 'Reflective Nike Swoosh', 'Machine washable'],
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', alt: 'Nike T-Shirt', is_primary: true },
    ]
  },
  {
    name: 'Allen Solly Men\'s Slim Fit Formal Shirt - White',
    slug: 'allen-solly-slim-formal-white',
    description: 'Crisp white formal shirt with a slim fit cut perfect for office and formal occasions.',
    short_description: 'Slim Fit, Cotton Blend, Formal',
    price: 1049, mrp: 1999, category_slug: 'fashion-men', brand: 'Allen Solly', stock_quantity: 70,
    specifications: { General: { Fit: 'Slim', Fabric: 'Cotton Blend', Collar: 'Regular', Sleeve: 'Full Sleeve' } },
    highlights: ['Premium cotton blend', 'Slim fit cut', 'Button-down collar', 'Machine washable', 'Wrinkle resistant'],
    images: [
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', alt: 'Formal shirt', is_primary: true },
    ]
  },
  {
    name: 'Adidas Ultraboost Light Running Shoes - Core Black',
    slug: 'adidas-ultraboost-light-black',
    description: 'Incredibly light and responsive. The Ultraboost Light features Light BOOST midsole technology.',
    short_description: 'Light BOOST, Continental Rubber, Primeknit',
    price: 11999, mrp: 16999, category_slug: 'fashion-men', brand: 'Adidas', stock_quantity: 40,
    specifications: { General: { Type: 'Running Shoes', Closure: 'Lace-Up', Sole: 'Continental Rubber' } },
    highlights: ['Light BOOST midsole', 'Primeknit+ upper', 'Continental Rubber outsole', '30% lighter than previous', 'Torsion System support'],
    images: [
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', alt: 'Ultraboost shoes', is_primary: true },
    ]
  },
  {
    name: 'U.S. Polo Assn. Men\'s Polo T-Shirt - Navy',
    slug: 'us-polo-mens-polo-navy',
    description: 'Classic polo t-shirt with iconic branding. Perfect for casual outings.',
    short_description: 'Regular Fit, 100% Cotton, Polo Collar',
    price: 799, mrp: 1599, category_slug: 'fashion-men', brand: 'U.S. Polo', stock_quantity: 90,
    specifications: { General: { Fit: 'Regular', Fabric: '100% Cotton', Collar: 'Polo' } },
    highlights: ['100% premium cotton', 'Classic polo design', 'Ribbed collar and cuffs', 'Side vents for comfort', 'Iconic USPA branding'],
    images: [
      { url: 'https://images.unsplash.com/photo-1625910513413-5fc421e0b417?w=600', alt: 'Polo shirt', is_primary: true },
    ]
  },

  // ========== FASHION WOMEN ==========
  {
    name: 'Libas Women\'s Cotton Anarkali Kurta - Teal Blue',
    slug: 'libas-cotton-anarkali-teal',
    description: 'Elegant teal blue Anarkali kurta in breathable cotton. Perfect for festive and everyday wear.',
    short_description: 'Anarkali, Pure Cotton, Embroidered',
    price: 899, mrp: 2499, category_slug: 'fashion-women', brand: 'Libas', stock_quantity: 60,
    specifications: { General: { Fit: 'Flared', Fabric: 'Pure Cotton', Pattern: 'Embroidered', Length: 'Calf Length' } },
    highlights: ['Pure cotton fabric', 'Beautiful thread embroidery', 'Flared Anarkali silhouette', 'Round neck with keyhole', 'Perfect for festive occasions'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600', alt: 'Anarkali kurta', is_primary: true },
    ]
  },
  {
    name: 'Nike Women\'s Air Max 270 - White/Pink',
    slug: 'nike-air-max-270-womens-white-pink',
    description: 'Inspired by the AM 180 and AM 93, the Air Max 270 delivers visible cushioning under every step.',
    short_description: 'Air Max Cushioning, Mesh Upper, Lifestyle',
    price: 10795, mrp: 14995, category_slug: 'fashion-women', brand: 'Nike', stock_quantity: 35,
    specifications: { General: { Type: 'Lifestyle Shoes', Closure: 'Lace-Up', Sole: 'Air Max 270' } },
    highlights: ['270 degrees of Air Max cushioning', 'Breathable mesh upper', 'Foam midsole', 'Rubber outsole for traction', 'Bold design statement'],
    images: [
      { url: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600', alt: 'Air Max 270', is_primary: true },
    ]
  },
  {
    name: 'Zara Women\'s Satin Midi Dress - Burgundy',
    slug: 'zara-satin-midi-dress-burgundy',
    description: 'Luxurious satin midi dress with a draped neckline. Perfect for evening events and parties.',
    short_description: 'Satin, Midi Length, Draped Neckline',
    price: 3990, mrp: 5990, category_slug: 'fashion-women', brand: 'Zara', stock_quantity: 25,
    specifications: { General: { Fit: 'Regular', Fabric: 'Satin', Length: 'Midi', Neckline: 'Draped' } },
    highlights: ['Premium satin fabric', 'Elegant draped neckline', 'Midi length', 'Side slit detail', 'Concealed zip closure'],
    images: [
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', alt: 'Satin dress', is_primary: true },
    ]
  },
  {
    name: 'W Women\'s Printed Palazzo Pants - Mustard',
    slug: 'w-printed-palazzo-mustard',
    description: 'Comfortable and stylish printed palazzo pants. Perfect pairing with kurtas and tunics.',
    short_description: 'Relaxed Fit, Viscose Rayon, Printed',
    price: 649, mrp: 1299, category_slug: 'fashion-women', brand: 'W', stock_quantity: 55,
    specifications: { General: { Fit: 'Relaxed', Fabric: 'Viscose Rayon', Pattern: 'Printed' } },
    highlights: ['Soft viscose rayon fabric', 'Relaxed wide-leg fit', 'Elasticated waistband', 'All-over print pattern', 'Machine washable'],
    images: [
      { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', alt: 'Palazzo pants', is_primary: true },
    ]
  },

  // ========== HOME & KITCHEN ==========
  {
    name: 'Prestige Iris 750W Mixer Grinder (4 Jars)',
    slug: 'prestige-iris-750w-mixer-grinder',
    description: 'Powerful 750W mixer grinder with 4 jars for all your kitchen grinding and blending needs.',
    short_description: '750W Motor, 4 Stainless Steel Jars',
    price: 3199, mrp: 5495, category_slug: 'home-kitchen', brand: 'Prestige', stock_quantity: 45,
    specifications: { General: { Wattage: '750W', 'Number of Jars': '4', 'Jar Material': 'Stainless Steel', Blades: 'Super sharp' } },
    highlights: ['Powerful 750W motor', '4 stainless steel jars', '3 speed control + pulse', 'Anti-skid feet', '2 year warranty'],
    images: [
      { url: 'https://images.unsplash.com/photo-1585237672814-8f85a8118bf6?w=600', alt: 'Mixer grinder', is_primary: true },
    ]
  },
  {
    name: 'Milton Thermosteel Flask 1000ml - Steel',
    slug: 'milton-thermosteel-flask-1000ml',
    description: 'Double-walled vacuum insulation keeps beverages hot for 24 hours and cold for 24 hours.',
    short_description: '1000ml, 24hr Hot/Cold, Leak-proof',
    price: 649, mrp: 1235, category_slug: 'home-kitchen', brand: 'Milton', stock_quantity: 80,
    specifications: { General: { Capacity: '1000 ml', Material: '18/8 Stainless Steel', Insulation: 'Double Wall Vacuum' } },
    highlights: ['24-hour hot/cold retention', 'Double wall vacuum insulation', '18/8 food-grade stainless steel', 'Leak-proof lid', 'BPA-free'],
    images: [
      { url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', alt: 'Flask', is_primary: true },
    ]
  },
  {
    name: 'Pigeon Healthifry Air Fryer 4.2L - Black',
    slug: 'pigeon-healthifry-air-fryer-4-2l',
    description: 'Cook healthier without oil. 360° high-speed air circulation for crispy results.',
    short_description: '4.2L, 1200W, 360° Air Circulation',
    price: 2999, mrp: 6495, category_slug: 'home-kitchen', brand: 'Pigeon', stock_quantity: 30,
    specifications: { General: { Capacity: '4.2L', Wattage: '1200W', Temperature: '80°C - 200°C' } },
    highlights: ['360° high-speed air circulation', 'Non-stick cooking basket', 'Adjustable temperature control', 'Timer up to 30 minutes', 'Uses 90% less oil'],
    images: [
      { url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600', alt: 'Air fryer', is_primary: true },
    ]
  },
  {
    name: 'Amazon Basics Cotton Bath Towel Set (2 Pack)',
    slug: 'amazon-basics-cotton-bath-towel-set',
    description: 'Ultra-soft 100% cotton bath towels with excellent absorbency. 500 GSM.',
    short_description: '100% Cotton, 500 GSM, 2 Pack',
    price: 599, mrp: 999, category_slug: 'home-kitchen', brand: 'Amazon Basics', stock_quantity: 100,
    specifications: { General: { Material: '100% Cotton', GSM: '500', 'Pack Size': '2' } },
    highlights: ['100% ring-spun cotton', '500 GSM plush feel', 'Highly absorbent', 'Machine washable', 'Double-stitched edges'],
    images: [
      { url: 'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=600', alt: 'Bath towels', is_primary: true },
    ]
  },

  // ========== BOOKS ==========
  {
    name: 'Atomic Habits by James Clear',
    slug: 'atomic-habits-james-clear',
    description: 'The #1 New York Times bestseller. Transform your life with tiny changes in behavior.',
    short_description: 'Paperback, Self-Help, Bestseller',
    price: 350, mrp: 699, category_slug: 'books', brand: 'Penguin', stock_quantity: 150,
    specifications: { General: { Author: 'James Clear', Publisher: 'Penguin Random House', Pages: '320', Language: 'English', Format: 'Paperback' } },
    highlights: ['#1 New York Times Bestseller', 'Practical strategies for habit formation', 'Over 15 million copies sold', 'Backed by scientific research', 'Easy and engaging read'],
    images: [
      { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600', alt: 'Atomic Habits book', is_primary: true },
    ]
  },
  {
    name: 'The Psychology of Money by Morgan Housel',
    slug: 'psychology-of-money-morgan-housel',
    description: 'Timeless lessons on wealth, greed, and happiness. Doing well with money has more to do with behavior.',
    short_description: 'Paperback, Finance, Bestseller',
    price: 299, mrp: 399, category_slug: 'books', brand: 'Jaico', stock_quantity: 120,
    specifications: { General: { Author: 'Morgan Housel', Pages: '256', Format: 'Paperback' } },
    highlights: ['19 short stories about money', 'Behavioral finance insights', 'Global bestseller', 'Easy-to-understand writing', 'Perfect for all ages'],
    images: [
      { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', alt: 'Book cover', is_primary: true },
    ]
  },
  {
    name: 'Rich Dad Poor Dad by Robert Kiyosaki',
    slug: 'rich-dad-poor-dad-robert-kiyosaki',
    description: 'The classic personal finance book that challenges the way you think about money and investing.',
    short_description: 'Paperback, Personal Finance, Classic',
    price: 299, mrp: 399, category_slug: 'books', brand: 'Plata Publishing', stock_quantity: 130,
    specifications: { General: { Author: 'Robert T. Kiyosaki', Pages: '336', Format: 'Paperback' } },
    highlights: ['Over 40 million copies sold', 'Personal finance classic', 'Changed how millions think about money', 'Asset vs liability framework', 'Financial literacy fundamentals'],
    images: [
      { url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600', alt: 'Book', is_primary: true },
    ]
  },
  {
    name: 'Ikigai: The Japanese Secret to a Long and Happy Life',
    slug: 'ikigai-japanese-secret-happy-life',
    description: 'Discover the Japanese concept of ikigai — the happiness of always being busy with purpose.',
    short_description: 'Paperback, Self-Help, Philosophy',
    price: 249, mrp: 350, category_slug: 'books', brand: 'Penguin', stock_quantity: 90,
    specifications: { General: { Author: 'Héctor García & Francesc Miralles', Pages: '208', Format: 'Paperback' } },
    highlights: ['Japanese wisdom for purposeful living', 'International bestseller', 'Research from Okinawa centenarians', 'Practical life advice', 'Beautiful and concise'],
    images: [
      { url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600', alt: 'Book', is_primary: true },
    ]
  },
  {
    name: 'Sapiens: A Brief History of Humankind by Yuval Noah Harari',
    slug: 'sapiens-brief-history-humankind',
    description: 'A groundbreaking narrative of humanitys creation and evolution — a #1 international bestseller.',
    short_description: 'Paperback, History, Non-Fiction',
    price: 399, mrp: 599, category_slug: 'books', brand: 'Vintage', stock_quantity: 75,
    specifications: { General: { Author: 'Yuval Noah Harari', Pages: '498', Format: 'Paperback' } },
    highlights: ['#1 International Bestseller', 'Covers 70,000 years of human history', 'Recommended by Bill Gates & Obama', 'Thought-provoking insights', 'Translated into 60+ languages'],
    images: [
      { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600', alt: 'Sapiens book', is_primary: true },
    ]
  },

  // ========== SPORTS ==========
  {
    name: 'Yonex Mavis 350 Nylon Shuttlecocks (Pack of 6)',
    slug: 'yonex-mavis-350-shuttlecocks-6',
    description: 'Tournament-grade nylon shuttlecocks with consistent flight and excellent durability.',
    short_description: 'Nylon, Medium Speed, Pack of 6',
    price: 599, mrp: 790, category_slug: 'sports', brand: 'Yonex', stock_quantity: 80,
    specifications: { General: { Material: 'Nylon', Speed: 'Medium', Quantity: '6' } },
    highlights: ['Similar feel to feather shuttles', 'Consistent flight path', 'High durability nylon', 'Medium speed (Green cap)', 'Ideal for practice and club play'],
    images: [
      { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600', alt: 'Shuttlecocks', is_primary: true },
    ]
  },
  {
    name: 'Nivia Storm Football (Size 5)',
    slug: 'nivia-storm-football-size-5',
    description: 'Machine-stitched football with excellent shape retention and durability. Official size 5.',
    short_description: 'Size 5, Machine Stitched, PVC',
    price: 449, mrp: 790, category_slug: 'sports', brand: 'Nivia', stock_quantity: 60,
    specifications: { General: { Size: '5', Material: 'PVC', Stitching: 'Machine', Weight: '410-450g' } },
    highlights: ['Official size and weight', 'Machine stitched for durability', 'Excellent shape retention', 'All-surface play', 'Butyl bladder for air retention'],
    images: [
      { url: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600', alt: 'Football', is_primary: true },
    ]
  },
  {
    name: 'Boldfit Yoga Mat 6mm with Carry Strap - Purple',
    slug: 'boldfit-yoga-mat-6mm-purple',
    description: 'Anti-skid, extra thick yoga mat with moisture resistance. Complete with carrying strap.',
    short_description: '6mm, Anti-skid, NBR Foam, Carry Strap',
    price: 399, mrp: 1299, category_slug: 'sports', brand: 'Boldfit', stock_quantity: 70,
    specifications: { General: { Thickness: '6mm', Material: 'NBR Foam', 'Anti-skid': 'Yes', 'Carry Strap': 'Included' } },
    highlights: ['6mm extra thick for comfort', 'Anti-skid textured surface', 'Moisture resistant NBR foam', 'Carry strap included', 'Lightweight and portable'],
    images: [
      { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600', alt: 'Yoga mat', is_primary: true },
    ]
  },
  {
    name: 'Fitbit Charge 6 Fitness Tracker - Obsidian',
    slug: 'fitbit-charge-6-obsidian',
    description: 'Advanced health and fitness tracker with built-in GPS, heart rate monitoring, and Google integration.',
    short_description: 'GPS, Heart Rate, Sleep Tracking, Google',
    price: 12999, mrp: 15999, category_slug: 'sports', brand: 'Fitbit', stock_quantity: 30,
    specifications: { General: { Display: 'AMOLED', Battery: '7 days', 'Water Resistance': '50m' }, Sensors: { 'Heart Rate': 'Yes', SpO2: 'Yes', GPS: 'Built-in', ECG: 'Yes' } },
    highlights: ['Built-in GPS tracking', 'Continuous heart rate monitoring', 'SpO2 and ECG sensors', '7-day battery life', 'Google Maps and YouTube Music', 'Sleep tracking with Sleep Score'],
    images: [
      { url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600', alt: 'Fitbit Charge', is_primary: true },
    ]
  },

  // ========== BEAUTY ==========
  {
    name: 'Maybelline Fit Me Matte Foundation - 220 Natural Beige',
    slug: 'maybelline-fit-me-matte-foundation-220',
    description: 'Oil-free matte foundation that fits skin tone and texture. Poreless finish for normal to oily skin.',
    short_description: 'Matte Finish, 30ml, Oil-Free',
    price: 399, mrp: 550, category_slug: 'beauty', brand: 'Maybelline', stock_quantity: 90,
    specifications: { General: { Shade: '220 Natural Beige', Volume: '30ml', Finish: 'Matte', 'Skin Type': 'Normal to Oily' } },
    highlights: ['Oil-free matte finish', 'Blurs pores and controls shine', 'Dermatologist tested', 'Allergy tested', 'Available in 18 shades'],
    images: [
      { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600', alt: 'Foundation', is_primary: true },
    ]
  },
  {
    name: 'Biotique Bio Morning Nectar Flawless Skin Lotion 120ml',
    slug: 'biotique-bio-morning-nectar-lotion-120ml',
    description: '100% botanical moisturizing lotion with wheatgerm, honey, and morning nectar for flawless skin.',
    short_description: '120ml, Botanical, All Skin Types',
    price: 179, mrp: 249, category_slug: 'beauty', brand: 'Biotique', stock_quantity: 100,
    specifications: { General: { Volume: '120ml', Type: 'Moisturizing Lotion', Ingredients: 'Wheatgerm, Honey, Nectar' } },
    highlights: ['100% botanical extracts', 'All skin types', 'Nourishes and moisturizes', 'SPF 30 PA++ protection', 'Cruelty-free'],
    images: [
      { url: 'https://images.unsplash.com/photo-1556228578-0d85b1a0d519?w=600', alt: 'Lotion', is_primary: true },
    ]
  },
  {
    name: 'SUGAR Cosmetics Smudge Me Not Lipstick - Cherry Margarita',
    slug: 'sugar-smudge-me-not-lipstick-cherry',
    description: 'Long-lasting liquid lipstick that stays put through meals and meetings. Matte finish.',
    short_description: 'Liquid Matte, Transfer-proof, 4.5ml',
    price: 449, mrp: 699, category_slug: 'beauty', brand: 'SUGAR', stock_quantity: 70,
    specifications: { General: { Shade: 'Cherry Margarita', Volume: '4.5ml', Finish: 'Matte', Type: 'Liquid Lipstick' } },
    highlights: ['12-hour long-lasting wear', 'Transfer-proof formula', 'Highly pigmented', 'Lightweight comfortable feel', 'Precision applicator'],
    images: [
      { url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600', alt: 'Lipstick', is_primary: true },
    ]
  },
  {
    name: 'Cetaphil Gentle Skin Cleanser 500ml',
    slug: 'cetaphil-gentle-skin-cleanser-500ml',
    description: 'Soap-free, gentle cleanser that removes surface oils, dirt, and makeup without stripping the skin.',
    short_description: '500ml, Soap-Free, All Skin Types',
    price: 699, mrp: 910, category_slug: 'beauty', brand: 'Cetaphil', stock_quantity: 65,
    specifications: { General: { Volume: '500ml', Type: 'Cleanser', 'Skin Type': 'All', Formula: 'Soap-free' } },
    highlights: ['#1 Dermatologist recommended', 'Soap-free gentle formula', 'Non-comedogenic', 'pH balanced', 'Suitable for sensitive skin'],
    images: [
      { url: 'https://images.unsplash.com/photo-1556228578-0d85b1a0d519?w=600', alt: 'Cleanser', is_primary: true },
    ]
  },

  // ========== ELECTRONICS - CAMERAS ==========
  {
    name: 'Canon EOS R50 Mirrorless Camera with RF-S 18-45mm Lens',
    slug: 'canon-eos-r50-mirrorless-18-45mm',
    description: 'Lightweight mirrorless camera with 24.2MP sensor, 4K video, and advanced autofocus.',
    short_description: '24.2MP, 4K Video, RF-S 18-45mm Lens',
    price: 62990, mrp: 72990, category_slug: 'cameras', brand: 'Canon', stock_quantity: 15,
    specifications: { General: { Sensor: '24.2MP APS-C CMOS', Video: '4K 30fps', Autofocus: 'Dual Pixel CMOS AF II', Mount: 'Canon RF' }, Display: { Type: 'Vari-angle touchscreen', Size: '3 inches' } },
    highlights: ['24.2MP APS-C sensor', '4K 30fps video recording', 'Dual Pixel CMOS AF II', 'Vari-angle touchscreen', 'Wi-Fi & Bluetooth', 'Lightweight body (375g)'],
    images: [
      { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600', alt: 'Canon camera', is_primary: true },
      { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600', alt: 'Camera angle', is_primary: false },
    ]
  },
  {
    name: 'GoPro HERO12 Black Action Camera',
    slug: 'gopro-hero12-black',
    description: 'Capture stunning 5.3K video and 27MP photos. Waterproof to 10m with HyperSmooth 6.0.',
    short_description: '5.3K Video, 27MP, Waterproof, HyperSmooth 6.0',
    price: 34990, mrp: 44990, category_slug: 'cameras', brand: 'GoPro', stock_quantity: 20,
    specifications: { General: { Video: '5.3K 60fps', Photo: '27MP', Stabilization: 'HyperSmooth 6.0', Waterproof: '10m' } },
    highlights: ['5.3K60 & 4K120 video', '27MP photos with HDR', 'HyperSmooth 6.0 stabilization', 'Waterproof to 10m', 'Enduro battery included', 'Bluetooth and Wi-Fi'],
    images: [
      { url: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600', alt: 'GoPro camera', is_primary: true },
    ]
  },

  // ========== MORE PRODUCTS FOR VARIETY ==========
  {
    name: 'Samsung 32-inch Smart LED TV - HD Ready',
    slug: 'samsung-32-inch-smart-led-tv',
    description: 'Smart TV with HD Ready display, built-in apps, and powerful speakers.',
    short_description: '32 inch, HD Ready, Smart TV',
    price: 12490, mrp: 18900, category_slug: 'electronics', brand: 'Samsung', stock_quantity: 25,
    specifications: { Display: { Size: '32 inches', Resolution: '1366 x 768 HD', Type: 'LED' }, Smart: { OS: 'Tizen', Apps: 'Netflix, YouTube, Prime' } },
    highlights: ['HD Ready 1366x768 display', 'Built-in streaming apps', 'Powerful 20W speakers', 'HDMI and USB ports', 'Remote access with SmartThings'],
    images: [
      { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600', alt: 'Samsung TV', is_primary: true },
    ]
  },
  {
    name: 'Apple AirPods Pro (2nd Generation) with USB-C',
    slug: 'apple-airpods-pro-2nd-gen-usbc',
    description: 'Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio with dynamic head tracking.',
    short_description: 'ANC, USB-C, Spatial Audio, 6hr Battery',
    price: 20990, mrp: 24900, category_slug: 'headphones', brand: 'Apple', stock_quantity: 30,
    specifications: { Audio: { ANC: 'Active Noise Cancellation', Transparency: 'Adaptive', 'Spatial Audio': 'Personalized' }, Battery: { Earbuds: '6 hours', 'With Case': '30 hours' } },
    highlights: ['Active Noise Cancellation 2x better', 'Adaptive Transparency mode', 'Personalized Spatial Audio', 'USB-C MagSafe charging case', '6 hours listening (30 with case)', 'IP54 dust and water resistant'],
    images: [
      { url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600', alt: 'AirPods Pro', is_primary: true },
    ]
  },
  {
    name: 'Fossil Gen 6 Hybrid Smartwatch - Brown Leather',
    slug: 'fossil-gen6-hybrid-smartwatch-brown',
    description: 'Classic analog design meets modern smarts. Heart rate, SpO2, notifications, and 2+ weeks battery.',
    short_description: 'Hybrid, Heart Rate, 2-week Battery, Leather',
    price: 11995, mrp: 16495, category_slug: 'electronics', brand: 'Fossil', stock_quantity: 20,
    specifications: { General: { Type: 'Hybrid Smartwatch', Display: 'E-Ink + Analog', Battery: '2+ weeks' }, Sensors: { 'Heart Rate': 'Yes', SpO2: 'Yes' } },
    highlights: ['Classic analog watch design', 'Always-on E-Ink display', 'Heart rate & SpO2 tracking', '2+ weeks battery life', 'Genuine leather strap', 'iOS and Android compatible'],
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', alt: 'Fossil watch', is_primary: true },
    ]
  },
  {
    name: 'Bombay Shaving Company Beard Grooming Kit',
    slug: 'bombay-shaving-company-beard-kit',
    description: 'Complete beard care kit with beard oil, wash, wax, and a comb. Enriched with natural ingredients.',
    short_description: 'Beard Oil, Wash, Wax & Comb Kit',
    price: 799, mrp: 1545, category_slug: 'beauty', brand: 'Bombay Shaving Co.', stock_quantity: 55,
    specifications: { General: { 'Kit Contains': 'Beard Oil, Beard Wash, Beard Wax, Beard Comb', Ingredients: 'Argan Oil, Tea Tree' } },
    highlights: ['Complete 4-piece grooming kit', 'Natural ingredients', 'Argan oil enriched beard oil', 'Tea tree beard wash', 'Handcrafted wooden comb'],
    images: [
      { url: 'https://images.unsplash.com/photo-1621607505837-5765a26a5080?w=600', alt: 'Beard kit', is_primary: true },
    ]
  },
  {
    name: 'Bajaj Majesty RX13 Oil Filled Room Heater, 11 Fins',
    slug: 'bajaj-majesty-rx13-oil-heater-11-fins',
    description: 'Oil filled radiator heater with 11 fins for uniform room heating. 3 heat settings with thermostat.',
    short_description: '2500W, 11 Fins, 3 Heat Settings, Thermostat',
    price: 8499, mrp: 13990, category_slug: 'home-kitchen', brand: 'Bajaj', stock_quantity: 3,
    specifications: { General: { Wattage: '2500W', Fins: '11', Settings: '3', 'Coverage Area': 'Up to 250 sqft' } },
    highlights: ['2500W powerful heating', '11 fins for uniform distribution', '3 heat settings + thermostat', 'Safe and silent operation', 'Castor wheels for easy movement', 'ISI certified'],
    images: [
      { url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600', alt: 'Room heater', is_primary: true },
    ]
  },
  {
    name: 'Cello Opalware Dazzle Dinner Set (35 Pcs)',
    slug: 'cello-opalware-dazzle-dinner-set-35',
    description: 'Elegant 35-piece opalware dinner set. Lightweight, chip-resistant, and microwave safe.',
    short_description: '35 Pieces, Opalware, Microwave Safe',
    price: 1899, mrp: 3999, category_slug: 'home-kitchen', brand: 'Cello', stock_quantity: 20,
    specifications: { General: { Pieces: '35', Material: 'Opalware', 'Microwave Safe': 'Yes', 'Dishwasher Safe': 'Yes' } },
    highlights: ['35-piece complete dinner set', 'Bone-ash free opalware', 'Lightweight and chip resistant', 'Microwave and dishwasher safe', 'Floral pattern design'],
    images: [
      { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600', alt: 'Dinner set', is_primary: true },
    ]
  },
  {
    name: 'Puma Men\'s Velocity Nitro 2 Running Shoes - Blue',
    slug: 'puma-velocity-nitro-2-running-blue',
    description: 'Nitrogen-infused NITRO foam delivers exceptional lightness and responsiveness for daily runs.',
    short_description: 'NITRO Foam, PUMAGRIP, Engineered Mesh',
    price: 6999, mrp: 11999, category_slug: 'sports', brand: 'Puma', stock_quantity: 35,
    specifications: { General: { Type: 'Running Shoes', Technology: 'NITRO Foam', Outsole: 'PUMAGRIP', Upper: 'Engineered Mesh' } },
    highlights: ['NITRO foam midsole', 'PUMAGRIP rubber outsole', 'Engineered mesh upper', 'Lightweight and breathable', 'Reflective elements for visibility'],
    images: [
      { url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', alt: 'Puma shoes', is_primary: true },
    ]
  },
];

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  // 1. Seed Categories
  console.log('📁 Seeding categories...');
  const categoryIdMap = new Map<string, number>();

  for (const cat of categories) {
    try {
      const result = await query(
        `INSERT INTO categories (name, slug, image_url) 
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO UPDATE SET name = $1, image_url = $3
         RETURNING id`,
        [cat.name, cat.slug, cat.image_url]
      );
      const parentId = result[0].id;
      categoryIdMap.set(cat.slug, parentId);
      console.log(`  ✅ ${cat.name} (id: ${parentId})`);

      // Seed children
      for (const child of cat.children) {
        const childResult = await query(
          `INSERT INTO categories (name, slug, parent_id, image_url) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (slug) DO UPDATE SET name = $1, parent_id = $3, image_url = $4
           RETURNING id`,
          [child.name, child.slug, parentId, child.image_url]
        );
        categoryIdMap.set(child.slug, childResult[0].id);
        console.log(`    ↳ ${child.name} (id: ${childResult[0].id})`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error seeding category ${cat.name}:`, error.message);
    }
  }

  // 2. Seed Products
  console.log('\n📦 Seeding products...');
  let productCount = 0;

  for (const product of products) {
    try {
      const categoryId = categoryIdMap.get(product.category_slug);
      if (!categoryId) {
        console.warn(`  ⚠️ Category not found for ${product.name} (${product.category_slug})`);
        continue;
      }

      // Insert product
      const result = await query(
        `INSERT INTO products (name, slug, description, short_description, price, mrp, category_id, brand, stock_quantity, specifications, highlights)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (slug) DO UPDATE SET 
           name = $1, description = $3, short_description = $4, price = $5, mrp = $6, 
           category_id = $7, brand = $8, stock_quantity = $9, specifications = $10, highlights = $11, updated_at = NOW()
         RETURNING id`,
        [
          product.name, product.slug, product.description, product.short_description,
          product.price, product.mrp, categoryId, product.brand, product.stock_quantity,
          JSON.stringify(product.specifications), product.highlights,
        ]
      );
      const productId = result[0].id;

      // Delete existing images and re-insert
      await query(`DELETE FROM product_images WHERE product_id = $1`, [productId]);

      for (let i = 0; i < product.images.length; i++) {
        const img = product.images[i];
        await query(
          `INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
           VALUES ($1, $2, $3, $4, $5)`,
          [productId, img.url, img.alt, i, img.is_primary]
        );
      }

      productCount++;
      console.log(`  ✅ ${product.name} (${product.brand})`);
    } catch (error: any) {
      console.error(`  ❌ Error seeding ${product.name}:`, error.message);
    }
  }

  console.log(`\n✅ Seeding complete! ${categoryIdMap.size} categories, ${productCount} products.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

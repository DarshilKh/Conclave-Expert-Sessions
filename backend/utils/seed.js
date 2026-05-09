import 'dotenv/config';
import mongoose from 'mongoose';
import Expert from '../models/Expert.js';

const generateSlots = () => {
  const slots = [];
  const today = new Date();

  for (let d = 1; d <= 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    for (const time of times) {
      slots.push({ date: dateStr, time, isBooked: false });
    }
  }

  return slots;
};

const experts = [
  {
    name: 'Dr. Sarah Chen',
    category: 'Business Strategy',
    title: 'Former McKinsey Principal & Startup Advisor',
    bio: 'With 18 years at McKinsey and 5 years advising Series A–C startups, Sarah specializes in organizational redesign, go-to-market strategy, and scaling operations. She has helped over 60 companies achieve sustainable growth across tech, healthcare, and retail sectors.',
    experience: 18,
    rating: 4.9,
    reviewCount: 214,
    hourlyRate: 320,
    tags: ['Growth Strategy', 'Market Entry', 'Organizational Design', 'Fundraising'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sarah-chen',
  },
  {
    name: 'Marcus Webb',
    category: 'Technology',
    title: 'CTO & Engineering Leader',
    bio: 'Marcus has built and scaled engineering teams at Google, Stripe, and two unicorn startups. His expertise spans distributed systems, platform architecture, and engineering culture. He mentors CTOs and senior engineers on technical strategy and team leadership.',
    experience: 15,
    rating: 4.8,
    reviewCount: 189,
    hourlyRate: 290,
    tags: ['System Architecture', 'Engineering Leadership', 'Distributed Systems', 'Tech Strategy'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=marcus-webb',
  },
  {
    name: 'Priya Nair',
    category: 'Finance',
    title: 'CFO Advisor & Corporate Finance Expert',
    bio: 'Priya brings 14 years of corporate finance experience from Goldman Sachs and as CFO of two public companies. She advises founders and finance teams on financial modeling, fundraising preparation, M&A due diligence, and board-level financial communication.',
    experience: 14,
    rating: 4.9,
    reviewCount: 156,
    hourlyRate: 350,
    tags: ['Financial Modeling', 'M&A', 'Fundraising', 'CFO Advisory'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=priya-nair',
  },
  {
    name: 'James Okafor',
    category: 'Marketing',
    title: 'Brand Strategist & Growth Marketer',
    bio: 'James led brand and growth at Airbnb EMEA and co-founded a digital agency serving Fortune 500 clients. He specializes in brand positioning, performance marketing, and building marketing organizations from scratch at high-growth companies.',
    experience: 12,
    rating: 4.7,
    reviewCount: 203,
    hourlyRate: 240,
    tags: ['Brand Strategy', 'Performance Marketing', 'Growth', 'B2C Marketing'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=james-okafor',
  },
  {
    name: 'Elena Vasquez',
    category: 'Legal',
    title: 'Tech & Startup Counsel',
    bio: 'Elena is a former Cooley LLP partner with 16 years specializing in startup law, venture capital transactions, IP strategy, and employment law. She has advised over 200 startups through incorporation, fundraising rounds, acquisitions, and international expansion.',
    experience: 16,
    rating: 4.8,
    reviewCount: 97,
    hourlyRate: 380,
    tags: ['Startup Law', 'VC Transactions', 'IP Strategy', 'Employment Law'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=elena-vasquez',
  },
  {
    name: 'David Park',
    category: 'Product Management',
    title: 'VP Product & Product Strategy Advisor',
    bio: 'David built product organizations at Notion, Figma, and Linear. He is passionate about product strategy, discovery frameworks, prioritization methodologies, and developing exceptional product managers. He advises product leaders at Series B to pre-IPO companies.',
    experience: 11,
    rating: 4.9,
    reviewCount: 178,
    hourlyRate: 270,
    tags: ['Product Strategy', 'Roadmapping', 'PM Coaching', 'B2B SaaS'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=david-park',
  },
  {
    name: 'Amara Diallo',
    category: 'Design',
    title: 'Design Director & UX Strategist',
    bio: 'Amara has led design at Apple, Shopify, and three venture-backed startups. She excels at building design systems, establishing design culture, and translating complex user research into elegant product experiences. She advises CPOs and design leads.',
    experience: 13,
    rating: 4.8,
    reviewCount: 145,
    hourlyRate: 260,
    tags: ['Design Systems', 'UX Strategy', 'Design Leadership', 'Product Design'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=amara-diallo',
  },
  {
    name: 'Robert Kim',
    category: 'Data Science',
    title: 'Head of Data Science & ML Engineer',
    bio: 'Robert led data science teams at Netflix and Meta before founding an AI consultancy. He specializes in machine learning strategy, data infrastructure, analytics culture, and helping companies build their first data science capabilities from the ground up.',
    experience: 10,
    rating: 4.7,
    reviewCount: 132,
    hourlyRate: 300,
    tags: ['Machine Learning', 'Data Strategy', 'AI', 'Analytics'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=robert-kim',
  },
  {
    name: 'Nina Hoffman',
    category: 'HR & Talent',
    title: 'Chief People Officer & Culture Architect',
    bio: 'Nina has built people functions at Spotify, Palantir, and multiple unicorn startups. She advises founders and HR leaders on recruiting strategy, compensation design, performance systems, DEI, and building high-performance cultures that scale.',
    experience: 14,
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 230,
    tags: ['Talent Strategy', 'Culture', 'Compensation', 'DEI', 'Recruiting'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=nina-hoffman',
  },
  {
    name: 'Thomas Andersen',
    category: 'Operations',
    title: 'COO & Operational Excellence Expert',
    bio: 'Thomas scaled operations at two logistics unicorns and served as COO of a 2,000-person SaaS company. His expertise includes supply chain optimization, operational metrics, process design, and building operating systems that support rapid headcount growth.',
    experience: 17,
    rating: 4.9,
    reviewCount: 121,
    hourlyRate: 310,
    tags: ['Operations', 'Supply Chain', 'Scaling', 'Process Design'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=thomas-andersen',
  },
  {
    name: 'Leila Moradi',
    category: 'Finance',
    title: 'Venture Finance & Investor Relations',
    bio: 'Leila spent a decade at Sequoia Capital before advising founders on VC fundraising, pitch strategy, cap table management, and investor relations. She has supported startups through $2.3B in total funding rounds across seed to Series D.',
    experience: 10,
    rating: 4.8,
    reviewCount: 167,
    hourlyRate: 340,
    tags: ['VC Fundraising', 'Pitch Strategy', 'Investor Relations', 'Cap Table'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=leila-moradi',
  },
  {
    name: 'Carlos Mendez',
    category: 'Business Strategy',
    title: 'International Expansion & GTM Specialist',
    bio: 'Carlos led international expansion for Uber and Revolut across Latin America and Southeast Asia. He advises high-growth companies entering new markets on localization strategy, regulatory navigation, partnership development, and building local teams.',
    experience: 13,
    rating: 4.7,
    reviewCount: 98,
    hourlyRate: 280,
    tags: ['International Expansion', 'GTM', 'Localization', 'Partnerships'],
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=carlos-mendez',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Expert.deleteMany({});
    console.log('Cleared existing experts');

    const expertsWithSlots = experts.map((expert) => ({
      ...expert,
      availableSlots: generateSlots(),
    }));

    await Expert.insertMany(expertsWithSlots);
    console.log(`Seeded ${expertsWithSlots.length} experts`);

    await mongoose.disconnect();
    console.log('Done. Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();

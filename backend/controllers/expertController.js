import Expert from '../models/Expert.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /experts
export const getExperts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    page = 1,
    limit = 9,
    sort = '-rating',
  } = req.query;

  const query = { isActive: true };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [experts, total] = await Promise.all([
    Expert.find(query)
      .select('-availableSlots')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Expert.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: experts,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});

// GET /experts/:id
export const getExpertById = asyncHandler(async (req, res) => {
  const expert = await Expert.findById(req.params.id).lean();

  if (!expert) {
    const error = new Error('Expert not found.');
    error.statusCode = 404;
    throw error;
  }

  // Filter out past dates from availableSlots
  const today = new Date().toISOString().split('T')[0];
  expert.availableSlots = (expert.availableSlots || []).filter(
    (slot) => slot.date >= today
  );

  // Group slots by date
  const slotsByDate = expert.availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  // Slot availability changes constantly (every booking mutates it).
  // Tell the browser, Render's edge, and Cloudflare to never cache this
  // response. Belt-and-suspenders alongside app.set('etag', false).
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');

  res.json({ success: true, data: { ...expert, slotsByDate } });
});

// GET /experts/categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Expert.distinct('category', { isActive: true });
  res.json({ success: true, data: ['All', ...categories.sort()] });
});
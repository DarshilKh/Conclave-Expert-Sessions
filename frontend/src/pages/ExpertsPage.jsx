import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fetchExperts, fetchCategories } from '../lib/api.js';
import ExpertCard from '../components/experts/ExpertCard.jsx';
import ExpertCardSkeleton from '../components/experts/ExpertCardSkeleton.jsx';
import SearchFilters from '../components/experts/SearchFilters.jsx';
import Pagination from '../components/experts/Pagination.jsx';
import { EmptyState } from '../components/ui/index.jsx';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function ExpertsPage() {
  const [experts, setExperts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', category: 'All', page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories()
      .then((r) => setCategories(r.data))
      .catch(() => {});
  }, []);

  const loadExperts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: filters.page,
        limit: 9,
        ...(filters.search && { search: filters.search }),
        ...(filters.category && filters.category !== 'All' && { category: filters.category }),
      };
      const res = await fetchExperts(params);
      setExperts(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadExperts();
  }, [loadExperts]);

  const handleFilterChange = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-[#003049] mb-1">
          Find an Expert
        </h1>
        <p className="text-[#6B7280] text-sm">
          Book a focused session with world-class practitioners across business, technology, and more.
        </p>
      </div>

      <div className="mb-7">
        <SearchFilters
          categories={categories}
          filters={filters}
          onChange={handleFilterChange}
        />
      </div>

      {!loading && !error && (
        <p className="text-xs text-[#9CA3AF] mb-5">
          {pagination.total} expert{pagination.total !== 1 ? 's' : ''} found
        </p>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 mb-6 text-sm text-red-600">
          {error} —{' '}
          <button
            onClick={loadExperts}
            className="underline hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {Array.from({ length: 9 }).map((_, i) => (
            <ExpertCardSkeleton key={i} />
          ))}
        </div>
      ) : experts.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No experts found"
          description="Try adjusting your search or removing category filters."
          action={
            <button
              onClick={() =>
                handleFilterChange({ search: '', category: 'All', page: 1 })
              }
              className="text-sm text-[#2C7F91] hover:underline"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr"
          >
            {experts.map((expert) => (
              <motion.div key={expert._id} variants={item} className="h-full">
                <ExpertCard expert={expert} />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8">
            <Pagination pagination={pagination} onChange={handlePageChange} />
          </div>
        </>
      )}
    </div>
  );
}
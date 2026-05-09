import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto px-4 py-24 text-center"
    >
      <p className="font-display text-6xl text-[#C6CADA] mb-4">404</p>
      <h1 className="text-xl font-semibold text-[#1a2332] mb-2">
        Page not found
      </h1>
      <p className="text-sm text-[#6B7280] mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#003049] text-white rounded-md hover:bg-[#023f61] transition-colors"
      >
        ← Back to Experts
      </Link>
    </motion.div>
  );
}

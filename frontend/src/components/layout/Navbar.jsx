import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/', label: 'Experts' },
  { to: '/my-bookings', label: 'My Bookings' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E8E5E1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#003049] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="3" fill="#A7BED3" />
                <path d="M7 1v2M7 11v2M1 7h2M11 7h2" stroke="#C6CADA" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-display text-lg text-[#003049] tracking-tight">
              Conclave
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-[#003049] bg-[#F2F2F2]'
                      : 'text-[#6B7280] hover:text-[#003049] hover:bg-[#F8F7F5]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

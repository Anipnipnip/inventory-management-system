import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const linkClasses = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

// Nav items are filtered by role here rather than hidden with CSS, so
// a staff account never even sees a link to a page it isn't allowed
// to open (Dashboard is admin-only, see AdminRoute.jsx).
export const Sidebar = () => {
  const { isAdmin } = useAuth();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-slate-200 bg-white">
      <div className="px-4 py-5">
        <h2 className="text-lg font-semibold text-slate-800">Inventory</h2>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {isAdmin && (
          <NavLink to="/dashboard" className={linkClasses}>
            Dashboard
          </NavLink>
        )}
        <NavLink to="/products" className={linkClasses}>
          Products
        </NavLink>
        {isAdmin && (
          <NavLink to="/categories" className={linkClasses}>
            Categories
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/suppliers" className={linkClasses}>
            Suppliers
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

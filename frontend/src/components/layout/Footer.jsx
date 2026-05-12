import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 border-b border-white/10 pb-12 mb-8">
          
          {/* Column 1: Brand & Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-1">
              <img src="/logo.png" alt="UniKart" className="h-28 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              The trusted campus marketplace for students to buy and sell second-hand items safely within university.
            </p>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <ShieldCheck className="w-4 h-4 text-[#1B8C50]" />
              <span>Verified University Students Only</span>
            </div>
          </div>
          
          {/* Column 2: Categories */}
          <div>
            <h4 className="font-semibold text-white mb-6">Categories</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/dashboard?category=Books" className="hover:text-white transition-colors">Books & Notes</Link></li>
              <li><Link to="/dashboard?category=Electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/dashboard?category=Gadgets" className="hover:text-white transition-colors">Gadgets</Link></li>
              <li><Link to="/dashboard?category=Furniture" className="hover:text-white transition-colors">Furniture</Link></li>
              <li><Link to="/dashboard?category=Hostel" className="hover:text-white transition-colors">Hostel Items</Link></li>
              <li><Link to="/dashboard?category=Clothing" className="hover:text-white transition-colors">Clothing</Link></li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Browse Products</Link></li>
              <li><Link to="/sell" className="hover:text-white transition-colors">Sell an Item</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">My Dashboard</Link></li>
              <li><Link to="/dashboard/chat" className="hover:text-white transition-colors">Messages</Link></li>
              <li><Link to="/dashboard/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>

        </div>
        
        {/* Bottom copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2024 UniKart. Campus Marketplace. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Built for students, by students 🎓</p>
        </div>
      </div>
    </footer>
  );
}

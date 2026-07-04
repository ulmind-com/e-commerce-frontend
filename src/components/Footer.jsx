import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-bold text-2xl tracking-tight text-foreground">Aura</span>
            <p className="mt-4 text-sm text-muted-foreground">
              Modern, high-quality products for everyday life. Curated with care, delivered with speed.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Categories</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">New Arrivals</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Subscribe to get special offers and updates.</p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Your email" className="rounded-lg" />
              <Button className="rounded-lg">Subscribe</Button>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 flex justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Aura E-Commerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

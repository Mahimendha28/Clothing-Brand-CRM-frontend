import React, { useState, useEffect } from "react";
import { Check, Truck, Home, User, Package, RotateCcw, Plus, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { getStoredUser } from "../utils/auth";
import Button from "../components/common/Button";

function UserDashboard() {
  const user = getStoredUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to show Skeletons
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Header section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="ui-eyebrow mb-4 opacity-70">Your Private Atelier Space</p>
          <h1 className="font-display text-5xl md:text-6xl text-primary leading-tight">
            Welcome back,<br />
            {user?.name || "Member"}.
          </h1>
          <p className="mt-4 max-w-md text-secondary leading-relaxed">
            A curated overview of your tactile journey. Your orders are being handled with artisan care.
          </p>
        </div>
        <div className="rounded-[24px] bg-input border border-soft shadow-sm p-5 md:min-w-[280px] flex items-center justify-between hover:-translate-y-1 hover:shadow-float transition-all duration-300">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Membership Status</p>
            <p className="font-display text-xl text-primary mt-1 italic">Atelier Fast-Track</p>
          </div>
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Check className="h-5 w-5" />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="space-y-10 animate-pulse">
          <div className="grid gap-10 xl:grid-cols-[1.5fr_1fr]">
             <div className="space-y-10">
                <div className="h-[400px] rounded-[32px] bg-canvas border border-soft" />
                <div className="h-[150px] rounded-[32px] bg-canvas border border-soft" />
             </div>
             <div className="h-[600px] rounded-[32px] bg-canvas border border-soft" />
          </div>
        </div>
      ) : (
      <div className="grid gap-10 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-10">
          {/* Order Summary */}
          <section>
            <div className="rounded-[32px] bg-canvas border border-soft shadow-sm p-8 hover:shadow-soft transition-shadow duration-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl text-primary">Recent Order Summary</h2>
                  <p className="text-sm text-secondary mt-1">Order #EB-94021 • Placed Today</p>
                </div>
                <span className="rounded-full bg-input border border-soft px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-sm">
                  In Transit
                </span>
              </div>

              {/* Progress Tracker Tracker */}
              <div className="relative mb-12 mt-6 px-4">
                <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-line -translate-y-1/2" />
                <div className="absolute top-1/2 left-4 w-2/3 h-[2px] bg-primary -translate-y-1/2 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                
                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center group">
                    <div className="h-10 w-10 rounded-full bg-primary text-canvas flex items-center justify-center relative z-10 shadow-sm border-[4px] border-canvas group-hover:scale-110 transition-transform">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-3">Processed</p>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="h-10 w-10 rounded-full bg-primary text-canvas flex items-center justify-center relative z-10 shadow-sm border-[4px] border-canvas group-hover:scale-110 transition-transform">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-3">Shipped</p>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="h-10 w-10 rounded-full bg-primary text-canvas flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(79,70,229,0.5)] border-[4px] border-canvas group-hover:scale-110 transition-transform">
                      <Truck className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-3">In Transit</p>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="h-10 w-10 rounded-full bg-input text-muted flex items-center justify-center relative z-10 shadow-sm border-[4px] border-canvas group-hover:scale-110 transition-transform">
                      <Home className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-3">Delivered</p>
                  </div>
                </div>
              </div>

              <div className="bg-input rounded-[16px] p-4 flex items-center justify-between shadow-sm border border-soft hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-[8px] flex flex-col justify-center items-center overflow-hidden">
                     <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-primary font-semibold">The Heritage Wool Trench</h3>
                    <p className="text-sm text-secondary">Size: M • Color: Oat Milk</p>
                  </div>
                </div>
                <Button variant="outline" className="text-sm px-6">
                  Track Package
                </Button>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="font-display text-2xl text-primary mb-6">Quick Actions</h2>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <Link to="/profile" className="bg-canvas border border-soft rounded-[24px] p-6 shadow-sm transition-all hover:shadow-float hover:-translate-y-2 block duration-300">
                <User className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-bold text-sm text-primary mb-1">Edit Profile</h3>
                <p className="text-xs text-secondary">Update account details</p>
              </Link>
              <Link to="/addresses" className="bg-canvas border border-soft rounded-[24px] p-6 shadow-sm transition-all hover:shadow-float hover:-translate-y-2 block duration-300">
                <Home className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-bold text-sm text-primary mb-1">Manage Addresses</h3>
                <p className="text-xs text-secondary">Edit, delete, and set default</p>
              </Link>
              <Link to="/my-orders" className="bg-canvas border border-soft rounded-[24px] p-6 shadow-sm transition-all hover:shadow-float hover:-translate-y-2 block duration-300">
                <Package className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-bold text-sm text-primary mb-1">Track Order</h3>
                <p className="text-xs text-secondary">Check delivery status</p>
              </Link>
              <Link to="/returns" className="bg-canvas border border-soft rounded-[24px] p-6 shadow-sm transition-all hover:shadow-float hover:-translate-y-2 block duration-300">
                <RotateCcw className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-bold text-sm text-primary mb-1">View Returns</h3>
                <p className="text-xs text-secondary">History & active returns</p>
              </Link>
            </div>
          </section>
        </div>

        {/* Wishlist */}
        <section>
           <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-primary">My Wishlist</h2>
              <Link to="/wishlist" className="text-[10px] font-bold uppercase tracking-widest text-primary underline underline-offset-4 decoration-soft hover:text-accent transition">
                View All
              </Link>
           </div>
           
           <div className="grid grid-cols-2 gap-5">
              {/* Item 1 */}
              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] bg-primary/5 rounded-[24px] border border-soft overflow-hidden mb-3 hover:shadow-float hover:-translate-y-2 transition-all duration-300">
                  <div className="absolute top-3 right-3 h-8 w-8 bg-canvas/90 backdrop-blur-sm rounded-full flex items-center justify-center text-accent shadow-sm z-10 transition-transform group-hover:scale-110">
                    <Heart className="h-4 w-4 fill-current" />
                  </div>
                  {/* Subtle bottom gradient to simulate image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end p-4"></div>
                </div>
                <h3 className="font-display text-lg text-primary font-semibold">Silk Crepe Blouse</h3>
                <p className="text-sm text-secondary font-medium">$280.00</p>
              </div>

              {/* Item 2 */}
              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] bg-primary/5 rounded-[24px] border border-soft overflow-hidden mb-3 hover:shadow-float hover:-translate-y-2 transition-all duration-300 flex flex-col justify-center items-center text-center p-4">
                  <div className="absolute top-3 right-3 h-8 w-8 bg-canvas/90 backdrop-blur-sm rounded-full flex items-center justify-center text-accent shadow-sm z-10 transition-transform group-hover:scale-110">
                    <Heart className="h-4 w-4 fill-current" />
                  </div>
                  <h1 className="font-display text-3xl opacity-20 transform -rotate-12 text-primary">Atelier<br/>Loafers</h1>
                </div>
                <h3 className="font-display text-lg text-primary font-semibold">Atelier Loafers</h3>
                <p className="text-sm text-secondary font-medium">$410.00</p>
              </div>

              {/* Add Item */}
              <div className="aspect-[3/4] rounded-[24px] border-2 border-dashed border-soft flex flex-col items-center justify-center text-muted cursor-pointer hover:bg-input hover:border-accent hover:text-accent transition-all duration-300 hover:shadow-float hover:-translate-y-2">
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Discover</span>
              </div>
           </div>
        </section>
      </div>)}
    </div>
  );
}

export default UserDashboard;

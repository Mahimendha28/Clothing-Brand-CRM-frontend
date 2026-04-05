import React from "react";
import { Check, Truck, Home, User, Package, RotateCcw, Plus, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { getStoredUser } from "../utils/auth";
import Button from "../components/common/Button";

function UserDashboard() {
  const user = getStoredUser();

  return (
    <div className="space-y-12">
      {/* Header section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="ui-eyebrow mb-4">Your Private Atelier Space</p>
          <h1 className="font-display text-5xl md:text-6xl text-ink leading-tight">
            Welcome back,<br />
            {user?.name || "Alexandra"}.
          </h1>
          <p className="mt-4 max-w-md text-secondary leading-relaxed">
            A curated overview of your tactile journey. Your orders are being handled with artisan care.
          </p>
        </div>
        <div className="rounded-card bg-[#f3deb8] p-5 md:min-w-[280px] flex items-center justify-between border border-[#e5cca0]">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8b6e45] font-bold">Membership Status</p>
            <p className="font-display text-xl text-[#5a4220] mt-1 italic">Atelier Gold Member</p>
          </div>
          <div className="h-10 w-10 bg-[#5a4220] rounded-full flex items-center justify-center text-[#f3deb8]">
            <Check className="h-5 w-5" />
          </div>
        </div>
      </section>

      <div className="grid gap-10 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-10">
          {/* Order Summary */}
          <section>
            <div className="rounded-[24px] bg-[#f2efe9] p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl text-ink">Recent Order Summary</h2>
                  <p className="text-sm text-secondary mt-1">Order #EB-94021 • Placed Oct 12</p>
                </div>
                <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-ink shadow-sm">
                  In Transit
                </span>
              </div>

              {/* Progress Tracker Tracker */}
              <div className="relative mb-12 mt-6 px-4">
                <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-[#d3ccbf] -translate-y-1/2" />
                <div className="absolute top-1/2 left-4 w-2/3 h-[2px] bg-[#75655a] -translate-y-1/2" />
                
                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-[#75655a] text-white flex items-center justify-center relative z-10 shadow-sm border-[4px] border-[#f2efe9]">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink mt-3">Processed</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-[#75655a] text-white flex items-center justify-center relative z-10 shadow-sm border-[4px] border-[#f2efe9]">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink mt-3">Shipped</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-[#75655a] text-white flex items-center justify-center relative z-10 shadow-sm border-[4px] border-[#f2efe9]">
                      <Truck className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink mt-3">In Transit</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-[#e6dfd3] text-muted flex items-center justify-center relative z-10 shadow-sm border-[4px] border-[#f2efe9]">
                      <Home className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-3">Delivered</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[16px] p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-[#2c3e50] rounded-[8px] flex flex-col justify-center items-center overflow-hidden">
                     {/* placeholder icon/image */}
                     <div className="w-8 h-8 rounded bg-[#bdc3c7] relative mt-2">
                        <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                     </div>
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-ink font-semibold">The Heritage Wool Trench</h3>
                    <p className="text-sm text-secondary">Size: M • Color: Oat Milk</p>
                  </div>
                </div>
                <Button variant="secondary" className="!bg-[#5a4220] !text-white !border-none text-sm px-6">
                  Track Package
                </Button>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="font-display text-2xl text-ink mb-6">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-5">
              <Link to="/profile" className="bg-white rounded-[20px] p-6 shadow-sm transition hover:shadow-md block">
                <User className="h-6 w-6 text-ink mb-4" />
                <h3 className="font-bold text-sm text-ink mb-1">Edit Profile</h3>
                <p className="text-xs text-secondary">Manage addresses & sizes</p>
              </Link>
              <Link to="/orders" className="bg-white rounded-[20px] p-6 shadow-sm transition hover:shadow-md block">
                <Package className="h-6 w-6 text-ink mb-4" />
                <h3 className="font-bold text-sm text-ink mb-1">Track Order</h3>
                <p className="text-xs text-secondary">Check delivery status</p>
              </Link>
              <Link to="/returns" className="bg-white rounded-[20px] p-6 shadow-sm transition hover:shadow-md block">
                <RotateCcw className="h-6 w-6 text-ink mb-4" />
                <h3 className="font-bold text-sm text-ink mb-1">View Returns</h3>
                <p className="text-xs text-secondary">History & active returns</p>
              </Link>
            </div>
          </section>
        </div>

        {/* Wishlist */}
        <section>
           <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-ink">My Wishlist</h2>
              <Link className="text-xs font-bold uppercase tracking-widest text-ink underline underline-offset-4 decoration-line hover:text-accent transition">
                View All
              </Link>
           </div>
           
           <div className="grid grid-cols-2 gap-5">
              {/* Item 1 */}
              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] bg-[#0c0c0c] rounded-[16px] overflow-hidden mb-3">
                  <div className="absolute top-3 right-3 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-sm z-10">
                    <Heart className="h-4 w-4 fill-current" />
                  </div>
                  {/* Subtle bottom gradient to simulate image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                  </div>
                </div>
                <h3 className="font-display text-lg text-ink font-semibold">Silk Crepe Blouse</h3>
                <p className="text-sm text-secondary font-medium">$280.00</p>
              </div>

              {/* Item 2 */}
              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] bg-[#f8f9fa] rounded-[16px] overflow-hidden mb-3 flex flex-col justify-center items-center text-center p-4">
                  <div className="absolute top-3 right-3 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-sm z-10">
                    <Heart className="h-4 w-4 fill-current" />
                  </div>
                  <h1 className="font-display text-3xl opacity-20 transform -rotate-12">Atelier<br/>Loafers</h1>
                </div>
                <h3 className="font-display text-lg text-ink font-semibold">Atelier Loafers</h3>
                <p className="text-sm text-secondary font-medium">$410.00</p>
              </div>

              {/* Item 3 */}
              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] bg-[#1a202c] rounded-[16px] overflow-hidden mb-3 p-4 flex flex-col items-center justify-center">
                  <div className="absolute top-3 right-3 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-sm z-10">
                    <Heart className="h-4 w-4 fill-current" />
                  </div>
                  <div className="w-16 h-16 rounded-full border border-white/20 mb-4 scale-[2]"></div>
                  <div className="border border-white/20 p-4 rounded text-white/50 text-xs text-center z-10 backdrop-blur-md">
                     Wishlist safe<br/>
                     Ion<br/>
                     to<br/>
                     for work!
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent flex items-end p-4">
                  </div>
                </div>
                <h3 className="font-display text-lg text-ink font-semibold">Cashmere Wrap</h3>
                <p className="text-sm text-secondary font-medium">$195.00</p>
              </div>

              {/* Add Item */}
              <div className="aspect-[3/4] rounded-[16px] border-2 border-dashed border-[#d3ccbf] flex flex-col items-center justify-center text-muted cursor-pointer hover:bg-white/50 hover:border-accent hover:text-accent transition">
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Add Item</span>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}

export default UserDashboard;

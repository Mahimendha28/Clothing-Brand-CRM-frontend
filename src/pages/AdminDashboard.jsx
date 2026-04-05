import React from "react";
import { Link } from "react-router-dom";
import { MoreVertical, TrendingUp, Users, ClipboardList, BoxSelect } from "lucide-react";
import Button from "../components/common/Button";

function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-4xl text-ink">Atelier Overview</h1>
          <p className="mt-2 pl-1 text-secondary text-sm">Refining the narrative of modern tactile luxury.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="bg-white">Export Data</Button>
          <Button variant="primary" className="!bg-[#6D6C6A]">Generate Report</Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-5 md:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-card bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start mb-10">
             <div className="h-10 w-10 bg-page rounded-xl flex items-center justify-center text-secondary">
               <TrendingUp className="h-5 w-5" />
             </div>
             <span className="text-[11px] font-bold bg-[#f1efe6] text-secondary px-2.5 py-1 rounded">
               +12.4%
             </span>
          </div>
          <p className="ui-eyebrow mb-2 text-[#9B9996]">Total Revenue</p>
          <h2 className="font-display text-3xl font-semibold text-ink">$412,890</h2>
        </div>

        {/* Card 2 */}
        <div className="rounded-card bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start mb-10">
             <div className="h-10 w-10 bg-page rounded-xl flex items-center justify-center text-secondary">
               <Users className="h-5 w-5" />
             </div>
             <span className="text-[11px] font-bold bg-[#f1efe6] text-secondary px-2.5 py-1 rounded">
               +5.2%
             </span>
          </div>
          <p className="ui-eyebrow mb-2 text-[#9B9996]">New Customers</p>
          <h2 className="font-display text-3xl font-semibold text-ink">1,204</h2>
        </div>

        {/* Card 3 */}
        <div className="rounded-card bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start mb-10">
             <div className="h-10 w-10 bg-page rounded-xl flex items-center justify-center text-secondary">
               <ClipboardList className="h-5 w-5" />
             </div>
             <span className="text-[11px] font-bold bg-[#fcefee] text-danger px-2.5 py-1 rounded">
               14 High Priority
             </span>
          </div>
          <p className="ui-eyebrow mb-2 text-[#9B9996]">Pending Orders</p>
          <h2 className="font-display text-3xl font-semibold text-ink">42</h2>
        </div>

        {/* Card 4 */}
        <div className="rounded-card bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start mb-10">
             <div className="h-10 w-10 bg-page rounded-xl flex items-center justify-center text-secondary">
               <BoxSelect className="h-5 w-5" />
             </div>
             <span className="text-[11px] font-bold bg-[#f3efe4] text-[#8b6e45] px-2.5 py-1 rounded">
               Optimal
             </span>
          </div>
          <p className="ui-eyebrow mb-2 text-[#9B9996]">Inventory Health</p>
          <h2 className="font-display text-3xl font-semibold text-ink">94%</h2>
        </div>
      </div>

      {/* Charts area */}
      <div className="grid gap-5 xl:grid-cols-[1.8fr_1fr]">
        <div className="rounded-card bg-[#f2ede4] p-8 min-h-[360px] flex flex-col justify-between">
           <div className="flex justify-between items-center">
             <h3 className="font-display text-xl text-ink font-semibold">Monthly Sales Revenue</h3>
             <div className="flex items-center gap-2 text-xs text-secondary font-medium">
               <div className="w-2.5 h-2.5 rounded-full bg-[#6D6C6A]"></div> Net Growth
             </div>
           </div>
           
           {/* Chart Placeholder Area (axis labels at bottom) */}
           <div className="flex justify-between items-end h-[60%] px-8 text-[11px] font-bold uppercase tracking-widest text-[#a69e92]">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
           </div>
        </div>

        <div className="rounded-card bg-[#f2ede4] p-8 flex flex-col">
           <h3 className="font-display text-xl text-ink font-semibold mb-6">Sales by Category</h3>
           
           <div className="flex-1 flex flex-col items-center justify-center">
              {/* Graphic container */}
              <div className="relative w-48 h-48 flex items-center justify-center bg-transparent mb-8">
                {/* Arrow-like geometric shape mimicking image */}
                <div className="absolute inset-0 border-[16px] border-[#e2ddd5] rounded"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-transparent"></div>
                
                {/* Arrow overlay */}
                <div className="absolute right-[-24px] top-4 bottom-4 w-12 flex flex-col justify-center items-end opacity-90">
                  <div className="h-1/2 w-4 bg-[#6D6C6A] origin-bottom-left rotate-45 transform"></div>
                  <div className="h-1/2 w-4 bg-[#6D6C6A] origin-top-left -rotate-45 transform"></div>
                </div>

                <div className="text-center z-10">
                   <p className="font-display text-3xl font-bold text-ink">72%</p>
                   <p className="text-[9px] uppercase tracking-widest font-bold text-[#86837e]">Atelier Line</p>
                </div>
              </div>

              {/* Legend */}
              <div className="w-full space-y-3">
                 <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-[#aaa49b]"></div>
                       <span className="text-ink">Ready-to-Wear</span>
                    </div>
                    <span className="font-bold text-ink">42%</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-[#6D6C6A]"></div>
                       <span className="text-ink">Leather Goods</span>
                    </div>
                    <span className="font-bold text-ink">30%</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-[#dedbd6]"></div>
                       <span className="text-ink">Archive Sale</span>
                    </div>
                    <span className="font-bold text-ink">28%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="font-display text-2xl font-semibold text-ink">Recent Orders</h3>
           <Link to="/admin/orders" className="text-sm font-medium text-secondary hover:text-ink">View Archive</Link>
        </div>

        <div className="bg-white rounded-[20px] overflow-hidden shadow-sm border border-line">
          <table className="ui-table w-full">
            <thead className="bg-[#fcf8f3]">
              <tr>
                <th className="py-5">Order ID</th>
                <th className="py-5">Customer</th>
                <th className="py-5">Date</th>
                <th className="py-5 text-right">Amount</th>
                <th className="py-5">Status</th>
                <th className="py-5"></th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr className="hover:bg-page transition-colors">
                <td className="py-5 font-medium">#EB-89422</td>
                <td className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-line flex items-center justify-center text-xs font-bold text-secondary">CS</div>
                    <span className="font-medium text-ink">Clarissa Sterling</span>
                  </div>
                </td>
                <td className="py-5 text-secondary text-sm font-medium">Oct 24, 2024</td>
                <td className="py-5 font-bold text-ink text-right">$1,240.00</td>
                <td className="py-5">
                   <span className="bg-[#f0d8b4] text-[#8b6e45] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Shipped</span>
                </td>
                <td className="py-5 text-right"><MoreVertical className="h-5 w-5 text-muted hover:text-ink cursor-pointer inline-block" /></td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-page transition-colors">
                <td className="py-5 font-medium">#EB-89421</td>
                <td className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-line flex items-center justify-center text-xs font-bold text-secondary">MD</div>
                    <span className="font-medium text-ink">Marcus DuPont</span>
                  </div>
                </td>
                <td className="py-5 text-secondary text-sm font-medium">Oct 24, 2024</td>
                <td className="py-5 font-bold text-ink text-right">$890.00</td>
                <td className="py-5">
                   <span className="bg-[#e4dfd8] text-[#75655a] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Processing</span>
                </td>
                <td className="py-5 text-right"><MoreVertical className="h-5 w-5 text-muted hover:text-ink cursor-pointer inline-block" /></td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-page transition-colors">
                <td className="py-5 font-medium border-b-0">#EB-89419</td>
                <td className="py-5 border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-line flex items-center justify-center text-xs font-bold text-secondary">HL</div>
                    <span className="font-medium text-ink">Helena Laurent</span>
                  </div>
                </td>
                <td className="py-5 text-secondary text-sm font-medium border-b-0">Oct 23, 2024</td>
                <td className="py-5 font-bold text-ink text-right border-b-0">$3,420.00</td>
                <td className="py-5 border-b-0">
                   <span className="bg-[#dcf0d9] text-[#558250] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Paid</span>
                </td>
                <td className="py-5 text-right border-b-0"><MoreVertical className="h-5 w-5 text-muted hover:text-ink cursor-pointer inline-block" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

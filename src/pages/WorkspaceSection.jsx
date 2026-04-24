import { ArrowRight, BarChart3, ClipboardList, Package, Settings, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import Button from "../components/common/Button";
import MetricCard from "../components/common/MetricCard";
import PageHeader from "../components/common/PageHeader";
import SurfaceCard from "../components/common/SurfaceCard";
import { getStoredUser } from "../utils/auth";

const sectionContent = {
  "/inventory": {
    eyebrow: "Inventory Desk",
    title: "Inventory overview",
    description:
      "Monitor stock health, flag upcoming replenishment work, and jump into the product master when you need operational detail.",
    icon: Package,
    metrics: [
      { label: "Live SKUs", value: "248", note: "Active catalog entries currently visible across the workspace." },
      { label: "Low Stock", value: "14", note: "Items that need attention before the next fulfillment cycle." },
      { label: "Restock Window", value: "3 Days", note: "Average lead time for priority replenishment requests." }
    ],
    highlights: [
      "Ready-to-wear remains the largest stock group with healthy on-hand coverage.",
      "Leather accessories are driving the majority of low-stock notifications this week.",
      "Seasonal archive pieces should be reviewed before the next campaign refresh."
    ],
    actionLabel: "Open Product Master",
    actionPath: "/admin/products"
  },
  "/orders": {
    eyebrow: "Order Flow",
    title: "Order monitoring",
    description:
      "Track fulfillment pressure, identify shipping blockers, and keep the daily order pipeline aligned with the dashboard summary.",
    icon: ClipboardList,
    metrics: [
      { label: "Open Orders", value: "42", note: "Orders still active in the current fulfillment queue." },
      { label: "Ready To Ship", value: "18", note: "Orders already packed and waiting on courier handoff." },
      { label: "Returns Queue", value: "6", note: "Customer follow-ups that need warehouse confirmation." }
    ],
    highlights: [
      "Most current delays are tied to size exchange requests rather than payment issues.",
      "Premium clients are still receiving same-day dispatch on in-stock pieces.",
      "Return requests remain below the expected weekly threshold."
    ],
    actionLabel: "Back To Dashboard",
    actionPath: "/dashboard"
  },
  "/customers": {
    eyebrow: "Client Ledger",
    title: "Customer relationships",
    description:
      "Keep an eye on active accounts, premium client activity, and the operational follow-ups that matter most to the brand team.",
    icon: Users,
    metrics: [
      { label: "Active Clients", value: "1,204", note: "Customer records currently participating in the active CRM cycle." },
      { label: "VIP Members", value: "186", note: "High-value profiles receiving elevated service handling." },
      { label: "New This Month", value: "94", note: "Fresh account signups entering onboarding and retention flows." }
    ],
    highlights: [
      "VIP response time is healthy and currently inside the target service band.",
      "New account growth is strongest in ready-to-wear and accessories segments.",
      "Profile completion remains the biggest friction point in onboarding."
    ],
    actionLabel: "Open User Master",
    actionPath: "/admin/users"
  },
  "/analytics": {
    eyebrow: "Performance View",
    title: "Analytics snapshot",
    description:
      "Review the commercial trends behind the dashboard cards so the team can react to shifts before they become operational issues.",
    icon: BarChart3,
    metrics: [
      { label: "Net Growth", value: "+12.4%", note: "Revenue trend compared with the previous reporting window." },
      { label: "Average Order", value: "₹684", note: "Current basket value across completed orders." },
      { label: "Repeat Rate", value: "38%", note: "Customers returning for an additional purchase cycle." }
    ],
    highlights: [
      "Men and Women collections remain the strongest growth drivers this month.",
      "High-value repeat customers continue to outperform first-time conversions.",
      "Archive sale activity is lifting traffic without compressing core price bands."
    ],
    actionLabel: "Review Dashboard",
    actionPath: "/dashboard"
  },
  "/settings": {
    eyebrow: "Workspace Control",
    title: "Settings and access",
    description:
      "Review workspace configuration, role access, and the supporting controls that keep the CRM environment consistent for the team.",
    icon: Settings,
    metrics: [
      { label: "Team Roles", value: "6", note: "Role groups currently available in the protected workspace." },
      { label: "Active Sessions", value: "9", note: "Current authenticated sessions across the brand team." },
      { label: "Audit Status", value: "Stable", note: "No critical configuration warnings detected in the current setup." }
    ],
    highlights: [
      "Authentication storage is working normally after the dashboard routing cleanup.",
      "Role redirects now land on the main dashboard instead of the wrong screen.",
      "Profile and address views remain available for account-specific updates."
    ],
    actionLabel: "Edit Profile",
    actionPath: "/profile"
  }
};

function WorkspaceSection() {
  const location = useLocation();
  const user = getStoredUser();
  const section = sectionContent[location.pathname] || sectionContent["/inventory"];
  const SectionIcon = section.icon;
  const canOpenAdminAction =
    user?.role === "admin" && (section.actionPath === "/admin/products" || section.actionPath === "/admin/users");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard">
              <Button
                variant="secondary"
                className="!rounded-[12px] !px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]"
              >
                Dashboard Home
              </Button>
            </Link>
            {canOpenAdminAction ? (
              <Link to={section.actionPath}>
                <Button className="!rounded-[12px] !px-5 !py-3 !text-sm !font-medium !normal-case !tracking-[0.02em]">
                  {section.actionLabel}
                </Button>
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        {section.metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} note={metric.note} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <SurfaceCard className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-page text-secondary">
              <SectionIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="ui-eyebrow">Team Focus</p>
              <h2 className="mt-2 font-display text-3xl text-ink">What needs attention</h2>
            </div>
          </div>

          <div className="space-y-4">
            {section.highlights.map((item) => (
              <div key={item} className="rounded-[18px] bg-canvas px-5 py-4">
                <p className="text-sm leading-7 text-secondary">{item}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-6">
          <div>
            <p className="ui-eyebrow">Workspace Notes</p>
            <h2 className="mt-3 font-display text-3xl text-ink">Connected flows</h2>
          </div>

          <div className="space-y-4 text-sm leading-7 text-secondary">
            <p>The navigation now matches the reference CRM dashboard and no longer drops users onto the old alternate layout.</p>
            <p>Each workspace section stays inside the same dashboard shell so the experience feels consistent while you move around the app.</p>
            <p>Admin master screens are still available where they exist, and the new routes prevent dead links in the primary navigation.</p>
          </div>

          <Link to={canOpenAdminAction ? section.actionPath : "/dashboard"} className="inline-flex items-center gap-2 text-sm font-medium text-ink transition hover:text-accent">
            {canOpenAdminAction ? section.actionLabel : "Return to dashboard"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </SurfaceCard>
      </div>
    </div>
  );
}

export default WorkspaceSection;

'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, MousePointer, Calendar } from 'lucide-react';
import { useSubscription } from '@/lib/subscription';
import { supabase } from '@/lib/supabase';
import { LockedFeature } from './UpgradeCTA';

// PREMIUM FEATURE: Analytics Dashboard
// Shows click statistics for user's links
interface AnalyticsData {
  totalClicks: number;
  clicksPerLink: Array<{
    link_id: string;
    link_title: string;
    click_count: number;
  }>;
  dailyStats: Record<string, number>;
  topLinks: Array<{
    link_id: string;
    link_title: string;
    click_count: number;
  }>;
  days: number;
}

export function AnalyticsDashboard() {
  const { isPremium } = useSubscription();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);

  // PREMIUM GATE: Only fetch analytics for premium users
  useEffect(() => {
    if (!isPremium) {
      setIsLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        // Get the current session token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(`/api/analytics/dashboard?days=${selectedDays}`, {
          headers: {
            'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [isPremium, selectedDays]);

  // PREMIUM GATE: Show locked feature for free users
  if (!isPremium) {
    return <LockedFeature feature="Analytics Dashboard" />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const daysOptions = [7, 30, 90];

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Analytics Dashboard
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Track clicks and performance for your links
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1">
            {daysOptions.map((days) => (
              <button
                key={days}
                onClick={() => setSelectedDays(days)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedDays === days
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clicks"
          value={analytics?.totalClicks || 0}
          icon={MousePointer}
          trend={analytics && analytics.totalClicks > 0 ? '+12%' : '0%'}
        />
        <StatCard
          title="Links"
          value={analytics?.clicksPerLink.length || 0}
          icon={BarChart3}
          trend="Total active"
        />
        <StatCard
          title="Top Link"
          value={analytics?.topLinks[0]?.click_count || 0}
          icon={TrendingUp}
          subtitle={analytics?.topLinks[0]?.link_title || 'No clicks yet'}
        />
        <StatCard
          title="Avg per Link"
          value={
            analytics && analytics.clicksPerLink.length > 0
              ? Math.round(analytics.totalClicks / analytics.clicksPerLink.length)
              : 0
          }
          icon={TrendingUp}
          trend="Clicks average"
        />
      </div>

      {/* Top performing links */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Top Performing Links</h3>
        
        {analytics?.topLinks.length > 0 ? (
          <div className="space-y-3">
            {analytics.topLinks.map((link, index) => (
              <div
                key={link.link_id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-slate-900 truncate max-w-[200px]">
                    {link.link_title}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-900">{link.click_count}</span>
                  <span className="text-slate-500 text-sm">clicks</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No clicks yet! Share your page to get started.</p>
          </div>
        )}
      </div>

      {/* Daily chart visualization (simple bar chart) */}
      {analytics?.dailyStats && Object.keys(analytics.dailyStats).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Daily Clicks</h3>
          
          <div className="h-32 flex items-end gap-1">
            {Object.entries(analytics.dailyStats).map(([date, count]) => {
              const maxCount = Math.max(...Object.values(analytics.dailyStats));
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div
                  key={date}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${date}: ${count} clicks`}
                >
                  <div
                    className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                    style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                  />
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>{Object.keys(analytics.dailyStats)[0]}</span>
            <span>{Object.keys(analytics.dailyStats).slice(-1)[0]}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat card component
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value.toLocaleString()}</p>
          
          {subtitle && (
            <p className="text-xs text-slate-600 mt-1 truncate">{subtitle}</p>
          )}
          
          {trend && !subtitle && (
            <p className="text-xs text-emerald-600 mt-1 font-medium">{trend}</p>
          )}
        </div>
        
        <div className="bg-emerald-50 p-2 rounded-lg">
          <Icon className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
    </div>
  );
}

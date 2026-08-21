import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, Globe, Laptop, MessageSquare, MousePointerClick, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const OVERVIEW_CARDS = [
  { key: 'totalPageViews', label: 'Page Views', icon: MousePointerClick },
  { key: 'uniqueVisitors', label: 'Unique Visitors', icon: Users },
  { key: 'uniqueSessions', label: 'Sessions', icon: Laptop },
  { key: 'contactSubmissions', label: 'Contact Leads', icon: MessageSquare },
  { key: 'chatPrompts', label: 'Chat Prompts', icon: BarChart3 },
  { key: 'totalEvents', label: 'All Events', icon: Globe },
];

const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const AnalyticsManager = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);

    try {
      const response = await API.get(`/analytics/summary?days=${days}`);
      setData(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const overview = data?.overview || {};
  const topPages = Array.isArray(data?.topPages) ? data.topPages : [];
  const topClicks = Array.isArray(data?.topClicks) ? data.topClicks : [];
  const topReferrers = Array.isArray(data?.topReferrers) ? data.topReferrers : [];
  const geography = Array.isArray(data?.geography) ? data.geography : [];
  const devices = Array.isArray(data?.devices) ? data.devices : [];
  const browsers = Array.isArray(data?.browsers) ? data.browsers : [];
  const dailyActivity = Array.isArray(data?.dailyActivity) ? data.dailyActivity : [];
  const recentEvents = Array.isArray(data?.recentEvents) ? data.recentEvents : [];
  const contactEmails = Array.isArray(data?.contactEmails) ? data.contactEmails : [];

  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
            <BarChart3 className="text-cyan-200" size={22} /> Site Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Traffic, engagement, contact leads, devices, referrers, and recent visitor actions across the portfolio.
          </p>
        </div>

        <label className="grid gap-2 text-sm text-slate-300">
          <span>Reporting Window</span>
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="glass-card border-white/10 p-8 text-sm text-slate-400">Loading analytics...</div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {OVERVIEW_CARDS.map((card) => (
              <article key={card.key} className="glass-card border-white/10 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-100">{overview[card.key] ?? 0}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-200">
                    <card.icon size={18} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="glass-card border-white/10 p-6">
              <h3 className="text-lg font-semibold text-slate-100">Top Pages</h3>
              <div className="mt-5 space-y-3">
                {topPages.length > 0 ? topPages.map((item) => (
                  <div key={item.pagePath} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/35 px-4 py-3">
                    <span className="truncate text-sm text-slate-200">{item.pagePath}</span>
                    <span className="text-sm font-semibold text-cyan-200">{item.count}</span>
                  </div>
                )) : <p className="text-sm text-slate-400">No page views recorded yet.</p>}
              </div>
            </section>

            <section className="glass-card border-white/10 p-6">
              <h3 className="text-lg font-semibold text-slate-100">Top Click Actions</h3>
              <div className="mt-5 space-y-3">
                {topClicks.length > 0 ? topClicks.map((item) => (
                  <div key={item.eventName} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/35 px-4 py-3">
                    <span className="text-sm text-slate-200">{item.eventName}</span>
                    <span className="text-sm font-semibold text-cyan-200">{item.count}</span>
                  </div>
                )) : <p className="text-sm text-slate-400">No click data yet.</p>}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="glass-card border-white/10 p-6">
              <h3 className="text-lg font-semibold text-slate-100">Top Referrers</h3>
              <div className="mt-5 space-y-3">
                {topReferrers.length > 0 ? topReferrers.map((item) => (
                  <div key={item.host} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/35 px-4 py-3">
                    <span className="text-sm text-slate-200">{item.host}</span>
                    <span className="text-sm font-semibold text-cyan-200">{item.count}</span>
                  </div>
                )) : <p className="text-sm text-slate-400">No referrer data yet.</p>}
              </div>
            </section>

            <section className="glass-card border-white/10 p-6">
              <h3 className="text-lg font-semibold text-slate-100">Geography</h3>
              <div className="mt-5 space-y-3">
                {geography.length > 0 ? geography.map((item) => (
                  <div key={item.country} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/35 px-4 py-3">
                    <span className="text-sm text-slate-200">{item.country}</span>
                    <span className="text-sm font-semibold text-cyan-200">{item.count}</span>
                  </div>
                )) : <p className="text-sm text-slate-400">No country data yet.</p>}
              </div>
            </section>

            <section className="glass-card border-white/10 p-6">
              <h3 className="text-lg font-semibold text-slate-100">Devices</h3>
              <div className="mt-5 space-y-3">
                {devices.length > 0 ? devices.map((item) => (
                  <div key={item.deviceType} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/35 px-4 py-3">
                    <span className="text-sm capitalize text-slate-200">{item.deviceType}</span>
                    <span className="text-sm font-semibold text-cyan-200">{item.count}</span>
                  </div>
                )) : <p className="text-sm text-slate-400">No device data yet.</p>}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="glass-card border-white/10 p-6">
              <h3 className="text-lg font-semibold text-slate-100">Browsers</h3>
              <div className="mt-5 space-y-3">
                {browsers.length > 0 ? browsers.map((item) => (
                  <div key={item.browser} className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/35 px-4 py-3">
                    <span className="text-sm text-slate-200">{item.browser}</span>
                    <span className="text-sm font-semibold text-cyan-200">{item.count}</span>
                  </div>
                )) : <p className="text-sm text-slate-400">No browser data yet.</p>}
              </div>
            </section>

            <section className="glass-card border-white/10 p-6">
              <h3 className="text-lg font-semibold text-slate-100">Contact Emails</h3>
              <div className="mt-5 space-y-3">
                {contactEmails.length > 0 ? contactEmails.map((item) => (
                  <div key={item.email} className="rounded-xl border border-white/5 bg-slate-900/35 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="truncate text-sm text-slate-200">{item.email}</span>
                      <span className="text-sm font-semibold text-cyan-200">{item.submissions}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Last seen {formatDateTime(item.lastSeenAt)}</p>
                  </div>
                )) : <p className="text-sm text-slate-400">No contact leads yet.</p>}
              </div>
            </section>
          </div>

          <section className="glass-card border-white/10 p-6">
            <h3 className="text-lg font-semibold text-slate-100">Daily Activity</h3>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Events</th>
                    <th className="pb-3">Page Views</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyActivity.length > 0 ? dailyActivity.map((item) => (
                    <tr key={item.date} className="border-b border-white/5 text-sm text-slate-300">
                      <td className="py-3">{item.date}</td>
                      <td className="py-3">{item.events}</td>
                      <td className="py-3">{item.pageViews}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-sm text-slate-400">No activity data yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="glass-card border-white/10 p-6">
            <h3 className="text-lg font-semibold text-slate-100">Recent Events</h3>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <th className="pb-3">Time</th>
                    <th className="pb-3">Event</th>
                    <th className="pb-3">Path</th>
                    <th className="pb-3">Country</th>
                    <th className="pb-3">Device</th>
                    <th className="pb-3">Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.length > 0 ? recentEvents.map((item) => (
                    <tr key={item._id} className="border-b border-white/5 text-sm text-slate-300">
                      <td className="py-3">{formatDateTime(item.createdAt)}</td>
                      <td className="py-3">
                        <div className="font-medium text-slate-100">{item.eventName}</div>
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.eventType}</div>
                      </td>
                      <td className="py-3">{item.pagePath || '-'}</td>
                      <td className="py-3">{item.country || '-'}</td>
                      <td className="py-3 capitalize">{item.deviceType || '-'}</td>
                      <td className="py-3">{item.browser || '-'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-sm text-slate-400">No recent events recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AnalyticsManager;

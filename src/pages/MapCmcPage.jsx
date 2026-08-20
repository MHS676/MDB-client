import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Inline Icons
const SearchIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const MapPinIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
);

const BuildingIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
);

const LayersIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L3 12.5"/><path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L3 17.5"/></svg>
);

const RefreshIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
);

const createCustomIcon = (isSelected = false) =>
  L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${isSelected ? '#ef4444' : '#2563eb'};
        width: ${isSelected ? '18px' : '14px'};
        height: ${isSelected ? '18px' : '14px'};
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
        cursor: pointer;
        transition: all 0.2s ease;
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });

const DEFAULT_CENTER = { lat: 23.8103, lng: 90.4125 };

const MapController = ({ posts, selectedPost }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (selectedPost) {
      map.flyTo([selectedPost.displayLat, selectedPost.displayLng], 15, { duration: 1.2 });
      return;
    }

    if (posts && posts.length > 0) {
      const validPoints = posts.filter((p) => !isNaN(p.displayLat) && !isNaN(p.displayLng));
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints.map((p) => [p.displayLat, p.displayLng]));
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
      }
    }
  }, [posts, selectedPost, map]);

  return null;
};

const MapDisplay = ({ posts, selectedPost, onSelectPost }) => {
  const defaultIcon = useMemo(() => createCustomIcon(false), []);
  const selectedIcon = useMemo(() => createCustomIcon(true), []);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController posts={posts} selectedPost={selectedPost} />

        {posts.map((post) => {
          if (isNaN(post.displayLat) || isNaN(post.displayLng)) return null;

          const isSelected = selectedPost?.id === post.id;
          const companyName = post.company?.name || post.companyName || 'N/A';

          return (
            <Marker
              key={post.id || post.code || Math.random()}
              position={[post.displayLat, post.displayLng]}
              icon={isSelected ? selectedIcon : defaultIcon}
              eventHandlers={{ click: () => onSelectPost(post) }}
            >
              <Popup>
                <div className="max-w-xs p-1 text-slate-800">
                  <div className="font-bold text-sm text-slate-900">{post.name}</div>
                  <div className="text-xs font-semibold text-blue-600 mt-0.5">Code: {post.code || 'N/A'}</div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <BuildingIcon className="w-3 h-3" />
                    {companyName}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    <strong>Address:</strong> {post.address || 'Not provided'}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

const MapCmcPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:5000/posts');
        if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
        const data = await res.json();

        if (!cancelled) {
          const rawPosts = Array.isArray(data) ? data : [];

          const coordCounts = {};
          const processed = rawPosts.map((post) => {
            const rawLat = parseFloat(post.latitude);
            const rawLng = parseFloat(post.longitude);

            const lat = !isNaN(rawLat) ? rawLat : DEFAULT_CENTER.lat;
            const lng = !isNaN(rawLng) ? rawLng : DEFAULT_CENTER.lng;

            const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
            coordCounts[key] = (coordCounts[key] || 0) + 1;
            const index = coordCounts[key] - 1;

            if (index === 0) {
              return { ...post, displayLat: lat, displayLng: lng };
            }

            const angle = index * 0.5;
            const radius = 0.003 * Math.sqrt(index);
            return {
              ...post,
              displayLat: lat + radius * Math.cos(angle),
              displayLng: lng + radius * Math.sin(angle),
            };
          });

          setPosts(processed);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error fetching posts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Dynamically extract company names OR fallback to predefined companies
  const companies = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => {
      const compName = p.company?.name || p.companyName;
      if (compName) set.add(compName.trim());
    });

    const extracted = Array.from(set);
    return extracted.length > 0 ? extracted : ['Falcon Security Limited', 'Robi'];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const query = searchQuery.toLowerCase().trim();
      const compName = (post.company?.name || post.companyName || '').trim().toLowerCase();

      const matchesSearch =
        !query ||
        post.name?.toLowerCase().includes(query) ||
        post.code?.toLowerCase().includes(query) ||
        post.address?.toLowerCase().includes(query);

      // Match by exact company name or fallback code pattern if nested company object is missing
      let matchesCompany = selectedCompany === 'ALL';
      if (!matchesCompany) {
        const target = selectedCompany.toLowerCase();
        if (compName) {
          matchesCompany = compName === target;
        } else if (target.includes('falcon')) {
          matchesCompany = post.code?.startsWith('POST-');
        } else if (target.includes('robi')) {
          matchesCompany = !post.code?.startsWith('POST-');
        }
      }

      return matchesSearch && matchesCompany;
    });
  }, [posts, searchQuery, selectedCompany]);

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
    setSelectedPost(null);
  };

  return (
    <section className="space-y-4 max-w-7xl mx-auto p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Interactive Location Map</h2>
            <p className="text-sm text-slate-500">Live post search & geographic monitoring system</p>
          </div>
          <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
            {filteredPosts.length} of {posts.length} Posts Displayed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Post Name, Code, or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="relative z-10">
            <BuildingIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedCompany}
              onChange={handleCompanyChange}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer appearance-auto"
            >
              <option value="ALL">All Companies ({posts.length})</option>
              {companies.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 h-[600px] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <LayersIcon className="w-4 h-4 text-blue-600" /> Search Results
            </span>
            {selectedPost && (
              <button
                onClick={() => setSelectedPost(null)}
                className="text-[11px] font-semibold text-rose-600 hover:underline"
              >
                Reset Zoom
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No matching posts found for this company.
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isSelected = selectedPost?.id === post.id;
                return (
                  <div
                    key={post.id || post.code || Math.random()}
                    onClick={() => setSelectedPost(post)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-900 truncate">{post.name}</div>
                    <div className="text-[11px] font-medium text-blue-600 mt-0.5">Code: {post.code || 'N/A'}</div>
                    {post.address && (
                      <div className="text-[11px] text-slate-500 truncate mt-1 flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3 text-slate-400 shrink-0" />
                        {post.address}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden h-[600px] relative">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-50 gap-2">
              <RefreshIcon className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Loading Post Coordinates...</span>
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center text-rose-500 bg-slate-50 text-sm">
              Error: {error}
            </div>
          ) : (
            <MapDisplay posts={filteredPosts} selectedPost={selectedPost} onSelectPost={setSelectedPost} />
          )}
        </div>
      </div>
    </section>
  );
};

export default MapCmcPage;
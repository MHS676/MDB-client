import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Light mode blue marker pin
const createCustomIcon = () =>
  L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: #2563eb;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.35);
        cursor: pointer;
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });

const DEFAULT_CENTER = { lat: 23.8103, lng: 90.4125 };

// Geographic dictionary for Bangladesh cities, districts, and areas
const LOCATION_DICTIONARY = [
  { keywords: ['jessore', 'jashore'], lat: 23.1634, lng: 89.2182 },
  { keywords: ['chittagong', 'chatogram'], lat: 22.3569, lng: 91.7832 },
  { keywords: ['sylhet'], lat: 24.8949, lng: 91.8687 },
  { keywords: ['narayanganj'], lat: 23.6238, lng: 90.5000 },
  { keywords: ['gazipur'], lat: 23.9999, lng: 90.4203 },
  { keywords: ['khulna'], lat: 22.8456, lng: 89.5403 },
  { keywords: ['rajshahi'], lat: 24.3745, lng: 88.6042 },
  { keywords: ['rangpur'], lat: 25.7439, lng: 89.2752 },
  { keywords: ['barisal', 'barishal'], lat: 22.7010, lng: 90.3535 },
  { keywords: ['comilla', 'cumilla'], lat: 23.4607, lng: 91.1809 },
  { keywords: ['bogura', 'bogra'], lat: 24.8481, lng: 89.3730 },
  { keywords: ['cox', 'coxs bazar'], lat: 21.4272, lng: 92.0058 },
  { keywords: ['feni'], lat: 23.0159, lng: 91.3976 },
  { keywords: ['noakhali'], lat: 22.8696, lng: 91.0993 },
  { keywords: ['tangail'], lat: 24.2513, lng: 89.9167 },
  { keywords: ['pabna'], lat: 24.0129, lng: 89.2568 },
  { keywords: ['kushtia'], lat: 23.9013, lng: 89.1204 },
  { keywords: ['faridpur'], lat: 23.6071, lng: 89.8426 },
  { keywords: ['mymensingh'], lat: 24.7471, lng: 90.4203 },
  
  // Dhaka Specific Zones
  { keywords: ['dhanmondi'], lat: 23.7461, lng: 90.3742 },
  { keywords: ['gulshan'], lat: 23.7925, lng: 90.4078 },
  { keywords: ['banani'], lat: 23.7937, lng: 90.4066 },
  { keywords: ['uttara'], lat: 23.8759, lng: 90.3795 },
  { keywords: ['mirpur'], lat: 23.8069, lng: 90.3687 },
  { keywords: ['baridhara'], lat: 23.8068, lng: 90.4156 },
  { keywords: ['motijheel'], lat: 23.7330, lng: 90.4172 },
  { keywords: ['mohakhali'], lat: 23.7778, lng: 90.4055 },
  { keywords: ['savar'], lat: 23.8583, lng: 90.2667 },
  { keywords: ['tejgaon'], lat: 23.7597, lng: 90.3900 },
];

// Helper to resolve lat/lng from text address
const getCoordinatesFromAddress = (addressStr) => {
  if (!addressStr || typeof addressStr !== 'string') return DEFAULT_CENTER;
  const cleanAddr = addressStr.toLowerCase();

  for (const item of LOCATION_DICTIONARY) {
    if (item.keywords.some((kw) => cleanAddr.includes(kw))) {
      return { lat: item.lat, lng: item.lng };
    }
  }

  return DEFAULT_CENTER;
};

// Auto-adjust map zoom bounds to encompass all resolved address pins
const RecenterMap = ({ posts }) => {
  const map = useMap();

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const bounds = L.latLngBounds(
      posts.map((p) => [p.displayLat, p.displayLng])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [posts, map]);

  return null;
};

// Map Display Component
const MapDisplay = ({ posts, center }) => {
  const customIcon = useMemo(() => createCustomIcon(), []);

  return (
    <div className="w-full h-[600px] relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={7}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap posts={posts} />

        {posts.map((post) => (
          <Marker
            key={post.id}
            position={[post.displayLat, post.displayLng]}
            icon={customIcon}
          >
            <Popup>
              <div className="max-w-xs p-1 text-slate-800">
                <div className="font-bold text-sm text-slate-900">{post.name || 'Post'}</div>
                {post.code && (
                  <div className="text-xs font-semibold text-blue-600 mt-0.5">
                    Code: {post.code}
                  </div>
                )}
                <div className="text-xs text-slate-600 mt-1">
                  <strong>Address:</strong> {post.address || 'Address not provided'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Resolved Pin: {post.displayLat.toFixed(4)}, {post.displayLng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// Main Page Component
const MapCmcPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

          // Map address text to coordinates & apply dispersion for posts in the same city
          const coordCounts = {};
          const processedPosts = rawPosts.map((post) => {
            const resolved = getCoordinatesFromAddress(post.address);
            
            const key = `${resolved.lat.toFixed(3)}_${resolved.lng.toFixed(3)}`;
            coordCounts[key] = (coordCounts[key] || 0) + 1;
            const index = coordCounts[key] - 1;

            if (index === 0) {
              return {
                ...post,
                displayLat: resolved.lat,
                displayLng: resolved.lng,
              };
            }

            // Radial spiral dispersion for posts sharing the same city address
            const angle = index * 0.5;
            const radius = 0.003 * Math.sqrt(index);

            return {
              ...post,
              displayLat: resolved.lat + radius * Math.cos(angle),
              displayLng: resolved.lng + radius * Math.sin(angle),
            };
          });

          setPosts(processedPosts);
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

  const center = useMemo(() => {
    if (posts.length === 0) return DEFAULT_CENTER;
    const sum = posts.reduce(
      (acc, p) => ({
        lat: acc.lat + p.displayLat,
        lng: acc.lng + p.displayLng,
      }),
      { lat: 0, lng: 0 }
    );
    return { lat: sum.lat / posts.length, lng: sum.lng / posts.length };
  }, [posts]);

  return (
    <section className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Map CMC</h2>
            <p className="text-sm text-slate-500">
              Address-based live map ({posts.length} posts mapped)
            </p>
          </div>
          <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Interactive Map • {posts.length} Posts Active
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-300">
          {loading ? (
            <div className="w-full h-[600px] flex items-center justify-center text-slate-500 bg-slate-50">
              Resolving post addresses...
            </div>
          ) : error ? (
            <div className="w-full h-[600px] flex items-center justify-center text-rose-500 bg-slate-50">
              Error: {error}
            </div>
          ) : (
            <MapDisplay posts={posts} center={center} />
          )}
        </div>
      </div>
    </section>
  );
};

export default MapCmcPage;
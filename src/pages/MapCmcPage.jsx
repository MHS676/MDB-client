import React from 'react';

const MAP_CENTER = {
  lat: 22.3569,
  lon: 91.7832,
};

const MapCmcPage = () => {
  const { lat, lon } = MAP_CENTER;

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.03}%2C${lat - 0.02}%2C${lon + 0.03}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lon}`;
  const openStreetMapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`;

  return (
    <section className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Map CMC</h2>
            <p className="text-sm text-slate-500">Live location view for CMC area</p>
          </div>
          <a
            href={openStreetMapLink}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-amber-600 hover:text-amber-700"
          >
            Open full map ↗
          </a>
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-200">
          <iframe
            title="Map CMC"
            src={mapSrc}
            className="w-full h-[560px]"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default MapCmcPage;

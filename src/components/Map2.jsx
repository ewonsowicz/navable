import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MAP_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Syne:wght@700;800&display=swap');
  .navable-wrapper * { box-sizing: border-box; }
  .navable-wrapper { margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #0e1117;
  }

  .navable-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #0e1117;
    color: #f0f0f0;
  }

  .navable-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    background: #0e1117;
    border-bottom: 1px solid #1e2330;
    z-index: 10;
    flex-shrink: 0;
  }

  .navable-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
    letter-spacing: -0.5px;
    color: #f0f0f0;
  }

  .navable-logo span { color: #4af0a8; }

  .navable-tagline {
    font-size: 0.78rem;
    color: #6b7280;
    margin-left: 4px;
    font-weight: 500;
    letter-spacing: 0.3px;
  }

  .navable-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .navable-sidebar {
    width: 320px;
    flex-shrink: 0;
    background: #13181f;
    border-right: 1px solid #1e2330;
    display: flex;
    flex-direction: column;
    padding: 20px 16px;
    gap: 16px;
    overflow-y: auto;
  }

  .sidebar-section-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #4af0a8;
    margin-bottom: 8px;
  }

  .mode-toggle {
    display: flex;
    gap: 20px;
    margin-bottom: 12px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #1a2030;
    border: 1px solid #252d3d;
    border-radius: 10px;
    padding: 10px 12px;
    transition: border-color 0.2s;
  }

  .input-row:focus-within { border-color: #4af0a8; }

  .input-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot-start { background: #4af0a8; }
  .dot-end { background: #f97316; }

  .input-row input {
    background: transparent;
    border: none;
    outline: none;
    color: #f0f0f0;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    width: 100%;
  }

  .input-row input::placeholder { color: #4b5563; }

  .route-btn {
    background: #4af0a8;
    color: #0e1117;
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    letter-spacing: 0.2px;
  }

  .route-btn:hover { background: #2ee895; transform: translateY(-1px); }
  .route-btn:active { transform: translateY(0); }
  .route-btn:disabled { background: #1e2d26; color: #3d5c4a; cursor: not-allowed; transform: none; }

  .toggle-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: #1a2030;
    border-radius: 10px;
    border: 1px solid #252d3d;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .toggle-row:hover { border-color: #4af0a8; }
  .toggle-label { font-size: 0.85rem; color: #c9d1e0; }

  .toggle-switch {
    width: 36px;
    height: 20px;
    background: #252d3d;
    border-radius: 10px;
    position: relative;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .toggle-switch.on { background: #4af0a8; }

  .toggle-switch::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    background: white;
    border-radius: 50%;
    top: 3px;
    left: 3px;
    transition: left 0.2s;
  }

  .toggle-switch.on::after { left: 19px; }

  .route-summary {
    background: #1a2030;
    border: 1px solid #252d3d;
    border-radius: 10px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .summary-stat { display: flex; justify-content: space-between; font-size: 0.84rem; }
  .summary-stat-label { color: #6b7280; }
  .summary-stat-value { color: #f0f0f0; font-weight: 600; }

  .summary-warning {
    font-size: 0.8rem;
    color: #fbbf24;
    background: #2a1e0a;
    border-radius: 7px;
    padding: 8px 10px;
  }

  .map-container { flex: 1; position: relative; }

  #navable-map { width: 100%; height: 100%; }

  .map-badge {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: #0e1117cc;
    border: 1px solid #252d3d;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 0.75rem;
    color: #6b7280;
    backdrop-filter: blur(6px);
    z-index: 999;
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    background: #0e1117cc;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
    flex-direction: column;
    gap: 12px;
  }

  .loading-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid #1e2330;
    border-top-color: #4af0a8;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-text { font-size: 0.85rem; color: #6b7280; }

  @keyframes spin { to { transform: rotate(360deg); } }

  .leaflet-container { height: 100%; }
  .leaflet-map-pane,
  .leaflet-tile-pane,
  .leaflet-tile-container,
  .leaflet-tile { margin: 0; padding: 0; }

  .directions-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 220px;
    overflow-y: auto;
  }

  .direction-step {
    display: flex;
    gap: 10px;
    padding: 8px 10px;
    background: #1a2030;
    border-radius: 8px;
    font-size: 0.8rem;
    align-items: flex-start;
  }

  .step-number { color: #4af0a8; font-weight: 700; flex-shrink: 0; width: 16px; }
  .step-info { display: flex; flex-direction: column; gap: 2px; }
  .step-instruction { color: #e0e0e0; }
  .step-meta { color: #6b7280; font-size: 0.75rem; }
`;

const DEFAULT_CENTER = [40.7128, -74.006];
const DEFAULT_ZOOM = 13;

function decodeValhallaPolyline(encoded) {
  let index = 0,
    lat = 0,
    lng = 0;
  const coords = [];
  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    coords.push([lat / 1e6, lng / 1e6]);
  }
  return coords;
}

function formatManeuver(type, modifier) {
  if (!type) return "Continue straight";
  const mod = modifier ? ` ${modifier}` : "";
  const map = {
    depart: "Start",
    arrive: "You have arrived",
    turn: `Turn${mod}`,
    "new name": `Continue${mod} onto`,
    continue: `Continue${mod}`,
    merge: `Merge${mod}`,
    roundabout: "Enter the roundabout",
    exit_roundabout: "Exit the roundabout",
    fork: `Take the${mod} fork`,
    "end of road": `At the end of the road, turn${mod}`,
    uturn: "Make a U-turn",
  };
  return map[type] || `Head ${modifier || "straight"}`;
}

export default function Map() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markerLayerRef = useRef(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mode, setMode] = useState("foot");
  const [loadingMsg, setLoadingMsg] = useState("Finding the fastest route...");
  const [overlays, setOverlays] = useState({
    elevators: true,
    ramps: true,
    kerbs: false,
    barriers: true,
  });

  useEffect(() => {
    if (mapInstanceRef.current) return;
    const map = L.map("navable-map", {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: '© <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      },
    ).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  async function geocode(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (!data.length) throw new Error(`Could not find "${address}"`);
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }

  async function getWalkingRoute(startCoords, endCoords) {
    const body = {
      locations: [
        { lon: startCoords[1], lat: startCoords[0] },
        { lon: endCoords[1], lat: endCoords[0] },
      ],
      costing: "pedestrian",
      directions_options: { units: "miles" },
    };
    const res = await fetch("https://valhalla1.openstreetmap.de/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Walking routing failed — try again");
    const data = await res.json();
    if (!data.trip) throw new Error("No walking route found");

    const leg = data.trip.legs[0];
    const coords = decodeValhallaPolyline(leg.shape);
    const distance = data.trip.summary.length;
    const duration = Math.round(distance * 20);
    const directions =
      leg.maneuvers?.map((m) => ({
        instruction: m.instruction || formatManeuver(m.type, m.modifier),
        distance: m.length?.toFixed(2) || "0.00",
      })) || [];

    return {
      coords,
      distance: distance.toFixed(2),
      duration,
      steps: leg.maneuvers?.length || 0,
      directions,
    };
  }

  async function getDrivingRoute(startCoords, endCoords) {
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Driving routing failed");
    const data = await res.json();
    if (data.code !== "Ok") throw new Error("No driving route found");

    const route = data.routes[0];
    const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const leg = route.legs[0];
    const distance = (route.distance / 1609.34).toFixed(2);
    const duration = Math.round(route.duration / 60);
    const directions =
      leg.steps
        ?.filter((s) => s.maneuver?.type !== "new name")
        .map((step) => ({
          instruction: `${formatManeuver(step.maneuver?.type, step.maneuver?.modifier)}${step.name ? " on " + step.name : ""}`,
          distance: (step.distance / 1609.34).toFixed(2),
        })) || [];

    return { coords, distance, duration, steps: directions.length, directions };
  }

  async function fetchAccessibilityData(bounds, activeOverlays) {
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
    const queries = [];
    if (activeOverlays.elevators)
      queries.push(`node["highway"="elevator"](${bbox});`);
    if (activeOverlays.ramps)
      queries.push(`node["ramp:wheelchair"="yes"](${bbox});`);
    if (activeOverlays.kerbs) queries.push(`node["kerb"="lowered"](${bbox});`);
    if (!queries.length) return [];

    try {
      const query = `[out:json][timeout:25];(${queries.join("")});out body;`;
      const res = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      );
      const text = await res.text();
      const data = JSON.parse(text);
      return data.elements || [];
    } catch (e) {
      console.warn("Overpass API unavailable:", e);
      return [];
    }
  }

  function makeAccessibilityIcon(type) {
    const colors = { elevator: "#4af0a8", ramp: "#60a5fa", kerb: "#fbbf24" };
    const emojis = { elevator: "🛗", ramp: "♿", kerb: "⬇" };
    return L.divIcon({
      html: `<div style="background:${colors[type] || "#4af0a8"};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #0e1117;box-shadow:0 2px 8px #0006;">${emojis[type] || "♿"}</div>`,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  function makeBarrierIcon() {
    return L.divIcon({
      html: `<div style="background:#f97316;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #0e1117;box-shadow:0 2px 8px #0006;">🚧</div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }

  async function fetchBarriers(bounds) {
    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
    const query = `
      [out:json][timeout:25];
      (
        node["barrier"="kerb"]["kerb"="raised"](${bbox});
        node["barrier"="steps"](${bbox});
        node["highway"="steps"](${bbox});
        node["barrier"="bollard"]["wheelchair"="no"](${bbox});
      );
      out body;
    `;
    try {
      const res = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      );
      const text = await res.text();
      const data = JSON.parse(text);
      return data.elements || [];
    } catch (e) {
      console.warn("Barrier fetch failed:", e);
      return [];
    }
  }

  async function handleRoute() {
    if (!from.trim() || !to.trim()) return;
    setLoading(true);
    setLoadingMsg("Finding the fastest route...");
    setTimeout(() => setLoadingMsg("Adjusting for accessibility..."), 3000);
    setRouteInfo(null);
    routeLayerRef.current.clearLayers();
    markerLayerRef.current.clearLayers();

    try {
      const [startCoords, endCoords] = await Promise.all([
        geocode(from),
        geocode(to),
      ]);

      routeLayerRef.current.addLayer(
        L.circleMarker(startCoords, {
          radius: 9,
          color: "#4af0a8",
          fillColor: "#4af0a8",
          fillOpacity: 1,
          weight: 3,
        }).bindPopup("Start"),
      );
      routeLayerRef.current.addLayer(
        L.circleMarker(endCoords, {
          radius: 9,
          color: "f97316",
          fillColor: "f97316",
          fillOpacity: 1,
          weight: 3,
        }).bindPopup("Destination"),
      );

      const result =
        mode === "foot"
          ? await getWalkingRoute(startCoords, endCoords)
          : await getDrivingRoute(startCoords, endCoords);

      const { coords, distance, duration, steps, directions } = result;

      const polyline = L.polyline(coords, {
        color: "#4af0a8",
        weight: 5,
        opacity: 0.85,
        lineJoin: "round",
        lineCap: "round",
      });
      routeLayerRef.current.addLayer(polyline);
      mapInstanceRef.current.fitBounds(polyline.getBounds(), {
        padding: [40, 40],
      });

      setRouteInfo({ distance, duration, steps, directions });

      const pois = await fetchAccessibilityData(polyline.getBounds(), overlays);
      pois.forEach((poi) => {
        const type =
          poi.tags?.highway === "elevator"
            ? "elevator"
            : poi.tags?.["ramp:wheelchair"] === "yes"
              ? "ramp"
              : "kerb";
        markerLayerRef.current.addLayer(
          L.marker([poi.lat, poi.lon], {
            icon: makeAccessibilityIcon(type),
          }).bindPopup(
            `<b>${type.charAt(0).toUpperCase() + type.slice(1)}</b><br/>${poi.tags?.name || "Accessibility feature"}`,
          ),
        );
      });
      if (overlays.barriers && mode === "foot") {
        const barriers = await fetchBarriers(polyline.getBounds());
        barriers.forEach((b) => {
          const label =
            b.tags?.highway === "steps" || b.tags?.barrier === "steps"
              ? "Steps"
              : b.tags?.kerb === "raised"
                ? "Raised curb"
                : "Barrier avoided";
          markerLayerRef.current.addLayer(
            L.marker([b.lat, b.lon], { icon: makeBarrierIcon() }).bindPopup(
              `<b>Barrier avoided</b><br/>${label}`,
            ),
          );
        });
      }
    } catch (err) {
      alert(err.message || "Something went wrong. Try different addresses.");
    } finally {
      setLoading(false);
    }
  }

  function toggleOverlay(key) {
    setOverlays((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <style>{MAP_STYLES}</style>
      <div className="navable-wrapper">
        <header className="navable-header">
          <div className="navable-logo">
            nav<span>able</span>
          </div>
          <div className="navable-tagline">Accessible routing for everyone</div>
        </header>

        <div className="navable-body">
          <aside className="navable-sidebar">
            <div>
              <div className="sidebar-section-label">Plan your route</div>
              <div className="mode-toggle">
                {["foot", "driving"].map((m) => (
                  <span
                    key={m}
                    onClick={() => setMode(m)}
                    aria-label={
                      m === "foot"
                        ? "Switch to walking mode"
                        : "Switch to driving mode"
                    }
                    role="button"
                    aria-pressed={mode === m}
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                      color: mode === m ? "#4af0a8" : "#4b5563",
                      borderBottom:
                        mode === m
                          ? "2px solid #4af0a8"
                          : "2px solid transparent",
                      paddingBottom: "2px",
                      cursor: "pointer",
                      transition: "color 0.2s, border-color 0.2s",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {m === "foot" ? "Walk" : "Drive"}
                  </span>
                ))}
              </div>
              <div className="input-group">
                <div className="input-row">
                  <div className="input-dot dot-start" />
                  <input
                    placeholder="Starting Point"
                    aria-label="Starting location"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRoute()}
                  />
                </div>
                <div className="input-row">
                  <div className="input-dot dot-end" />
                  <input
                    placeholder="Destination"
                    aria-label="Destination"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRoute()}
                  />
                </div>
                <button
                  className="route-btn"
                  aria-label="Find accessible route"
                  onClick={handleRoute}
                  disabled={loading || !from || !to}
                >
                  {loading ? "Finding route…" : "Find Accessible Route"}
                </button>
              </div>
            </div>

            <div>
              <div className="sidebar-section-label">Show on map</div>
              <div className="toggle-group">
                {[
                  { key: "elevators", label: "Elevators" },
                  { key: "ramps", label: "Ramps" },
                  { key: "kerbs", label: "Lowered curbs" },
                  ...(mode === "foot"
                    ? [{ key: "barriers", label: "Avoided barriers" }]
                    : []),
                ].map(({ key, label }) => (
                  <div
                    className="toggle-row"
                    role="switch"
                    aria-checked={overlays[key]}
                    aria-label={`Toggle ${label}`}
                    key={key}
                    onClick={() => toggleOverlay(key)}
                  >
                    <div className="toggle-label">{label}</div>
                    <div
                      className={`toggle-switch ${overlays[key] ? "on" : ""}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {routeInfo && (
              <div>
                <div className="sidebar-section-label">Route summary</div>
                <div className="route-summary">
                  <div className="summary-stat">
                    <span className="summary-stat-label">Distance</span>
                    <span className="summary-stat-value">
                      {routeInfo.distance} mi
                    </span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-label">Est. time</span>
                    <span className="summary-stat-value">
                      {routeInfo.duration} min
                    </span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-stat-label">Steps</span>
                    <span className="summary-stat-value">
                      {routeInfo.steps}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {routeInfo?.directions?.length > 0 && (
              <div>
                <div className="sidebar-section-label">Directions</div>
                <div className="directions-list">
                  {routeInfo.directions.map((step, i) => (
                    <div className="direction-step" key={i}>
                      <div className="step-number">{i + 1}</div>
                      <div className="step-info">
                        <div className="step-instruction">
                          {step.instruction}
                        </div>
                        {step.distance && (
                          <div className="step-meta">{step.distance} mi</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <div className="map-container" ref={mapRef}>
            <div
              id="navable-map"
              role="application"
              aria-label="Interactive accessibility map"
            />
            {loading && (
              <div className="loading-overlay" role="status" aria-live="polite">
                <div className="loading-spinner" />
                <div className="loading-text">{loadingMsg}</div>
              </div>
            )}
            <div className="map-badge">© OpenStreetMap · Valhalla · OSRM</div>
          </div>
        </div>
      </div>
    </>
  );
}

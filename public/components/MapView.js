// MapView Component - Restaurant map interface

function MapView({ locations }) {
  const mapNode = React.useRef(null);
  const map = React.useRef(null);
  const markers = React.useRef([]);
  const userMarker = React.useRef(null);
  const accuracyCircle = React.useRef(null);
  const [places, setPlaces] = React.useState(locations);
  const [selected, setSelected] = React.useState(locations[0]);
  const [userLocation, setUserLocation] = React.useState(null);
  const [mapStatus, setMapStatus] = React.useState("Loading live Addis Ababa restaurants...");
  const [locating, setLocating] = React.useState(false);

  const loadNearbyRestaurants = async center => {
    const [lat, lng] = center;
    const query = `
      [out:json][timeout:15];
      (
        node["amenity"="restaurant"](around:5000,${lat},${lng});
        way["amenity"="restaurant"](around:5000,${lat},${lng});
        relation["amenity"="restaurant"](around:5000,${lat},${lng});
      );
      out center 35;
    `;

    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
    const data = await response.json();
    const nextPlaces = (data.elements || [])
      .map(item => {
        const itemLat = item.lat || item.center?.lat;
        const itemLng = item.lon || item.center?.lon;
        const tags = item.tags || {};

        if (!itemLat || !itemLng || !tags.name) return null;

        return {
          name: tags.name,
          type: tags.cuisine ? `${titleCase(tags.cuisine)} restaurant` : "Restaurant",
          area: tags["addr:suburb"] || tags["addr:city"] || "Nearby",
          eta: `${Math.max(10, Math.round(distanceKm(center, [itemLat, itemLng]) * 8 + 12))}-${Math.max(18, Math.round(distanceKm(center, [itemLat, itemLng]) * 9 + 22))} min`,
          coordinates: [itemLat, itemLng],
          distance: distanceKm(center, [itemLat, itemLng])
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 18);

    if (!nextPlaces.length) {
      throw new Error("No restaurants found nearby");
    }

    setPlaces(nextPlaces);
    setSelected(nextPlaces[0]);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setMapStatus("Your browser does not support location checking.");
      return;
    }

    setLocating(true);
    setMapStatus("Checking your location...");

    navigator.geolocation.getCurrentPosition(
      async position => {
        const nextLocation = [
          position.coords.latitude,
          position.coords.longitude
        ];

        setUserLocation({
          coordinates: nextLocation,
          accuracy: position.coords.accuracy
        });

        setMapStatus("Location found. Loading restaurants around you...");
        map.current?.setView(nextLocation, 15);

        try {
          await loadNearbyRestaurants(nextLocation);
          setMapStatus("Showing restaurants near your current area.");
        } catch (error) {
          setMapStatus("Location found, but live restaurant lookup failed. Showing Addis Ababa examples.");
          setPlaces(locations);
          setSelected(locations[0]);
        } finally {
          setLocating(false);
        }
      },
      error => {
        setLocating(false);
        setMapStatus(error.code === 1
          ? "Location permission was blocked. Allow location in the browser to see your exact area."
          : "Could not detect your location. Showing Addis Ababa restaurants."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000
      }
    );
  };

  React.useEffect(() => {
    if (!mapNode.current || !window.L) return;

    map.current = L.map(mapNode.current, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView(addisCenter, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map.current);

    loadNearbyRestaurants(addisCenter)
      .then(() => setMapStatus("Showing live restaurants in Addis Ababa."))
      .catch(() => {
        setMapStatus("Live restaurant lookup failed. Showing Addis Ababa examples.");
        setPlaces(locations);
        setSelected(locations[0]);
      });

    return () => {
      markers.current.forEach(marker => marker.remove());
      userMarker.current?.remove();
      accuracyCircle.current?.remove();
      map.current?.remove();
      markers.current = [];
      userMarker.current = null;
      accuracyCircle.current = null;
      map.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!map.current || !userLocation) return;

    userMarker.current?.remove();
    accuracyCircle.current?.remove();

    const userIcon = L.divIcon({
      className: "user-location-marker",
      html: "<span></span>",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    userMarker.current = L.marker(userLocation.coordinates, { icon: userIcon })
      .addTo(map.current)
      .bindPopup("<strong>You are here</strong>");

    accuracyCircle.current = L.circle(userLocation.coordinates, {
      radius: userLocation.accuracy,
      color: "#2f6f91",
      fillColor: "#2f6f91",
      fillOpacity: 0.12,
      weight: 1
    }).addTo(map.current);
  }, [userLocation]);

  React.useEffect(() => {
    if (!map.current) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = places.map(place => {
      const marker = L.marker(place.coordinates)
        .addTo(map.current)
        .bindPopup(`<strong>${escapeHtml(place.name)}</strong><br>${escapeHtml(place.area)}<br>${escapeHtml(place.type)}<br>${escapeHtml(place.eta)}`);

      marker.on("click", () => setSelected(place));

      return marker;
    });
  }, [places]);

  React.useEffect(() => {
    if (!selected || !map.current) return;

    map.current.flyTo(selected.coordinates, 14, {
      duration: 0.7
    });

    const marker = markers.current.find(item => {
      const position = item.getLatLng();
      return position.lat === selected.coordinates[0] && position.lng === selected.coordinates[1];
    });

    marker?.openPopup();
  }, [selected]);

  return (
    React.createElement("section", null,
      React.createElement("div", { className: "section-head" },
        React.createElement("div", null,
          React.createElement("h2", null, "Restaurant Map"),
          React.createElement("p", { className: "muted" }, mapStatus)
        ),
        React.createElement("button", { className: "btn secondary", onClick: useMyLocation, disabled: locating }, locating ? "Checking..." : "Use my location")
      ),
      React.createElement("div", { className: "map-layout" },
        React.createElement("div", { className: "map-shell" },
          React.createElement("div", { className: "delivery-map", ref: mapNode })
        ),
        React.createElement("aside", { className: "panel map-panel" },
          React.createElement("h2", null, "Restaurants"),
          selected && React.createElement("div", { className: "selected-place" },
            React.createElement("span", { className: "badge" }, selected.area),
            React.createElement("h3", null, selected.name),
            React.createElement("p", { className: "muted" }, selected.type),
            React.createElement("strong", { className: "eta" }, selected.distance ? `${selected.distance.toFixed(1)} km away - ${selected.eta}` : selected.eta)
          ),
          React.createElement("div", { className: "location-list" },
            places.map(location => React.createElement("button", {
              key: location.name,
              className: `location-card ${selected?.name === location.name ? "active" : ""}`,
              onClick: () => setSelected(location)
            },
              React.createElement("strong", null, location.name),
              React.createElement("span", { className: "muted small" }, `${location.type} - ${location.area}`),
              React.createElement("span", { className: "eta" }, location.eta)
            ))
          )
        )
      )
    )
  );
}

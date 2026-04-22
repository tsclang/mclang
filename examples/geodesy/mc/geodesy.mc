// Geodesy: WGS-84 ellipsoid and great-circle calculations

R_earth = 6371000.0
a_wgs   = 6378137.0
b_wgs   = 6356752.3142
_e2     = 0.00669437999014

// Haversine great-circle distance (metres)
haversine(lat1, lon1, lat2, lon2) =
    2.0 * R_earth * arcsin(sqrt(sin(dlat/2.0)^2 + cos(lat1)*cos(lat2)*sin(dlon/2.0)^2))
    where
        dlat = lat2 - lat1
        dlon = lon2 - lon1

// Initial bearing A→B (radians, north=0, east=π/2)
bearing(lat1, lon1, lat2, lon2) =
    arctan2(sin(dlon)*cos(lat2), cos(lat1)*sin(lat2) - sin(lat1)*cos(lat2)*cos(dlon))
    where
        dlon = lon2 - lon1

// Destination latitude given start, bearing, distance
dest_lat(lat, lon, brng, dist) =
    arcsin(sin(lat)*cos(d) + cos(lat)*sin(d)*cos(brng))
    where
        d = dist / R_earth

// Destination longitude given start, bearing, distance
dest_lon(lat, lon, brng, dist) =
    lon + arctan2(sin(brng)*sin(d)*cos(lat), cos(d) - sin(lat)*sin(arcsin(sin(lat)*cos(d) + cos(lat)*sin(d)*cos(brng))))
    where
        d = dist / R_earth

// Normal radius of curvature (prime vertical) N(φ)
normal_radius(lat) =
    a_wgs / sqrt(1.0 - _e2 * sin(lat)^2)

// Meridian radius of curvature M(φ)
meridian_radius(lat) =
    a_wgs * (1.0 - _e2) / (1.0 - _e2 * sin(lat)^2)^1.5

// Geodetic (lat, lon, h) → ECEF X
ecef_x(lat, lon, h) = (normal_radius(lat) + h) * cos(lat) * cos(lon)

// Geodetic (lat, lon, h) → ECEF Y
ecef_y(lat, lon, h) = (normal_radius(lat) + h) * cos(lat) * sin(lon)

// Geodetic (lat, lon, h) → ECEF Z
ecef_z(lat, lon, h) = (normal_radius(lat) * (1.0 - _e2) + h) * sin(lat)

// Cross-track distance from great circle A→B to point P (signed, metres)
cross_track(latA, lonA, latB, lonB, latP, lonP) =
    arcsin(sin(d13 / R_earth) * sin(brg_AP - brg_AB)) * R_earth
    where
        d13    = haversine(latA, lonA, latP, lonP)
        brg_AB = bearing(latA, lonA, latB, lonB)
        brg_AP = bearing(latA, lonA, latP, lonP)

// Along-track distance from A to closest point on A→B to P (metres)
along_track(latA, lonA, latB, lonB, latP, lonP) =
    arccos(cos(d13 / R_earth) / cos(dxt / R_earth)) * R_earth
    where
        d13 = haversine(latA, lonA, latP, lonP)
        dxt = cross_track(latA, lonA, latB, lonB, latP, lonP)

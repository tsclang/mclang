#include <stdio.h>
#include <math.h>
#include "../../mc/geodesy.h"

#define DEG2RAD(d) ((d) * 3.14159265358979323846 / 180.0)
#define RAD2DEG(r) ((r) * 180.0 / 3.14159265358979323846)

int main(void) {
    /* Moscow: 55.7558°N 37.6173°E  — London: 51.5074°N 0.1278°W */
    double lat_msk = DEG2RAD(55.7558);
    double lon_msk = DEG2RAD(37.6173);
    double lat_lon = DEG2RAD(51.5074);
    double lon_lon = DEG2RAD(-0.1278);

    printf("=== Geodesy (WGS-84) ===\n");
    printf("Moscow:  %.4f°N  %.4f°E\n", RAD2DEG(lat_msk), RAD2DEG(lon_msk));
    printf("London:  %.4f°N  %.4f°E\n\n", RAD2DEG(lat_lon), RAD2DEG(lon_lon));

    double dist = haversine(lat_msk, lon_msk, lat_lon, lon_lon);
    printf("Haversine distance:  %.1f km\n", dist / 1000.0);

    double brng = bearing(lat_msk, lon_msk, lat_lon, lon_lon);
    printf("Initial bearing:     %.2f°\n\n", RAD2DEG(brng));

    /* ECEF coordinates of Moscow (h=150 m) */
    double h = 150.0;
    printf("=== ECEF (Moscow, h=%.0f m) ===\n", h);
    printf("X = %.1f m\n", ecef_x(lat_msk, lon_msk, h));
    printf("Y = %.1f m\n", ecef_y(lat_msk, lon_msk, h));
    printf("Z = %.1f m\n\n", ecef_z(lat_msk, lon_msk, h));

    /* Radii of curvature at Moscow's latitude */
    printf("=== Radii of curvature at φ=%.2f° ===\n", RAD2DEG(lat_msk));
    printf("Normal    N(φ) = %.1f m\n", normal_radius(lat_msk));
    printf("Meridian  M(φ) = %.1f m\n\n", meridian_radius(lat_msk));

    /* Destination: 500 km due north from Moscow */
    double dist_north = 500000.0;
    double brng_north = 0.0; /* north */
    printf("=== Destination: 500 km north of Moscow ===\n");
    double d_lat = dest_lat(lat_msk, lon_msk, brng_north, dist_north);
    double d_lon = dest_lon(lat_msk, lon_msk, brng_north, dist_north);
    printf("Dest lat: %.4f°\n", RAD2DEG(d_lat));
    printf("Dest lon: %.4f°\n\n", RAD2DEG(d_lon));

    /* Cross-track / along-track for a waypoint off the Moscow-London great circle */
    /* Waypoint: Helsinki 60.1699°N 24.9384°E */
    double lat_hel = DEG2RAD(60.1699);
    double lon_hel = DEG2RAD(24.9384);
    printf("=== Cross/along track: Helsinki relative to Moscow→London GC ===\n");
    double xtd = cross_track(lat_msk, lon_msk, lat_lon, lon_lon, lat_hel, lon_hel);
    double atd = along_track(lat_msk, lon_msk, lat_lon, lon_lon, lat_hel, lon_hel);
    printf("Cross-track:  %.1f km (%s)\n", fabs(xtd) / 1000.0, xtd >= 0 ? "right" : "left");
    printf("Along-track:  %.1f km\n", atd / 1000.0);

    return 0;
}

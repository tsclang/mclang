#include <stdio.h>
#include <math.h>
#include "../../mc/orbital_mechanics.h"

#define PI 3.14159265358979323846

int main(void) {
    /* ---- 1. ISS orbital data ---- */
    double R_earth = 6371000.0;      /* m */
    double alt_iss = 408000.0;       /* m */
    double a_iss   = R_earth + alt_iss;  /* semi-major axis, m */
    double e_iss   = 0.0006;

    printf("=== ISS Orbital Parameters ===\n");
    printf("Semi-major axis: %.0f km\n", a_iss / 1000.0);
    printf("Eccentricity:    %.4f\n", e_iss);

    double T_iss = period(a_iss);
    printf("Orbital period:  %.2f min  (%.2f hr)\n",
           T_iss / 60.0, T_iss / 3600.0);

    double v_circ = v_circular(a_iss);
    double v_esc  = v_escape(a_iss);
    printf("Circular speed:  %.4f km/s\n", v_circ / 1000.0);
    printf("Escape speed:    %.4f km/s\n", v_esc  / 1000.0);
    double v_iss = vis_viva(a_iss, a_iss);
    printf("Vis-viva (circ): %.4f km/s\n\n", v_iss / 1000.0);

    /* ---- 2. Kepler's equation ---- */
    double M_anom = PI / 4.0;   /* mean anomaly = 45 deg */
    double ecc    = 0.1;
    double E_anom = ecc_anomaly(M_anom, ecc);
    double nu     = true_anomaly(E_anom, ecc);

    printf("=== Kepler's Equation (e=%.1f, M=π/4) ===\n", ecc);
    printf("Eccentric anomaly E: %.6f rad  (%.2f°)\n",
           E_anom, E_anom * 180.0 / PI);
    printf("True anomaly ν:      %.6f rad  (%.2f°)\n",
           nu, nu * 180.0 / PI);
    /* Verification: E - e*sin(E) should equal M */
    printf("Verification M check: %.8f (expect %.8f)\n\n",
           E_anom - ecc * sin(E_anom), M_anom);

    /* ---- 3. Orbital positions at 8 points ---- */
    double a_orbit = 7000000.0;  /* 7000 km circular ish */
    double e_orbit = 0.05;
    printf("=== Orbital Positions (a=7000 km, e=%.2f) ===\n", e_orbit);
    printf("%-6s  %10s  %10s  %10s  %12s\n",
           "ν(deg)", "r (km)", "x (km)", "y (km)", "speed (km/s)");

    for (int k = 0; k < 8; k++) {
        double nu_k = k * PI / 4.0;
        double r_k  = orbit_radius(a_orbit, e_orbit, nu_k);
        double x_k  = orbit_x(a_orbit, e_orbit, nu_k);
        double y_k  = orbit_y(a_orbit, e_orbit, nu_k);
        double v_k  = vis_viva(r_k, a_orbit);
        printf("%-6.0f  %10.2f  %10.2f  %10.2f  %12.4f\n",
               nu_k * 180.0 / PI,
               r_k / 1000.0, x_k / 1000.0, y_k / 1000.0,
               v_k / 1000.0);
    }

    /* ---- 4. Hohmann transfer LEO → GEO ---- */
    double r_leo = 6779000.0;    /* m  (ISS altitude) */
    double r_geo = 42164000.0;   /* m  (GEO) */

    printf("\n=== Hohmann Transfer: LEO → GEO ===\n");
    printf("LEO radius: %.0f km\n", r_leo / 1000.0);
    printf("GEO radius: %.0f km\n", r_geo / 1000.0);
    printf("v_circ LEO: %.4f km/s\n", v_circular(r_leo) / 1000.0);
    printf("v_circ GEO: %.4f km/s\n", v_circular(r_geo) / 1000.0);

    double dv1 = dv1_hohmann(r_leo, r_geo);
    double dv2 = dv2_hohmann(r_leo, r_geo);
    double dvt = dv_total_hohmann(r_leo, r_geo);

    printf("Δv₁ (LEO burn):   %+.4f km/s\n", dv1 / 1000.0);
    printf("Δv₂ (GEO circ):   %+.4f km/s\n", dv2 / 1000.0);
    printf("Δv total:          %.4f km/s\n",  dvt / 1000.0);

    /* Transfer orbit semi-major axis and period */
    double a_transfer = (r_leo + r_geo) / 2.0;
    double T_transfer = period(a_transfer);
    printf("Transfer time:     %.2f hr  (half period)\n",
           T_transfer / 2.0 / 3600.0);

    return 0;
}

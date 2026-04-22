#include <stdio.h>
#include <math.h>
#include "../../mc/optics.h"

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

static double deg2rad(double d) { return d * M_PI / 180.0; }
static double rad2deg(double r) { return r * 180.0 / M_PI; }

int main(void) {
    /* ------------------------------------------------------------------ */
    /* 1. Snell's law and Fresnel reflectance: air → glass (n=1.5)        */
    /* ------------------------------------------------------------------ */
    double n_air  = 1.0;
    double n_glass = 1.5;

    printf("=== Fresnel Reflectance: air → glass (n=1.5) ===\n");
    printf("%-8s  %-8s  %-8s  %-8s  %-8s\n",
           "θ_i (°)", "θ_t (°)", "Rs", "Rp", "R_avg");
    printf("%-8s  %-8s  %-8s  %-8s  %-8s\n",
           "-------", "-------", "------", "------", "------");

    double angles[] = {0, 15, 30, 45, 56.3, 60, 75, 89};
    int na = 8;
    for (int i = 0; i < na; i++) {
        double theta_i = deg2rad(angles[i]);
        double theta_t = snell_angle(n_air, theta_i, n_glass);
        double rs = R_s(n_air, theta_i, n_glass);
        double rp = R_p(n_air, theta_i, n_glass);
        double ravg = R_unpol(n_air, theta_i, n_glass);
        printf("%-8.1f  %-8.2f  %-8.4f  %-8.4f  %-8.4f\n",
               angles[i], rad2deg(theta_t), rs, rp, ravg);
    }

    double th_B = brewster_angle(n_air, n_glass);
    printf("\nBrewster angle: %.2f°  (Rp = 0 at this angle)\n",
           rad2deg(th_B));

    /* glass → air: critical angle */
    double th_c = critical_angle(n_glass, n_air);
    printf("Critical angle (glass→air): %.2f°\n\n", rad2deg(th_c));

    /* ------------------------------------------------------------------ */
    /* 2. Young's double-slit: λ=550 nm, d=0.5 mm, L=1 m                 */
    /* ------------------------------------------------------------------ */
    double lambda  = 550e-9;  /* green light */
    double d_slit  = 0.5e-3;
    double L_screen = 1.0;
    double I0 = 1.0;

    printf("=== Young's Double-Slit (λ=550 nm, d=0.5 mm, L=1 m) ===\n");
    printf("Fringe spacing: %.3f mm\n", young_fringe_spacing(lambda, L_screen, d_slit) * 1e3);
    printf("\n%-10s  %-10s  %-10s\n", "y (mm)", "θ (μrad)", "I/I₀");
    printf("%-10s  %-10s  %-10s\n", "---------", "--------", "----");

    double ys[] = {0.0, 0.275, 0.55, 0.825, 1.10, 1.375, 1.65};
    int ny = 7;
    for (int i = 0; i < ny; i++) {
        double y = ys[i] * 1e-3;
        double theta = atan2(y, L_screen);
        double I = young_intensity(I0, d_slit, theta, lambda);
        printf("%-10.3f  %-10.1f  %-10.4f\n",
               ys[i], theta * 1e6, I);
    }

    /* ------------------------------------------------------------------ */
    /* 3. Single-slit diffraction envelope (a=0.1 mm)                     */
    /* ------------------------------------------------------------------ */
    double a_slit = 0.1e-3;
    printf("\n=== Single-Slit Diffraction (a=0.1 mm, λ=550 nm) ===\n");
    printf("%-10s  %-10s\n", "θ (mrad)", "I/I₀");
    printf("%-10s  %-10s\n", "---------", "----");
    double thetas_ss[] = {0.0, 1.375, 2.75, 4.125, 5.5, 6.875, 8.25};
    int nt = 7;
    for (int i = 0; i < nt; i++) {
        double theta = thetas_ss[i] * 1e-3;
        double I = single_slit(I0, a_slit, theta, lambda);
        printf("%-10.3f  %-10.4f\n", thetas_ss[i], I);
    }

    /* ------------------------------------------------------------------ */
    /* 4. Diffraction grating: N=500 slits, d=2 μm, λ=550 nm             */
    /* ------------------------------------------------------------------ */
    double d_grat  = 2e-6;
    double a_grat  = 0.5e-6;
    double N_slits = 500.0;
    printf("\n=== Diffraction Grating: N=500, d=2 μm, λ=550 nm ===\n");
    printf("Resolving power (1st order): %.0f\n",
           grating_resolving_power(1.0, N_slits));
    printf("Angular dispersion at θ=16°: %.4f rad/nm\n",
           grating_dispersion(1.0, d_grat, deg2rad(16.0)) * 1e-9);

    /* ------------------------------------------------------------------ */
    /* 5. Fabry-Pérot etalon: n=1.5, d=1 mm, R=0.9                       */
    /* ------------------------------------------------------------------ */
    double R_fp  = 0.9;
    double n_fp  = 1.5;
    double d_fp  = 1e-3;
    double th_fp = 0.0;

    printf("\n=== Fabry-Pérot Etalon (n=1.5, d=1 mm, R=0.90) ===\n");
    printf("Finesse:              %.1f\n",   finesse(R_fp));
    printf("FSR (λ=550 nm):       %.3f pm\n", fsr(lambda, n_fp, d_fp) * 1e12);
    printf("Spectral resolution:  %.4f pm\n", fp_resolution(lambda, n_fp, d_fp, R_fp) * 1e12);

    printf("\nTransmission vs. wavelength near λ=550 nm:\n");
    printf("%-14s  %-10s\n", "λ (nm)", "T");
    printf("%-14s  %-10s\n", "----------", "------");
    double dlambda = fsr(lambda, n_fp, d_fp);
    double lambdas[] = {0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0};
    int nl = 11;
    for (int i = 0; i < nl; i++) {
        double lam = lambda + lambdas[i] * dlambda;
        double T = fabry_perot_T(R_fp, n_fp, d_fp, th_fp, lam);
        printf("%.6f        %-10.4f\n", lam * 1e9, T);
    }

    /* ------------------------------------------------------------------ */
    /* 6. Resolution limits                                                */
    /* ------------------------------------------------------------------ */
    printf("\n=== Resolution Limits (λ=550 nm) ===\n");
    printf("Rayleigh angle (D=100 mm):  %.4f μrad\n",
           rayleigh_angle(lambda, 100e-3) * 1e6);
    printf("Abbe limit (NA=0.9):        %.1f nm\n",
           abbe_limit(lambda, 0.9) * 1e9);
    printf("Abbe limit (NA=0.1):        %.1f nm\n",
           abbe_limit(lambda, 0.1) * 1e9);

    return 0;
}

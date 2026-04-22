#include <stdio.h>
#include <math.h>
#include "../../mc/colorimetry.h"

typedef struct { double r, g, b; const char* name; } Color;

static void print_color(const Color* c) {
    double L = lab_L(c->r, c->g, c->b);
    double a = lab_a(c->r, c->g, c->b);
    double b = lab_b(c->r, c->g, c->b);
    double X = xyz_x(c->r, c->g, c->b);
    double Y = xyz_y(c->r, c->g, c->b);
    double Z = xyz_z(c->r, c->g, c->b);
    printf("%-10s  RGB(%4.2f,%4.2f,%4.2f)  XYZ(%6.4f,%6.4f,%6.4f)  Lab(%6.2f,%+6.2f,%+6.2f)\n",
           c->name, c->r, c->g, c->b, X, Y, Z, L, a, b);
}

int main(void) {
    Color colors[] = {
        {1.0, 0.0, 0.0, "Red"},
        {0.0, 1.0, 0.0, "Green"},
        {0.0, 0.0, 1.0, "Blue"},
        {1.0, 1.0, 1.0, "White"},
        {0.0, 0.0, 0.0, "Black"},
        {1.0, 1.0, 0.0, "Yellow"},
        {0.5, 0.5, 0.5, "Gray50"},
        {1.0, 0.5, 0.0, "Orange"},
    };
    int n = (int)(sizeof(colors) / sizeof(colors[0]));

    printf("=== Colorimetry: sRGB → XYZ → Lab ===\n\n");
    printf("%-10s  %-22s  %-26s  %s\n", "Name", "sRGB", "XYZ", "CIE L*a*b*");
    printf("%s\n", "---------------------------------------------------------------------"
                   "---------------------");
    for (int i = 0; i < n; i++) print_color(&colors[i]);

    printf("\n=== CIE76 ΔE* between colours ===\n");
    for (int i = 0; i < n; i++) {
        double Li = lab_L(colors[i].r, colors[i].g, colors[i].b);
        double ai = lab_a(colors[i].r, colors[i].g, colors[i].b);
        double bi = lab_b(colors[i].r, colors[i].g, colors[i].b);
        for (int j = i + 1; j < n; j++) {
            double Lj = lab_L(colors[j].r, colors[j].g, colors[j].b);
            double aj = lab_a(colors[j].r, colors[j].g, colors[j].b);
            double bj = lab_b(colors[j].r, colors[j].g, colors[j].b);
            printf("%-7s ↔ %-7s  ΔE76=%6.2f\n",
                   colors[i].name, colors[j].name,
                   delta_e76(Li, ai, bi, Lj, aj, bj));
        }
    }

    printf("\n=== WCAG Contrast Ratios ===\n");
    Color black = {0.0, 0.0, 0.0, "Black"};
    Color white = {1.0, 1.0, 1.0, "White"};
    for (int i = 0; i < n; i++) {
        double cr_b = contrast_ratio(colors[i].r, colors[i].g, colors[i].b,
                                     black.r,    black.g,    black.b);
        double cr_w = contrast_ratio(colors[i].r, colors[i].g, colors[i].b,
                                     white.r,    white.g,    white.b);
        printf("%-7s vs Black: %5.2f:1   vs White: %5.2f:1   AA-large: %s\n",
               colors[i].name, cr_b, cr_w,
               (cr_b >= 3.0 || cr_w >= 3.0) ? "PASS" : "FAIL");
    }

    printf("\n=== sRGB gamma round-trip check ===\n");
    double vals[] = {0.0, 0.04, 0.5, 0.9, 1.0};
    for (int i = 0; i < 5; i++) {
        double c = vals[i];
        double lin = srgb_to_linear(c);
        double back = linear_to_srgb(lin);
        printf("sRGB=%.2f → lin=%.6f → sRGB_back=%.6f  (err=%.2e)\n",
               c, lin, back, fabs(c - back));
    }

    return 0;
}

#include <stdio.h>
#include <math.h>
#include "../../mc/math.h"

int main(void) {
    double r = 5.0;
    double w = 4.0, h = 3.0;

    printf("=== area(r=5) — same name, different namespace ===\n");
    printf("  s2::area (circle):  %.4f\n", s2__area(r));
    printf("  s3::area (sphere):  %.4f\n", s3__area(r));

    printf("\n=== perimeter / volume (r=5) ===\n");
    printf("  s2::perimeter (circle):  %.4f\n", s2__perimeter(r));
    printf("  s3::volume    (sphere):  %.4f\n", s3__volume(r));

    printf("\n=== 2D shapes ===\n");
    printf("  rect  area(%g, %g):       %.4f\n", w, h, s2__rect_area(w, h));
    printf("  rect  perimeter(%g, %g):  %.4f\n", w, h, s2__rect_perimeter(w, h));
    printf("  triangle area(3,4,5):    %.4f\n",  s2__tri_area(3, 4, 5));

    printf("\n=== 3D shapes ===\n");
    printf("  cube  area(%g):      %.4f\n", w, s3__cube_area(w));
    printf("  cube  volume(%g):    %.4f\n", w, s3__cube_volume(w));
    printf("  cyl   area(%g,%g):   %.4f\n", r, h, s3__cyl_area(r, h));
    printf("  cyl   volume(%g,%g): %.4f\n", r, h, s3__cyl_volume(r, h));

    return 0;
}

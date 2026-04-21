#include <stdio.h>
#include <math.h>
#include "../../mc/geometry.h"

static void print_vec3(const char *label, mc_num *v, int n) {
    printf("  %s: [", label);
    for (int i = 0; i < n; i++) printf("%.3f%s", v[i], i < n-1 ? ", " : "");
    printf("]\n");
}

int main(void) {
    printf("2D geometry:\n");
    printf("  dist (0,0)→(3,4):    %.4f\n", dist2d(0, 0, 3, 4));
    printf("  dist (1,1)→(4,5):    %.4f\n", dist2d(1, 1, 4, 5));
    double rad = angle2d(1, 0, 0, 1);
    printf("  angle (1,0)∠(0,1):   %.4f rad = %.1f°\n", rad, rad * 180.0 / M_PI);
    printf("  triangle area (0,0)(4,0)(0,3): %.4f\n", triangle_area(0,0, 4,0, 0,3));

    mc_num a[] = {1.0, 2.0, 3.0};
    mc_num b[] = {4.0, 5.0, 6.0};
    printf("\n3D vectors:\n");
    printf("  dot([1,2,3],[4,5,6]):  %.1f\n", dot3(a, 3, b, 3));
    mc_num *cr = cross3(a, 3, b, 3);
    print_vec3("cross", cr, 3);
    printf("  norm([1,2,3]):         %.4f\n", len3(a, 3));

    mc_num M[] = {1.0, 2.0, 3.0,
                  4.0, 5.0, 6.0,
                  7.0, 8.0, 9.0};
    printf("\nMatrix [[1,2,3],[4,5,6],[7,8,9]]:\n");
    mc_num *col1 = matrix_col(M, 3, 3, 1);
    print_vec3("col 1", col1, 3);
    mc_num *row2 = matrix_row(M, 3, 3, 2);
    print_vec3("row 2", row2, 3);
    return 0;
}

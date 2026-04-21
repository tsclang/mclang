#include <stdio.h>
#include "../../mc/number_theory.h"

int main(void) {
    printf("GCD / LCM:\n");
    printf("  gcd(48, 18) = %.0f\n", gcd(48, 18));
    printf("  gcd(100, 75) = %.0f\n", gcd(100, 75));
    printf("  lcm(4, 6) = %.0f\n", lcm(4, 6));
    printf("  lcm(12, 15) = %.0f\n", lcm(12, 15));

    printf("\nDivisibility:\n");
    printf("  is_even(8) = %.0f\n",   is_even(8));
    printf("  is_odd(7)  = %.0f\n",   is_odd(7));
    printf("  17 div 3?  = %.0f\n",   is_divisible(17, 3));
    printf("  18 div 3?  = %.0f\n",   is_divisible(18, 3));

    printf("\nSet membership:\n");
    printf("  is_integer(3.0)  = %.0f\n", is_integer(3.0));
    printf("  is_integer(3.5)  = %.0f\n", is_integer(3.5));
    printf("  is_natural(-1.0) = %.0f\n", is_natural(-1.0));
    printf("  is_natural(5.0)  = %.0f\n", is_natural(5.0));

    printf("\nTriangular numbers T(1)..T(10):\n  ");
    for (int n = 1; n <= 10; n++) printf("%.0f ", triangular(n));
    printf("\n");

    printf("\nDigital roots:\n");
    double nums[] = {0, 1, 9, 10, 18, 19, 100, 493};
    for (int i = 0; i < 8; i++) {
        printf("  dr(%.0f) = %.0f\n", nums[i], digital_root(nums[i]));
    }
    return 0;
}

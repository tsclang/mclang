#include <stdio.h>
#include <math.h>
#include "../../mc/ballistics.h"

int main(void) {
    double v0    = 50.0;           // m/s
    double angle = M_PI / 4.0;    // 45°

    printf("Projectile: v0=%.1f m/s, angle=45°\n", v0);
    printf("  Range:          %.2f m\n",  range(v0, angle));
    printf("  Max height:     %.2f m\n",  max_height(v0, angle));
    printf("  Time of flight: %.2f s\n",  time_of_flight(v0, angle));
    printf("  Height at x=50: %.2f m\n",  height_at(v0, angle, 50.0));

    printf("\nRange vs angle (v0=50 m/s):\n");
    for (int deg = 15; deg <= 75; deg += 15) {
        double a = deg * M_PI / 180.0;
        printf("  %2d° → %.2f m\n", deg, range(v0, a));
    }
    return 0;
}

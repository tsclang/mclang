#include <stdio.h>
#include "../../mc/statistics.h"

int main(void) {
    mc_num data[] = {2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0};
    int n = 8;

    printf("Data: [2, 4, 4, 4, 5, 5, 7, 9]\n");
    printf("  Mean:    %.4f\n", avg(data, n));
    printf("  Std dev: %.4f\n", spread(data, n));
    printf("  CV:      %.2f%%\n", cv(data, n));
    printf("  Range:   %.1f\n",  data_range(data, n));

    printf("\nZ-scores:\n");
    for (int i = 0; i < n; i++) {
        printf("  %.0f → z=%.4f\n", data[i], z_score(data, n, data[i]));
    }

    printf("\nNormalized:\n");
    for (int i = 0; i < n; i++) {
        printf("  %.0f → %.4f\n", data[i], normalize(data, n, data[i]));
    }
    return 0;
}

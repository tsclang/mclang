#include <stdio.h>
#include <math.h>
#include "../../mc/linear_regression.h"

int main(void) {
    /* ---------------------------------------------------------- */
    /* 1. House price regression                                  */
    /*    x = area (m²), y = price (k€)                          */
    /* ---------------------------------------------------------- */
    double x[] = {50, 60, 70, 80, 90, 100, 110, 120};
    double y[] = {150, 180, 210, 235, 260, 285, 310, 340};
    int n = 8;

    double slope     = lr_slope(x, n, y, n, (double)n);
    double intercept = lr_intercept(x, n, y, n, (double)n);
    double r2        = r_squared(x, n, y, n, (double)n);
    double err_rmse  = rmse(x, n, y, n, (double)n);
    double r         = pearson(x, n, y, n, (double)n);

    printf("=== Linear Regression: House Prices ===\n");
    printf("Data: area (m²) vs price (k€), n=%d\n\n", n);
    printf("Slope:         %.4f k€/m²\n", slope);
    printf("Intercept:     %.4f k€\n",    intercept);
    printf("R²:            %.6f\n",       r2);
    printf("RMSE:          %.4f k€\n",    err_rmse);
    printf("Pearson r:     %.6f\n",       r);
    printf("\nPrediction for 95 m²: %.2f k€\n", lr_predict(slope, intercept, 95.0));

    /* ---------------------------------------------------------- */
    /* 2. Residuals for each data point                           */
    /* ---------------------------------------------------------- */
    printf("\n=== Residuals ===\n");
    printf("%-8s  %-8s  %-10s  %-10s\n", "Area", "Price", "Predicted", "Residual");
    printf("%-8s  %-8s  %-10s  %-10s\n", "------", "-----", "---------", "--------");
    for (int i = 0; i < n; i++) {
        double pred = lr_predict(slope, intercept, x[i]);
        double resid = y[i] - pred;
        printf("%-8.0f  %-8.0f  %-10.4f  %-10.4f\n", x[i], y[i], pred, resid);
    }

    /* ---------------------------------------------------------- */
    /* 3. Matrix normal equations: X'X (2×2) and its inverse     */
    /* X columns: [1, area_i]                                     */
    /* X'X = [[n, sum(x)], [sum(x), sum(x²)]]                    */
    /* ---------------------------------------------------------- */
    double sum_x = 0.0, sum_x2 = 0.0, sum_y = 0.0, sum_xy = 0.0;
    for (int i = 0; i < n; i++) {
        sum_x  += x[i];
        sum_x2 += x[i] * x[i];
        sum_y  += y[i];
        sum_xy += x[i] * y[i];
    }

    /* XtX stored row-major: [n, sum_x, sum_x, sum_x2]           */
    double XtX[4] = { (double)n, sum_x, sum_x, sum_x2 };
    /* XtY vector: [sum_y, sum_xy]                                */
    double XtY[2] = { sum_y, sum_xy };

    double det  = xtx_det(XtX, 2, 2);
    printf("\n=== Matrix Normal Equations (X'X) ===\n");
    printf("X'X = [[%.0f, %.0f], [%.0f, %.0f]]\n",
           XtX[0], XtX[1], XtX[2], XtX[3]);
    printf("det(X'X) = %.2f\n", det);

    /* Compute inverse via xtx_inv — returns pointer to 2x2 matrix */
    double *inv_ptr = xtx_inv(XtX, 2, 2);
    printf("(X'X)^-1 = [[%.6f, %.6f], [%.6f, %.6f]]\n",
           inv_ptr[0], inv_ptr[1], inv_ptr[2], inv_ptr[3]);

    /* Recover coefficients: beta = (X'X)^-1 X'y               */
    double beta0 = inv_ptr[0] * XtY[0] + inv_ptr[1] * XtY[1];
    double beta1 = inv_ptr[2] * XtY[0] + inv_ptr[3] * XtY[1];
    printf("Coefficients from normal equations: intercept=%.4f, slope=%.4f\n",
           beta0, beta1);
    printf("(matches direct: intercept=%.4f, slope=%.4f)\n", intercept, slope);

    return 0;
}

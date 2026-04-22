#include <stdio.h>
#include <math.h>
#include "../../mc/kalman.h"

int main(void) {
    /* ---------------------------------------------------------- */
    /* 1. Temperature sensor tracking with Kalman filter          */
    /* ---------------------------------------------------------- */
    /* Model: state = temperature, a=1 (constant), b=0, h=1       */
    /* True temp = 20°C, noisy measurements                       */
    /* q=0.001 (process noise), r=0.5 (measurement noise)         */
    /* x0=15 (initial estimate), p0=1 (initial uncertainty)       */
    /* ---------------------------------------------------------- */
    const double a = 1.0, b = 0.0, u = 0.0;
    const double h = 1.0;
    const double q = 0.001;
    const double r = 0.5;
    double x = 15.0;   /* initial state estimate */
    double p = 1.0;    /* initial error covariance */

    /* Simulated noisy measurements around true temp = 20°C       */
    double measurements[10] = {
        19.3, 20.8, 19.7, 20.5, 21.1,
        19.6, 20.2, 20.9, 19.4, 20.6
    };

    printf("=== Kalman Filter: Temperature Tracking ===\n");
    printf("True temperature: 20.0 C\n");
    printf("Initial estimate: %.1f C, p0=%.1f\n", x, p);
    printf("Model: a=%.0f, q=%.3f, r=%.1f\n\n", a, q, r);
    printf("%-5s  %-12s  %-12s  %-10s  %-12s\n",
           "Step", "Measurement", "Estimate", "Gain", "Innovation");
    printf("%-5s  %-12s  %-12s  %-10s  %-12s\n",
           "----", "-----------", "--------", "----", "----------");

    double last_z = 0.0, last_x = 0.0, last_p = 0.0;

    for (int i = 0; i < 10; i++) {
        double z = measurements[i];

        /* Predict step */
        double x_pred = kf_predict_x(x, a, u, b);
        double p_pred = kf_predict_p(p, a, q);

        /* Update step */
        double k    = kf_gain(p_pred, h, r);
        double innov = kf_innov(z, x_pred, h);
        x = kf_update_x(x_pred, k, z, h);
        p = kf_update_p(p_pred, k, h);

        printf("%-5d  %-12.4f  %-12.4f  %-10.4f  %-12.4f\n",
               i + 1, z, x, k, innov);

        last_z = z; last_x = x; last_p = p;
    }

    /* 2. NIS for last step */
    double nis = kf_nis(last_z, last_x, h, last_p, r);
    printf("\nNIS (last step): %.4f  (chi^2 dof=1 => 95%% bounds [0.004, 5.024])\n", nis);

    /* 3. SNR for last estimate vs measurement noise */
    double snr = snr_db(last_x, last_z - last_x);
    printf("SNR (estimate vs residual): %.2f dB\n", snr);

    /* ---------------------------------------------------------- */
    /* 4. Complementary filter example                            */
    /* ---------------------------------------------------------- */
    printf("\n=== Complementary Filter (IMU fusion) ===\n");
    double gyro_rate  = 0.1;   /* rad/s */
    double accel_angle = 0.5;  /* rad */
    double alpha      = 0.98;
    double dt         = 0.01;  /* s */
    double prev       = 0.0;

    printf("gyro_rate=%.2f rad/s, accel=%.2f rad, alpha=%.2f, dt=%.3f s\n\n",
           gyro_rate, accel_angle, alpha, dt);
    printf("%-5s  %-12s\n", "Step", "Angle (rad)");
    printf("%-5s  %-12s\n", "----", "-----------");

    for (int i = 0; i < 5; i++) {
        prev = comp_filter(prev, gyro_rate, accel_angle, alpha, dt);
        printf("%-5d  %-12.6f\n", i + 1, prev);
    }

    /* comp_tau: crossover frequency period */
    double T_cross = 1.0;  /* 1 second crossover */
    double tau = comp_tau(dt, T_cross);
    printf("\nalpha from comp_tau(dt=%.3f, T=%.1f): %.4f\n", dt, T_cross, tau);

    return 0;
}

#include <stdio.h>
#include <math.h>
#include "../../mc/pid_control.h"

int main(void) {
    /* Step response simulation: first-order plant G(s) = 1/(τs+1), τ=1 s
       Setpoint r=1.0, Kp=2.0, Ki=1.0, Kd=0.1, dt=0.05 s                 */
    double Kp = 2.0, Ki = 1.0, Kd = 0.1;
    double dt = 0.05;
    double tau_plant = 1.0;      /* plant time constant */
    double r = 1.0;              /* setpoint */

    double y = 0.0;              /* plant output */
    double integral = 0.0;
    double e_prev = r - y;
    double e_prev2 = e_prev;

    printf("=== PID Step-Response Simulation ===\n");
    printf("Kp=%.1f  Ki=%.1f  Kd=%.2f  dt=%.3f s  setpoint=%.1f\n\n",
           Kp, Ki, Kd, dt, r);
    printf("%-8s %-10s %-10s %-10s %-10s\n", "t(s)", "y(out)", "e(err)", "u(ctrl)", "integral");
    printf("%s\n", "-----------------------------------------------------------");

    for (int step = 0; step <= 120; step++) {
        double t = step * dt;
        double e = r - y;

        /* Anti-windup clamped integral */
        integral = pid_integral_clamped(Ki, e_prev, e, integral, dt, -2.0, 2.0);

        double u = pid_out(Kp, Ki, Kd, e, e_prev, integral, dt);

        /* Clamp actuator: u ∈ [-5, 5] */
        if (u >  5.0) u =  5.0;
        if (u < -5.0) u = -5.0;

        /* Euler integration of first-order plant: dy/dt = (u - y) / tau */
        double dy = (u - y) / tau_plant * dt;
        y += dy;

        e_prev2 = e_prev;
        e_prev  = e;

        if (step % 10 == 0)
            printf("%-8.2f %-10.4f %-10.4f %-10.4f %-10.4f\n", t, y, e, u, integral);
    }

    printf("\n=== Ziegler-Nichols Tuning (Ku=4.0, Pu=0.8 s) ===\n");
    double Ku = 4.0, Pu = 0.8;
    printf("Kp_ZN = %.3f\n", zn_kp(Ku));
    printf("Ki_ZN = %.3f\n", zn_ki(Ku, Pu));
    printf("Kd_ZN = %.3f\n", zn_kd(Ku, Pu));

    printf("\n=== ITAE Tuning (Kc=2.0, θ=0.1 s, τ=1.0 s) ===\n");
    double Kc = 2.0, theta = 0.1, tau = 1.0;
    printf("Kp_ITAE = %.3f\n", itae_kp(Kc, theta, tau));
    printf("Ki_ITAE = %.3f\n", itae_ki(Kc, theta, tau));
    printf("Kd_ITAE = %.3f\n", itae_kd(Kc, theta, tau));

    printf("\n=== Velocity Form Demo (Δu) ===\n");
    double e0 = 0.05, e1 = 0.08, e2 = 0.12;
    printf("e[n]=%.2f  e[n-1]=%.2f  e[n-2]=%.2f  dt=%.3f\n", e0, e1, e2, dt);
    printf("Δu = %.6f\n", pid_delta(Kp, Ki, Kd, e0, e1, e2, dt));

    return 0;
}

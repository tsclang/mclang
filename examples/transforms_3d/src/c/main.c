#include <stdio.h>
#include <math.h>
#include "../../mc/transforms_3d.h"

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

static void print_quat(const char *label, double w, double x, double y, double z) {
    printf("%s: (w=%.6f, x=%.6f, y=%.6f, z=%.6f)\n", label, w, x, y, z);
}

static void print_vec(const char *label, double vx, double vy, double vz) {
    printf("%s: (%.6f, %.6f, %.6f)\n", label, vx, vy, vz);
}

int main(void) {
    /* ---------------------------------------------------------- */
    /* 1. Euler ZYX → quaternion                                  */
    /*    yaw=45°, pitch=30°, roll=10°                           */
    /* ---------------------------------------------------------- */
    double deg = M_PI / 180.0;
    double yaw   = 45.0 * deg;
    double pitch = 30.0 * deg;
    double roll  = 10.0 * deg;

    double ew = euler_w(yaw, pitch, roll);
    double ex = euler_x(yaw, pitch, roll);
    double ey = euler_y(yaw, pitch, roll);
    double ez = euler_z(yaw, pitch, roll);
    double enorm = qnorm(ew, ex, ey, ez);

    printf("=== 1. Euler ZYX → Quaternion ===\n");
    printf("Euler: yaw=45°, pitch=30°, roll=10°\n");
    print_quat("Q", ew, ex, ey, ez);
    printf("norm: %.8f (should be 1.0)\n\n", enorm);

    /* ---------------------------------------------------------- */
    /* 2. Rotate (1,0,0) by 90° around Z axis                    */
    /* ---------------------------------------------------------- */
    double qz90w = axisangle_w(0.0, 0.0, 1.0, M_PI / 2.0);
    double qz90x = axisangle_x(0.0, 0.0, 1.0, M_PI / 2.0);
    double qz90y = axisangle_y(0.0, 0.0, 1.0, M_PI / 2.0);
    double qz90z = axisangle_z(0.0, 0.0, 1.0, M_PI / 2.0);

    double rvx = rot_vx(qz90w, qz90x, qz90y, qz90z, 1.0, 0.0, 0.0);
    double rvy = rot_vy(qz90w, qz90x, qz90y, qz90z, 1.0, 0.0, 0.0);
    double rvz = rot_vz(qz90w, qz90x, qz90y, qz90z, 1.0, 0.0, 0.0);

    printf("=== 2. Rotate (1,0,0) by 90° around Z ===\n");
    print_quat("Q_z90", qz90w, qz90x, qz90y, qz90z);
    print_vec("Rotated (1,0,0)", rvx, rvy, rvz);
    printf("(should be approximately (0, 1, 0))\n\n");

    /* ---------------------------------------------------------- */
    /* 3. Compose Q1=90°X, Q2=90°Y, rotate (0,0,1)              */
    /* ---------------------------------------------------------- */
    double q1w = axisangle_w(1.0, 0.0, 0.0, M_PI / 2.0);
    double q1x = axisangle_x(1.0, 0.0, 0.0, M_PI / 2.0);
    double q1y = axisangle_y(1.0, 0.0, 0.0, M_PI / 2.0);
    double q1z = axisangle_z(1.0, 0.0, 0.0, M_PI / 2.0);

    double q2w = axisangle_w(0.0, 1.0, 0.0, M_PI / 2.0);
    double q2x = axisangle_x(0.0, 1.0, 0.0, M_PI / 2.0);
    double q2y = axisangle_y(0.0, 1.0, 0.0, M_PI / 2.0);
    double q2z = axisangle_z(0.0, 1.0, 0.0, M_PI / 2.0);

    /* Q_composed = Q2 * Q1 (apply Q1 first, then Q2) */
    double qcw = qmul_w(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);
    double qcx = qmul_x(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);
    double qcy = qmul_y(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);
    double qcz = qmul_z(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);

    double v2x = rot_vx(qcw, qcx, qcy, qcz, 0.0, 0.0, 1.0);
    double v2y = rot_vy(qcw, qcx, qcy, qcz, 0.0, 0.0, 1.0);
    double v2z = rot_vz(qcw, qcx, qcy, qcz, 0.0, 0.0, 1.0);

    printf("=== 3. Composed Rotation Q1=90°X, Q2=90°Y ===\n");
    print_quat("Q1 (90° around X)", q1w, q1x, q1y, q1z);
    print_quat("Q2 (90° around Y)", q2w, q2x, q2y, q2z);
    print_quat("Q_composed = Q2*Q1", qcw, qcx, qcy, qcz);
    print_vec("Rotated (0,0,1)", v2x, v2y, v2z);

    printf("Rotation matrix R:\n");
    printf("  [ %8.5f  %8.5f  %8.5f ]\n", rmat_00(qcw,qcx,qcy,qcz), rmat_01(qcw,qcx,qcy,qcz), rmat_02(qcw,qcx,qcy,qcz));
    printf("  [ %8.5f  %8.5f  %8.5f ]\n", rmat_10(qcw,qcx,qcy,qcz), rmat_11(qcw,qcx,qcy,qcz), rmat_12(qcw,qcx,qcy,qcz));
    printf("  [ %8.5f  %8.5f  %8.5f ]\n\n", rmat_20(qcw,qcx,qcy,qcz), rmat_21(qcw,qcx,qcy,qcz), rmat_22(qcw,qcx,qcy,qcz));

    /* ---------------------------------------------------------- */
    /* 4. SLERP: identity → 180° around Z                        */
    /* ---------------------------------------------------------- */
    double si_w = 1.0, si_x = 0.0, si_y = 0.0, si_z = 0.0;  /* identity */
    double sq_w = 0.0, sq_x = 0.0, sq_y = 0.0, sq_z = 1.0;  /* 180° around Z */

    printf("=== 4. SLERP: identity → 180° around Z ===\n");
    printf("Q_start = (1, 0, 0, 0)  [identity]\n");
    printf("Q_end   = (0, 0, 0, 1)  [180° around Z]\n\n");
    printf("%-6s  %s\n", "t", "w         x         y         z");
    printf("%-6s  %s\n", "------", "--------  --------  --------  --------");

    double ts[] = {0.0, 0.25, 0.5, 0.75, 1.0};
    for (int i = 0; i < 5; i++) {
        double t = ts[i];
        double sw = slerp_w(si_w, si_x, si_y, si_z, sq_w, sq_x, sq_y, sq_z, t);
        double sx = slerp_x(si_w, si_x, si_y, si_z, sq_w, sq_x, sq_y, sq_z, t);
        double sy = slerp_y(si_w, si_x, si_y, si_z, sq_w, sq_x, sq_y, sq_z, t);
        double sz = slerp_z(si_w, si_x, si_y, si_z, sq_w, sq_x, sq_y, sq_z, t);
        printf("%-6.2f  %-9.6f %-9.6f %-9.6f %-9.6f\n", t, sw, sx, sy, sz);
    }
    printf("\n");

    /* ---------------------------------------------------------- */
    /* 5. Angular distance: identity vs 60° rotation             */
    /* ---------------------------------------------------------- */
    double q60w = axisangle_w(0.0, 0.0, 1.0, 60.0 * deg);
    double q60x = axisangle_x(0.0, 0.0, 1.0, 60.0 * deg);
    double q60y = axisangle_y(0.0, 0.0, 1.0, 60.0 * deg);
    double q60z = axisangle_z(0.0, 0.0, 1.0, 60.0 * deg);

    double dist_rad = qdist(1.0, 0.0, 0.0, 0.0, q60w, q60x, q60y, q60z);
    printf("=== 5. Angular Distance ===\n");
    print_quat("Q_60z", q60w, q60x, q60y, q60z);
    printf("Angular distance (identity vs 60° around Z): %.6f rad = %.4f°\n",
           dist_rad, dist_rad * 180.0 / M_PI);

    return 0;
}

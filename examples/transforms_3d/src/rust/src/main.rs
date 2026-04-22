include!("../../../mc/transforms_3d_bindings.rs");

fn main() {
    let deg = std::f64::consts::PI / 180.0;

    // 1. Euler ZYX → quaternion
    let yaw   = 45.0 * deg;
    let pitch = 30.0 * deg;
    let roll  = 10.0 * deg;

    unsafe {
        let ew = euler_w(yaw, pitch, roll);
        let ex = euler_x(yaw, pitch, roll);
        let ey = euler_y(yaw, pitch, roll);
        let ez = euler_z(yaw, pitch, roll);
        let enorm = qnorm(ew, ex, ey, ez);

        println!("=== 1. Euler ZYX → Quaternion ===");
        println!("Euler: yaw=45°, pitch=30°, roll=10°");
        println!("Q: (w={:.6}, x={:.6}, y={:.6}, z={:.6})", ew, ex, ey, ez);
        println!("norm: {:.8} (should be 1.0)\n", enorm);

        // 2. Rotate (1,0,0) by 90° around Z
        let qz90w = axisangle_w(0.0, 0.0, 1.0, std::f64::consts::PI / 2.0);
        let qz90x = axisangle_x(0.0, 0.0, 1.0, std::f64::consts::PI / 2.0);
        let qz90y = axisangle_y(0.0, 0.0, 1.0, std::f64::consts::PI / 2.0);
        let qz90z = axisangle_z(0.0, 0.0, 1.0, std::f64::consts::PI / 2.0);
        let rvx = rot_vx(qz90w, qz90x, qz90y, qz90z, 1.0, 0.0, 0.0);
        let rvy = rot_vy(qz90w, qz90x, qz90y, qz90z, 1.0, 0.0, 0.0);
        let rvz = rot_vz(qz90w, qz90x, qz90y, qz90z, 1.0, 0.0, 0.0);
        println!("=== 2. Rotate (1,0,0) by 90° around Z ===");
        println!("Rotated: ({:.6}, {:.6}, {:.6})", rvx, rvy, rvz);
        println!("(should be approx (0, 1, 0))\n");

        // 3. Compose Q1=90°X, Q2=90°Y
        let q1w = axisangle_w(1.0, 0.0, 0.0, std::f64::consts::PI / 2.0);
        let q1x = axisangle_x(1.0, 0.0, 0.0, std::f64::consts::PI / 2.0);
        let q1y = axisangle_y(1.0, 0.0, 0.0, std::f64::consts::PI / 2.0);
        let q1z = axisangle_z(1.0, 0.0, 0.0, std::f64::consts::PI / 2.0);
        let q2w = axisangle_w(0.0, 1.0, 0.0, std::f64::consts::PI / 2.0);
        let q2x = axisangle_x(0.0, 1.0, 0.0, std::f64::consts::PI / 2.0);
        let q2y = axisangle_y(0.0, 1.0, 0.0, std::f64::consts::PI / 2.0);
        let q2z = axisangle_z(0.0, 1.0, 0.0, std::f64::consts::PI / 2.0);
        let qcw = qmul_w(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);
        let qcx = qmul_x(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);
        let qcy = qmul_y(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);
        let qcz = qmul_z(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z);
        let v2x = rot_vx(qcw, qcx, qcy, qcz, 0.0, 0.0, 1.0);
        let v2y = rot_vy(qcw, qcx, qcy, qcz, 0.0, 0.0, 1.0);
        let v2z = rot_vz(qcw, qcx, qcy, qcz, 0.0, 0.0, 1.0);

        println!("=== 3. Composed Rotation Q2*Q1 ===");
        println!("Q_composed: (w={:.6}, x={:.6}, y={:.6}, z={:.6})", qcw, qcx, qcy, qcz);
        println!("Rotated (0,0,1): ({:.6}, {:.6}, {:.6})", v2x, v2y, v2z);
        println!("Rotation matrix:");
        println!("  [ {:8.5}  {:8.5}  {:8.5} ]", rmat_00(qcw,qcx,qcy,qcz), rmat_01(qcw,qcx,qcy,qcz), rmat_02(qcw,qcx,qcy,qcz));
        println!("  [ {:8.5}  {:8.5}  {:8.5} ]", rmat_10(qcw,qcx,qcy,qcz), rmat_11(qcw,qcx,qcy,qcz), rmat_12(qcw,qcx,qcy,qcz));
        println!("  [ {:8.5}  {:8.5}  {:8.5} ]\n", rmat_20(qcw,qcx,qcy,qcz), rmat_21(qcw,qcx,qcy,qcz), rmat_22(qcw,qcx,qcy,qcz));

        // 4. SLERP
        println!("=== 4. SLERP: identity → 180° around Z ===");
        println!("{:<6}  {:<10} {:<10} {:<10} {:<10}", "t", "w", "x", "y", "z");
        println!("{:<6}  {:<10} {:<10} {:<10} {:<10}", "------", "--------", "--------", "--------", "--------");
        let (si_w, si_x, si_y, si_z) = (1.0_f64, 0.0_f64, 0.0_f64, 0.0_f64);
        let (sq_w, sq_x, sq_y, sq_z) = (0.0_f64, 0.0_f64, 0.0_f64, 1.0_f64);
        for &t in &[0.0_f64, 0.25, 0.5, 0.75, 1.0] {
            let sw = slerp_w(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t);
            let sx = slerp_x(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t);
            let sy = slerp_y(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t);
            let sz = slerp_z(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t);
            println!("{:<6.2}  {:<10.6} {:<10.6} {:<10.6} {:<10.6}", t, sw, sx, sy, sz);
        }

        // 5. Angular distance
        println!("\n=== 5. Angular Distance ===");
        let q60w = axisangle_w(0.0, 0.0, 1.0, 60.0 * deg);
        let q60x = axisangle_x(0.0, 0.0, 1.0, 60.0 * deg);
        let q60y = axisangle_y(0.0, 0.0, 1.0, 60.0 * deg);
        let q60z = axisangle_z(0.0, 0.0, 1.0, 60.0 * deg);
        let dist = qdist(1.0, 0.0, 0.0, 0.0, q60w, q60x, q60y, q60z);
        println!("Angular distance (identity vs 60° around Z): {:.6} rad = {:.4}°",
                 dist, dist * 180.0 / std::f64::consts::PI);
    }
}

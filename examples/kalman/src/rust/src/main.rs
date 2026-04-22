include!("../../../mc/kalman_bindings.rs");

fn main() {
    let a = 1.0_f64;
    let b = 0.0_f64;
    let u = 0.0_f64;
    let h = 1.0_f64;
    let q = 0.001_f64;
    let r = 0.5_f64;
    let mut x = 15.0_f64;
    let mut p = 1.0_f64;

    let measurements = [19.3, 20.8, 19.7, 20.5, 21.1, 19.6, 20.2, 20.9, 19.4, 20.6_f64];

    println!("=== Kalman Filter: Temperature Tracking ===");
    println!("True temperature: 20.0 C");
    println!("Initial estimate: {:.1} C, p0={:.1}", x, p);
    println!();
    println!("{:<5}  {:<12}  {:<12}  {:<10}  {:<12}", "Step", "Measurement", "Estimate", "Gain", "Innovation");
    println!("{:<5}  {:<12}  {:<12}  {:<10}  {:<12}", "----", "-----------", "--------", "----", "----------");

    let (mut last_z, mut last_x, mut last_p) = (0.0_f64, 0.0_f64, 0.0_f64);

    for (i, &z) in measurements.iter().enumerate() {
        unsafe {
            let x_pred = kf_predict_x(x, a, u, b);
            let p_pred = kf_predict_p(p, a, q);
            let k      = kf_gain(p_pred, h, r);
            let innov  = kf_innov(z, x_pred, h);
            x = kf_update_x(x_pred, k, z, h);
            p = kf_update_p(p_pred, k, h);
            println!("{:<5}  {:<12.4}  {:<12.4}  {:<10.4}  {:<12.4}", i + 1, z, x, k, innov);
            last_z = z; last_x = x; last_p = p;
        }
    }

    unsafe {
        let nis = kf_nis(last_z, last_x, h, last_p, r);
        println!("\nNIS (last step): {:.4}", nis);

        println!("\n=== Complementary Filter (IMU fusion) ===");
        let gyro_rate   = 0.1_f64;
        let accel_angle = 0.5_f64;
        let alpha       = 0.98_f64;
        let dt          = 0.01_f64;
        let mut prev    = 0.0_f64;

        println!("gyro_rate={:.2} rad/s, accel={:.2} rad, alpha={:.2}, dt={:.3} s\n", gyro_rate, accel_angle, alpha, dt);
        println!("{:<5}  {:<12}", "Step", "Angle (rad)");
        println!("{:<5}  {:<12}", "----", "-----------");
        for i in 0..5 {
            prev = comp_filter(prev, gyro_rate, accel_angle, alpha, dt);
            println!("{:<5}  {:<12.6}", i + 1, prev);
        }

        let tau = comp_tau(dt, 1.0);
        println!("\nalpha from comp_tau(dt={:.3}, T=1.0): {:.4}", dt, tau);
    }
}

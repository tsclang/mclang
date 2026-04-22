include!("../../../mc/pid_control_bindings.rs");

fn main() {
    let kp = 2.0_f64;
    let ki = 1.0_f64;
    let kd = 0.1_f64;
    let dt = 0.05_f64;
    let r  = 1.0_f64;

    let mut y        = 0.0_f64;
    let mut integral = 0.0_f64;
    let mut e_prev   = r - y;

    println!("=== PID Step-Response (Rust) ===");
    println!("Kp={kp}  Ki={ki}  Kd={kd}  dt={dt} s  setpoint={r}\n");
    println!("{:<8} {:<10} {:<10} {:<10} {:<10}", "t(s)", "y", "e", "u", "integral");
    println!("{}", "-".repeat(55));

    unsafe {
        for step in 0..=120_i32 {
            let t = step as f64 * dt;
            let e = r - y;
            integral = pid_integral_clamped(ki, e_prev, e, integral, dt, -2.0, 2.0);
            let mut u = pid_out(kp, ki, kd, e, e_prev, integral, dt);
            u = u.clamp(-5.0, 5.0);
            y += (u - y) / 1.0 * dt;
            e_prev = e;
            if step % 10 == 0 {
                println!("{:<8.2} {:<10.4} {:<10.4} {:<10.4} {:<10.4}", t, y, e, u, integral);
            }
        }

        println!("\n=== Ziegler-Nichols (Ku=4.0, Pu=0.8) ===");
        let (ku, pu) = (4.0_f64, 0.8_f64);
        println!("Kp={:.3}  Ki={:.3}  Kd={:.3}", zn_kp(ku), zn_ki(ku, pu), zn_kd(ku, pu));
    }
}

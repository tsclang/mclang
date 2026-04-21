include!("../../../mc/ballistics_bindings.rs");

fn main() {
    let v0    = 50.0_f64;           // m/s
    let angle = std::f64::consts::PI / 4.0; // 45°

    println!("Projectile: v0={v0:.1} m/s, angle=45°");
    unsafe {
        println!("  Range:          {:.2} m", range(v0, angle));
        println!("  Max height:     {:.2} m", max_height(v0, angle));
        println!("  Time of flight: {:.2} s", time_of_flight(v0, angle));
        println!("  Height at x=50: {:.2} m", height_at(v0, angle, 50.0));
    }

    println!("\nRange vs angle (v0=50 m/s):");
    for deg in (15..=75).step_by(15) {
        let a = (deg as f64).to_radians();
        unsafe {
            println!("  {:2}° → {:.2} m", deg, range(v0, a));
        }
    }
}

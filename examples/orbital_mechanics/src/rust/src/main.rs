include!("../../../mc/orbital_mechanics_bindings.rs");

fn main() {
    use std::f64::consts::PI;

    println!("=== ISS Orbital Parameters (Rust) ===");
    let a_iss = 6_371_000.0_f64 + 408_000.0_f64;
    let e_iss = 0.0006_f64;

    unsafe {
        let t_iss = period(a_iss);
        println!("Semi-major axis: {:.0} km", a_iss / 1000.0);
        println!("Orbital period:  {:.2} min  ({:.2} hr)", t_iss / 60.0, t_iss / 3600.0);
        println!("Circular speed:  {:.4} km/s", v_circular(a_iss) / 1000.0);
        println!("Escape speed:    {:.4} km/s", v_escape(a_iss) / 1000.0);
        println!("Vis-viva (circ): {:.4} km/s\n", vis_viva(a_iss, a_iss) / 1000.0);

        // Kepler's equation
        let m_anom = PI / 4.0;
        let ecc    = 0.1_f64;
        let e_anom = ecc_anomaly(m_anom, ecc);
        let nu_val = true_anomaly(e_anom, ecc);
        println!("=== Kepler's Equation (e={ecc}, M=π/4) ===");
        println!("Eccentric anomaly E: {e_anom:.6} rad  ({:.2}°)", e_anom.to_degrees());
        println!("True anomaly ν:      {nu_val:.6} rad  ({:.2}°)", nu_val.to_degrees());
        let m_check = e_anom - ecc * e_anom.sin();
        println!("Verification M: {m_check:.8} (expect {m_anom:.8})\n");

        // Orbital positions
        let a_orbit = 7_000_000.0_f64;
        let e_orbit = 0.05_f64;
        println!("=== Orbital Positions (a=7000 km, e={e_orbit}) ===");
        println!("{:>6}  {:>10}  {:>10}  {:>10}  {:>10}",
            "ν(deg)", "r (km)", "x (km)", "y (km)", "v (km/s)");
        for k in 0..8 {
            let nu_k = k as f64 * PI / 4.0;
            let r_k  = orbit_radius(a_orbit, e_orbit, nu_k);
            let x_k  = orbit_x(a_orbit, e_orbit, nu_k);
            let y_k  = orbit_y(a_orbit, e_orbit, nu_k);
            let v_k  = vis_viva(r_k, a_orbit);
            println!("{:6.0}  {:10.2}  {:10.2}  {:10.2}  {:10.4}",
                nu_k.to_degrees(),
                r_k / 1000.0, x_k / 1000.0, y_k / 1000.0,
                v_k / 1000.0);
        }

        // Hohmann transfer
        let r_leo = 6_779_000.0_f64;
        let r_geo = 42_164_000.0_f64;
        let dv1   = dv1_hohmann(r_leo, r_geo);
        let dv2   = dv2_hohmann(r_leo, r_geo);
        let dvt   = dv_total_hohmann(r_leo, r_geo);
        let t_tr  = period((r_leo + r_geo) / 2.0);

        println!("\n=== Hohmann Transfer: LEO → GEO ===");
        println!("LEO: {:.0} km  GEO: {:.0} km", r_leo / 1000.0, r_geo / 1000.0);
        println!("Δv₁ (LEO burn):  {:+.4} km/s", dv1 / 1000.0);
        println!("Δv₂ (GEO circ):  {:+.4} km/s", dv2 / 1000.0);
        println!("Δv total:         {:.4} km/s", dvt / 1000.0);
        println!("Transfer time:    {:.2} hr", t_tr / 2.0 / 3600.0);
    }

    let _ = e_iss; // used in spec, shown for completeness
}

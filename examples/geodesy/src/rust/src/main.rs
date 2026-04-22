include!("../../../mc/geodesy_bindings.rs");

const DEG: f64 = std::f64::consts::PI / 180.0;
const RAD: f64 = 180.0 / std::f64::consts::PI;

fn main() {
    let lat_msk = 55.7558 * DEG;
    let lon_msk = 37.6173 * DEG;
    let lat_lon = 51.5074 * DEG;
    let lon_lon = -0.1278 * DEG;

    println!("=== Geodesy (Rust) ===");

    unsafe {
        let dist = haversine(lat_msk, lon_msk, lat_lon, lon_lon);
        let brng = bearing(lat_msk, lon_msk, lat_lon, lon_lon);
        println!("Haversine Moscow→London: {:.1} km", dist / 1000.0);
        println!("Initial bearing:         {:.2}°\n", brng * RAD);

        let h = 150.0_f64;
        println!("ECEF Moscow (h={h:.0} m):");
        println!("  X = {:.1} m", ecef_x(lat_msk, lon_msk, h));
        println!("  Y = {:.1} m", ecef_y(lat_msk, lon_msk, h));
        println!("  Z = {:.1} m\n", ecef_z(lat_msk, lon_msk, h));

        let lat_hel = 60.1699 * DEG;
        let lon_hel = 24.9384 * DEG;
        let xtd = cross_track(lat_msk, lon_msk, lat_lon, lon_lon, lat_hel, lon_hel);
        let atd = along_track(lat_msk, lon_msk, lat_lon, lon_lon, lat_hel, lon_hel);
        let side = if xtd >= 0.0 { "right" } else { "left" };
        println!("Helsinki relative to Moscow→London GC:");
        println!("  Cross-track: {:.1} km ({side})", xtd.abs() / 1000.0);
        println!("  Along-track: {:.1} km", atd / 1000.0);
    }
}

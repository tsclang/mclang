use std::f64::consts::PI;

#[link(name = "optics")]
extern "C" {
    fn brewster_angle(n1: f64, n2: f64) -> f64;
    fn critical_angle(n1: f64, n2: f64) -> f64;
    fn snell_angle(n1: f64, theta1: f64, n2: f64) -> f64;
    fn R_s(n1: f64, theta1: f64, n2: f64) -> f64;
    fn R_p(n1: f64, theta1: f64, n2: f64) -> f64;
    fn young_fringe_spacing(lambda: f64, L: f64, d: f64) -> f64;
    fn fabry_perot_T(R: f64, n: f64, d: f64, theta: f64, lambda: f64) -> f64;
    fn finesse(R: f64) -> f64;
    fn fsr(lambda: f64, n: f64, d: f64) -> f64;
    fn rayleigh_angle(lambda: f64, D: f64) -> f64;
    fn abbe_limit(lambda: f64, na: f64) -> f64;
}

fn main() {
    let lam = 550e-9_f64;
    unsafe {
        println!("Brewster angle (air→glass 1.5): {:.2}°", brewster_angle(1.0, 1.5).to_degrees());
        println!("Critical angle (glass→air):     {:.2}°", critical_angle(1.5, 1.0).to_degrees());
        println!("Snell θ_t at 45°:               {:.2}°", snell_angle(1.0, 45f64.to_radians(), 1.5).to_degrees());
        println!("Rs at 45°:  {:.4}", R_s(1.0, 45f64.to_radians(), 1.5));
        println!("Rp at 45°:  {:.4}", R_p(1.0, 45f64.to_radians(), 1.5));
        println!("Fringe spacing (d=0.5mm, L=1m): {:.3} mm", young_fringe_spacing(lam, 1.0, 0.5e-3) * 1e3);
        println!("Finesse (R=0.9):  {:.1}", finesse(0.9));
        println!("FSR (n=1.5, d=1mm): {:.3} pm", fsr(lam, 1.5, 1e-3) * 1e12);
        println!("Rayleigh (D=100mm): {:.4} μrad", rayleigh_angle(lam, 0.1) * 1e6);
        println!("Abbe limit (NA=0.9): {:.1} nm", abbe_limit(lam, 0.9) * 1e9);
    }
}

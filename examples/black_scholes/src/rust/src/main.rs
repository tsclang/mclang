include!("../../../mc/black_scholes_bindings.rs");

fn main() {
    let s   = 100.0_f64;
    let k   = 100.0_f64;
    let r   = 0.05_f64;
    let sig = 0.20_f64;
    let t   = 1.0_f64;

    println!("=== Black-Scholes Option Pricing (Rust) ===");
    println!("S={s:.0}, K={k:.0}, r={r:.2}, σ={sig:.2}, T={t:.1} yr\n");

    unsafe {
        let cp = call_price(s, k, r, sig, t);
        let pp = put_price(s, k, r, sig, t);
        println!("Call price: ${cp:.4}");
        println!("Put  price: ${pp:.4}");

        let parity = cp - pp - s + k * (-r * t).exp();
        println!("Put-Call parity check: {parity:.6}\n");

        println!("=== Greeks ===");
        println!("Call Delta:  {:+.4}", call_delta(s, k, r, sig, t));
        println!("Put  Delta:  {:+.4}", put_delta(s, k, r, sig, t));
        println!("Gamma:        {:.6}", bs_gamma(s, k, r, sig, t));
        println!("Vega:         {:.4}", bs_vega(s, k, r, sig, t));
        println!("Call Theta:   {:.4}", call_theta(s, k, r, sig, t));
        println!("Call Rho:     {:.4}", call_rho(s, k, r, sig, t));
        println!("Put  Rho:     {:.4}", put_rho(s, k, r, sig, t));

        let strikes = [80.0_f64, 90.0, 100.0, 110.0, 120.0];
        let vols    = [0.10_f64, 0.20, 0.30];
        println!("\n=== Call Price Table ===");
        for &strike in &strikes {
            let row: Vec<String> = vols.iter()
                .map(|&v| format!("{:8.4}", call_price(s, strike, r, v, t)))
                .collect();
            println!("K={strike:5.0}: {}", row.join("  "));
        }
    }
}

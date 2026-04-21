include!("../../../mc/number_theory_bindings.rs");

fn bool_str(v: f64) -> &'static str {
    if v != 0.0 { "true" } else { "false" }
}

fn main() {
    println!("GCD / LCM:");
    unsafe {
        println!("  gcd(48, 18)  = {}", gcd(48.0, 18.0) as i64);
        println!("  lcm(4, 6)    = {}", lcm(4.0, 6.0) as i64);
        println!("  gcd(100, 75) = {}", gcd(100.0, 75.0) as i64);
    }

    println!("\nDivisibility:");
    unsafe {
        for n in [7.0, 8.0, 9.0, 10.0] {
            println!("  n={n:.0}: even={} odd={} div3={}",
                bool_str(is_even(n)),
                bool_str(is_odd(n)),
                bool_str(is_divisible(n, 3.0)));
        }
    }

    println!("\nTriangular numbers T(1..10):");
    unsafe {
        let ts: Vec<i64> = (1..=10).map(|n| triangular(n as f64) as i64).collect();
        println!("  {:?}", ts);
    }

    println!("\nDigital roots:");
    unsafe {
        for n in [0.0, 9.0, 10.0, 493.0, 999.0] {
            println!("  digital_root({n:.0}) = {}", digital_root(n) as i64);
        }
    }
}

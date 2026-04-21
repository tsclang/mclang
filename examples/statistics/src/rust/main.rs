include!("../../../mc/statistics_bindings.rs");

fn main() {
    let data: Vec<f64> = vec![2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0];
    let ptr = data.as_ptr();
    let n   = data.len() as i32;

    println!("Data: {:?}", data);
    unsafe {
        println!("  Mean:    {:.4}", avg(ptr, n));
        println!("  Std dev: {:.4}", spread(ptr, n));
        println!("  CV:      {:.2}%", cv(ptr, n));
        println!("  Range:   {:.1}", data_range(ptr, n));
    }

    println!("\nZ-scores:");
    unsafe {
        for &x in &data {
            println!("  {x:.0} → z={:.4}", z_score(ptr, n, x));
        }
    }

    println!("\nNormalized:");
    unsafe {
        for &x in &data {
            println!("  {x:.0} → {:.4}", normalize(ptr, n, x));
        }
    }
}

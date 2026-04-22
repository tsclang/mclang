include!("../../../mc/colorimetry_bindings.rs");

fn main() {
    let colors: &[(&str, f64, f64, f64)] = &[
        ("Red",    1.0, 0.0, 0.0),
        ("Green",  0.0, 1.0, 0.0),
        ("Blue",   0.0, 0.0, 1.0),
        ("White",  1.0, 1.0, 1.0),
        ("Black",  0.0, 0.0, 0.0),
        ("Yellow", 1.0, 1.0, 0.0),
    ];

    println!("=== Colorimetry (Rust) ===\n");
    println!("{:<8} {:>7} {:>7} {:>7}", "Name", "L*", "a*", "b*");
    println!("{}", "-".repeat(35));

    unsafe {
        for &(name, r, g, b) in colors {
            let l = lab_L(r, g, b);
            let a = lab_a(r, g, b);
            let bv = lab_b(r, g, b);
            println!("{:<8} {:7.2} {:+7.2} {:+7.2}", name, l, a, bv);
        }

        println!("\n=== WCAG Contrast ===");
        for &(name, r, g, b) in colors {
            let cr_b = contrast_ratio(r, g, b, 0.0, 0.0, 0.0);
            let cr_w = contrast_ratio(r, g, b, 1.0, 1.0, 1.0);
            println!("{:<8} vs Black: {:5.2}:1   vs White: {:5.2}:1",
                     name, cr_b, cr_w);
        }

        println!("\n=== sRGB round-trip ===");
        for &c in &[0.0_f64, 0.04, 0.5, 0.9, 1.0] {
            let lin  = srgb_to_linear(c);
            let back = linear_to_srgb(lin);
            println!("sRGB={c:.2} → lin={lin:.6} → back={back:.6}  err={:.2e}", (c - back).abs());
        }
    }
}

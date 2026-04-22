include!("../../../mc/dsp_filters_bindings.rs");

fn main() {
    let n_taps = 9_usize;
    let fc     = 0.2_f64;

    println!("=== Window Coefficients (N={n_taps}) [Rust] ===");
    println!("{:>4}  {:>10}  {:>10}  {:>10}  {:>10}", "tap", "Hann", "Hamming", "Blackman", "Flat-top");
    unsafe {
        for n in 0..n_taps {
            let nd = n as f64;
            let nd_taps = n_taps as f64;
            println!("{:4}  {:10.6}  {:10.6}  {:10.6}  {:10.6}",
                n,
                hann(nd, nd_taps),
                hamming(nd, nd_taps),
                blackman(nd, nd_taps),
                flattop(nd, nd_taps));
        }

        println!("\n=== 9-tap LPF coefficients (Hann, fc={fc}) ===");
        let mut h = vec![0.0_f64; n_taps];
        for n in 0..n_taps {
            h[n] = lp_hann(n as f64, n_taps as f64, fc);
            println!("  h[{n}] = {:10.6}", h[n]);
        }
        let dc_gain: f64 = h.iter().sum();
        println!("  DC gain (sum): {dc_gain:.6}");

        // Build test signal
        let n_sig = 64_usize;
        let signal: Vec<f64> = (0..n_sig)
            .map(|i| {
                let t = i as f64;
                (2.0 * std::f64::consts::PI * 0.1 * t).sin()
                + (2.0 * std::f64::consts::PI * 0.4 * t).sin()
            })
            .collect();

        let rms_in = (signal.iter().map(|x| x * x).sum::<f64>() / n_sig as f64).sqrt();
        println!("\n=== Signal Analysis ===");
        println!("Input RMS:  {rms_in:.6}  (low + high freq)");

        // Apply FIR
        let n_out = n_sig - n_taps + 1;
        let mut filtered = vec![0.0_f64; n_out];
        for i in 0..n_out {
            let win: Vec<f64> = signal[i..i+n_taps].to_vec();
            filtered[i] = fir(h.as_ptr(), n_taps as i32, win.as_ptr(), n_taps as i32);
        }
        let rms_out = (filtered.iter().map(|x| x * x).sum::<f64>() / n_out as f64).sqrt();
        let attn_db = 20.0 * (rms_out / rms_in).log10();
        println!("Output RMS: {rms_out:.6}  (high-freq attenuated)");
        println!("Attenuation: {attn_db:.2} dB");

        println!("\nFirst 12 filtered samples:");
        for (i, v) in filtered.iter().take(12).enumerate() {
            println!("  y[{i:2}] = {v:8.5}");
        }
    }
}

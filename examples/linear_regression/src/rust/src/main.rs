include!("../../../mc/linear_regression_bindings.rs");

fn main() {
    let x: Vec<f64> = vec![50.0, 60.0, 70.0, 80.0, 90.0, 100.0, 110.0, 120.0];
    let y: Vec<f64> = vec![150.0, 180.0, 210.0, 235.0, 260.0, 285.0, 310.0, 340.0];
    let n = x.len() as i32;

    unsafe {
        let slope     = lr_slope(x.as_ptr(), n, y.as_ptr(), n, n as f64);
        let intercept = lr_intercept(x.as_ptr(), n, y.as_ptr(), n, n as f64);
        let r2        = r_squared(x.as_ptr(), n, y.as_ptr(), n, n as f64);
        let err_rmse  = rmse(x.as_ptr(), n, y.as_ptr(), n, n as f64);
        let r         = pearson(x.as_ptr(), n, y.as_ptr(), n, n as f64);

        println!("=== Linear Regression: House Prices ===");
        println!("Data: area (m²) vs price (k€), n={}\n", n);
        println!("Slope:         {:.4} k€/m²", slope);
        println!("Intercept:     {:.4} k€",    intercept);
        println!("R²:            {:.6}",       r2);
        println!("RMSE:          {:.4} k€",    err_rmse);
        println!("Pearson r:     {:.6}",       r);
        println!("\nPrediction for 95 m²: {:.2} k€", lr_predict(slope, intercept, 95.0));

        println!("\n=== Residuals ===");
        println!("{:<8}  {:<8}  {:<10}  {:<10}", "Area", "Price", "Predicted", "Residual");
        println!("{:<8}  {:<8}  {:<10}  {:<10}", "------", "-----", "---------", "--------");
        for i in 0..x.len() {
            let pred  = lr_predict(slope, intercept, x[i]);
            let resid = y[i] - pred;
            println!("{:<8.0}  {:<8.0}  {:<10.4}  {:<10.4}", x[i], y[i], pred, resid);
        }

        // Matrix normal equations
        let sum_x:  f64 = x.iter().sum();
        let sum_x2: f64 = x.iter().map(|v| v * v).sum();
        let sum_y:  f64 = y.iter().sum();
        let sum_xy: f64 = x.iter().zip(y.iter()).map(|(a, b)| a * b).sum();

        let mut xtx = [n as f64, sum_x, sum_x, sum_x2];
        let det_val = xtx_det(xtx.as_ptr(), 2, 2);
        let inv_ptr = xtx_inv(xtx.as_mut_ptr(), 2, 2);
        let inv: &[f64] = std::slice::from_raw_parts(inv_ptr, 4);

        println!("\n=== Matrix Normal Equations (X'X) ===");
        println!("X'X = [[{}, {}], [{}, {}]]", xtx[0] as i32, xtx[1] as i32, xtx[2] as i32, xtx[3] as i32);
        println!("det(X'X) = {:.2}", det_val);
        println!("(X'X)^-1 = [[{:.6}, {:.6}], [{:.6}, {:.6}]]",
                 inv[0], inv[1], inv[2], inv[3]);

        let beta0 = inv[0] * sum_y + inv[1] * sum_xy;
        let beta1 = inv[2] * sum_y + inv[3] * sum_xy;
        println!("Coefficients: intercept={:.4}, slope={:.4}", beta0, beta1);
    }
}

include!("../../../mc/geometry_bindings.rs");

fn print_vec3(label: &str, ptr: *const f64) {
    let s = unsafe { std::slice::from_raw_parts(ptr, 3) };
    println!("  {label}: [{:.3}, {:.3}, {:.3}]", s[0], s[1], s[2]);
}

fn main() {
    println!("2D geometry:");
    unsafe {
        println!("  dist (0,0)→(3,4):    {:.4}", dist2d(0.0, 0.0, 3.0, 4.0));
        println!("  dist (1,1)→(4,5):    {:.4}", dist2d(1.0, 1.0, 4.0, 5.0));
        let rad = angle2d(1.0, 0.0, 0.0, 1.0);
        println!("  angle (1,0)∠(0,1):   {rad:.4} rad = {:.1}°", rad.to_degrees());
        println!("  triangle area (0,0)(4,0)(0,3): {:.4}",
            triangle_area(0.0, 0.0, 4.0, 0.0, 0.0, 3.0));
    }

    let a = [1.0_f64, 2.0, 3.0];
    let b = [4.0_f64, 5.0, 6.0];
    println!("\n3D vectors:");
    unsafe {
        println!("  dot([1,2,3],[4,5,6]):  {:.1}",
            dot3(a.as_ptr(), 3, b.as_ptr(), 3));
        print_vec3("cross", cross3(a.as_ptr(), 3, b.as_ptr(), 3));
        println!("  norm([1,2,3]):         {:.4}", len3(a.as_ptr(), 3));
    }

    #[rustfmt::skip]
    let m = [
        1.0_f64, 2.0, 3.0,
        4.0,     5.0, 6.0,
        7.0,     8.0, 9.0,
    ];
    println!("\nMatrix [[1,2,3],[4,5,6],[7,8,9]]:");
    unsafe {
        print_vec3("col 1", matrix_col(m.as_ptr(), 3, 3, 1));
        print_vec3("row 2", matrix_row(m.as_ptr(), 3, 3, 2));
    }
}

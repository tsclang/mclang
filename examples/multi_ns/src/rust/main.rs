include!("../../../mc/math_bindings.rs");

fn main() {
    let (r, w, h) = (5.0_f64, 4.0_f64, 3.0_f64);

    println!("=== area(r=5) — same name, different namespace ===");
    unsafe {
        println!("  s2::area (circle):  {:.4}", s2__area(r));
        println!("  s3::area (sphere):  {:.4}", s3__area(r));
    }

    println!("\n=== perimeter / volume (r=5) ===");
    unsafe {
        println!("  s2::perimeter (circle):  {:.4}", s2__perimeter(r));
        println!("  s3::volume    (sphere):  {:.4}", s3__volume(r));
    }

    println!("\n=== 2D shapes ===");
    unsafe {
        println!("  rect  area({w}, {h}):       {:.4}", s2__rect_area(w, h));
        println!("  rect  perimeter({w}, {h}):  {:.4}", s2__rect_perimeter(w, h));
        println!("  triangle area(3,4,5):    {:.4}", s2__tri_area(3.0, 4.0, 5.0));
    }

    println!("\n=== 3D shapes ===");
    unsafe {
        println!("  cube  area({w}):      {:.4}", s3__cube_area(w));
        println!("  cube  volume({w}):    {:.4}", s3__cube_volume(w));
        println!("  cyl   area({r},{h}):   {:.4}", s3__cyl_area(r, h));
        println!("  cyl   volume({r},{h}): {:.4}", s3__cyl_volume(r, h));
    }
}

fn main() {
    cc::Build::new()
        .file("../../mc/geometry.c")
        .compile("geometry");
    println!("cargo:rustc-link-lib=m");
}

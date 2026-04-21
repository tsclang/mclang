fn main() {
    cc::Build::new()
        .file("../../mc/geometry.c")
        .compile("geometry");
    if cfg!(unix) {
        println!("cargo:rustc-link-lib=m");
    }
}

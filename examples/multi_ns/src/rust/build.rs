fn main() {
    cc::Build::new()
        .file("../../mc/math.c")
        .compile("math");
    if cfg!(unix) {
        println!("cargo:rustc-link-lib=m");
    }
}

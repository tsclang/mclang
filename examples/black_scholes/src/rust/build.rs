fn main() {
    cc::Build::new()
        .file("../../../mc/black_scholes.c")
        .compile("black_scholes");
    println!("cargo:rustc-link-lib=m");
}

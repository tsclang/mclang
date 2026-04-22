fn main() {
    cc::Build::new()
        .file("../../../mc/kalman.c")
        .compile("kalman");
    if cfg!(unix) {
        println!("cargo:rustc-link-lib=m");
    }
}

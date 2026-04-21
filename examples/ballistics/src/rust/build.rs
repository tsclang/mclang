fn main() {
    cc::Build::new()
        .file("../../mc/ballistics.c")
        .compile("ballistics");
    if cfg!(unix) {
        println!("cargo:rustc-link-lib=m");
    }
}

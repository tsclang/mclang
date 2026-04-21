fn main() {
    cc::Build::new()
        .file("../../mc/statistics.c")
        .compile("statistics");
    if cfg!(unix) {
        println!("cargo:rustc-link-lib=m");
    }
}

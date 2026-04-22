fn main() {
    cc::Build::new()
        .file("../../../mc/linear_regression.c")
        .compile("linear_regression");
    if cfg!(unix) {
        println!("cargo:rustc-link-lib=m");
    }
}

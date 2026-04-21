fn main() {
    cc::Build::new()
        .file("../../mc/number_theory.c")
        .compile("number_theory");
    if cfg!(unix) {
        println!("cargo:rustc-link-lib=m");
    }
}

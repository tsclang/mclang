fn main() {
    cc::Build::new()
        .file("../../mc/number_theory.c")
        .compile("number_theory");
    println!("cargo:rustc-link-lib=m");
}

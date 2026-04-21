fn main() {
    cc::Build::new()
        .file("../../mc/math.c")
        .compile("math");
    println!("cargo:rustc-link-lib=m");
}

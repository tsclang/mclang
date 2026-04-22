fn main() {
    cc::Build::new()
        .file("../../../mc/geodesy.c")
        .compile("geodesy");
    println!("cargo:rustc-link-lib=m");
}

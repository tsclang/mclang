fn main() {
    cc::Build::new()
        .file("../../mc/ballistics.c")
        .compile("ballistics");
    println!("cargo:rustc-link-lib=m");
}

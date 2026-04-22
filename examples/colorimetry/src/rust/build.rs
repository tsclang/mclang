fn main() {
    cc::Build::new()
        .file("../../../mc/colorimetry.c")
        .compile("colorimetry");
    println!("cargo:rustc-link-lib=m");
}

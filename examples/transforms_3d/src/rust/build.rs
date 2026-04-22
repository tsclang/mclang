fn main() {
    cc::Build::new()
        .file("../../../mc/transforms_3d.c")
        .compile("transforms_3d");
    if cfg!(unix) {
        println!("cargo:rustc-link-lib=m");
    }
}

fn main() {
    cc::Build::new()
        .file("../../../mc/dsp_filters.c")
        .compile("dsp_filters");
    println!("cargo:rustc-link-lib=m");
}

fn main() {
    cc::Build::new()
        .file("../../mc/statistics.c")
        .compile("statistics");
    println!("cargo:rustc-link-lib=m");
}

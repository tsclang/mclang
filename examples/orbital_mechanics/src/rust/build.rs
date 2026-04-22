fn main() {
    cc::Build::new()
        .file("../../../mc/orbital_mechanics.c")
        .compile("orbital_mechanics");
    println!("cargo:rustc-link-lib=m");
}

fn main() {
    println!("cargo:rustc-link-search=native=../../mc");
    println!("cargo:rustc-link-lib=static=optics");
    println!("cargo:rustc-link-lib=m");
}

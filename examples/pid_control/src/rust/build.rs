fn main() {
    cc::Build::new()
        .file("../../../mc/pid_control.c")
        .compile("pid_control");
    println!("cargo:rustc-link-lib=m");
}

import ctypes, os, math

lib_path = os.path.join(os.path.dirname(__file__), '../../mc/optics.so')
lib = ctypes.CDLL(lib_path)

for fn in ('snell_angle','brewster_angle','critical_angle',
           'R_s','R_p','R_unpol','T_s','T_p',
           'young_intensity','young_fringe_spacing',
           'single_slit','fabry_perot_T','finesse','fsr','fp_resolution',
           'rayleigh_angle','abbe_limit'):
    getattr(lib, fn).restype  = ctypes.c_double
    getattr(lib, fn).argtypes = [ctypes.c_double] * 10  # generous upper bound

n_air, n_glass = 1.0, 1.5
th_B = lib.brewster_angle(n_air, n_glass)
th_c = lib.critical_angle(n_glass, n_air)
print(f"Brewster angle:        {math.degrees(th_B):.2f}°")
print(f"Critical angle:        {math.degrees(th_c):.2f}°")

lam = 550e-9
print(f"\nFringes (d=0.5 mm, L=1 m): {lib.young_fringe_spacing(lam, 1.0, 0.5e-3)*1e3:.3f} mm")

R_fp = 0.9
print(f"Fabry-Pérot finesse:   {lib.finesse(R_fp):.1f}")
print(f"FSR:                   {lib.fsr(lam, 1.5, 1e-3)*1e12:.3f} pm")

import ctypes, os, sys
sys.stdout.reconfigure(encoding='utf-8')

_dir   = os.path.dirname(os.path.abspath(__file__))
_build = os.path.join(_dir, '..', '..', 'build')

_lib_path = os.path.join(_build, 'colorimetry.dll')
if not os.path.exists(_lib_path):
    _lib_path = os.path.join(_build, 'colorimetry.so')
if not os.path.exists(_lib_path):
    print(f'Error: shared library not found in {_build}', file=sys.stderr)
    sys.exit(1)

lib = ctypes.CDLL(_lib_path)

def _fn3(name):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double] * 3
    fn.restype  = ctypes.c_double
    return fn

def _fn6(name):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double] * 6
    fn.restype  = ctypes.c_double
    return fn

def _fn1(name):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double]
    fn.restype  = ctypes.c_double
    return fn

srgb_to_linear = _fn1('srgb_to_linear')
linear_to_srgb = _fn1('linear_to_srgb')
xyz_x = _fn3('xyz_x'); xyz_y = _fn3('xyz_y'); xyz_z = _fn3('xyz_z')
lab_L = _fn3('lab_L'); lab_a = _fn3('lab_a'); lab_b = _fn3('lab_b')
chroma = ctypes.CFUNCTYPE(ctypes.c_double, ctypes.c_double, ctypes.c_double)(lib.chroma)
lib.chroma.argtypes = [ctypes.c_double, ctypes.c_double]; lib.chroma.restype = ctypes.c_double
delta_e76 = _fn6('delta_e76')
delta_e94 = _fn6('delta_e94')
lib.contrast_ratio.argtypes = [ctypes.c_double] * 6; lib.contrast_ratio.restype = ctypes.c_double

colors = [
    (1.0, 0.0, 0.0, 'Red'),
    (0.0, 1.0, 0.0, 'Green'),
    (0.0, 0.0, 1.0, 'Blue'),
    (1.0, 1.0, 1.0, 'White'),
    (0.0, 0.0, 0.0, 'Black'),
    (1.0, 1.0, 0.0, 'Yellow'),
]

print("=== Colorimetry (Python / ctypes) ===\n")
print(f"{'Name':<8} {'L*':>7} {'a*':>7} {'b*':>7}")
print("-" * 35)
for r, g, b, name in colors:
    L = lab_L(r, g, b); a = lab_a(r, g, b); bv = lab_b(r, g, b)
    print(f"{name:<8} {L:7.2f} {a:+7.2f} {bv:+7.2f}")

print("\n=== CIE76 ΔE* ===")
for i, (r1, g1, b1, n1) in enumerate(colors):
    L1 = lab_L(r1,g1,b1); a1 = lab_a(r1,g1,b1); b1v = lab_b(r1,g1,b1)
    for j, (r2, g2, b2, n2) in enumerate(colors):
        if j <= i: continue
        L2 = lab_L(r2,g2,b2); a2 = lab_a(r2,g2,b2); b2v = lab_b(r2,g2,b2)
        de = delta_e76(L1, a1, b1v, L2, a2, b2v)
        print(f"{n1} ↔ {n2}: ΔE76={de:.2f}")

print("\n=== WCAG Contrast ===")
for r, g, b, name in colors:
    cr_b = lib.contrast_ratio(r, g, b, 0.0, 0.0, 0.0)
    cr_w = lib.contrast_ratio(r, g, b, 1.0, 1.0, 1.0)
    print(f"{name:<8} vs Black: {cr_b:5.2f}:1   vs White: {cr_w:5.2f}:1")

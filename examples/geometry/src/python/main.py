import ctypes, math, os, sys
sys.stdout.reconfigure(encoding='utf-8')

_build = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'build')
_lib = os.path.join(_build, 'geometry.dll')
if not os.path.exists(_lib):
    _lib = os.path.join(_build, 'geometry.so')
if not os.path.exists(_lib):
    print(f'Error: shared library not found in {_build}', file=sys.stderr); sys.exit(1)

lib = ctypes.CDLL(_lib)

for fn in ('dist2d', 'angle2d'):
    f = getattr(lib, fn)
    f.argtypes = [ctypes.c_double] * 4
    f.restype = ctypes.c_double

lib.triangle_area.argtypes = [ctypes.c_double] * 6
lib.triangle_area.restype = ctypes.c_double

print('2D geometry:')
print(f'  dist (0,0)→(3,4):    {lib.dist2d(0,0,3,4):.4f}')
print(f'  dist (1,1)→(4,5):    {lib.dist2d(1,1,4,5):.4f}')
rad = lib.angle2d(1, 0, 0, 1)
print(f'  angle (1,0)∠(0,1):   {rad:.4f} rad = {rad*180/math.pi:.1f}°')
print(f'  triangle area (0,0)(4,0)(0,3): {lib.triangle_area(0,0,4,0,0,3):.4f}')

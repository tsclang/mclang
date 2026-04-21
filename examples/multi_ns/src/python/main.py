import ctypes, math, os, sys
sys.stdout.reconfigure(encoding='utf-8')

_build = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'build')
_lib = os.path.join(_build, 'math.dll')
if not os.path.exists(_lib):
    _lib = os.path.join(_build, 'math.so')
if not os.path.exists(_lib):
    print(f'Error: shared library not found in {_build}', file=sys.stderr); sys.exit(1)

lib = ctypes.CDLL(_lib)
for fn in ('s2__area', 's2__perimeter', 's3__area', 's3__volume'):
    f = getattr(lib, fn)
    f.argtypes = [ctypes.c_double]; f.restype = ctypes.c_double
for fn in ('s2__rect_area', 's2__rect_perimeter', 's3__cyl_area', 's3__cyl_volume'):
    f = getattr(lib, fn)
    f.argtypes = [ctypes.c_double, ctypes.c_double]; f.restype = ctypes.c_double
lib.s2__tri_area.argtypes = [ctypes.c_double]*3; lib.s2__tri_area.restype = ctypes.c_double
lib.s3__cube_area.argtypes = [ctypes.c_double];   lib.s3__cube_area.restype = ctypes.c_double
lib.s3__cube_volume.argtypes = [ctypes.c_double];  lib.s3__cube_volume.restype = ctypes.c_double

r, w, h = 5.0, 4.0, 3.0

print('=== area(r=5) — same name, different namespace ===')
print(f'  s2::area (circle):  {lib.s2__area(r):.4f}')
print(f'  s3::area (sphere):  {lib.s3__area(r):.4f}')

print('\n=== perimeter / volume (r=5) ===')
print(f'  s2::perimeter (circle):  {lib.s2__perimeter(r):.4f}')
print(f'  s3::volume    (sphere):  {lib.s3__volume(r):.4f}')

print('\n=== 2D shapes ===')
print(f'  rect  area({w}, {h}):       {lib.s2__rect_area(w, h):.4f}')
print(f'  rect  perimeter({w}, {h}):  {lib.s2__rect_perimeter(w, h):.4f}')
print(f'  triangle area(3,4,5):    {lib.s2__tri_area(3, 4, 5):.4f}')

print('\n=== 3D shapes ===')
print(f'  cube  area({w}):      {lib.s3__cube_area(w):.4f}')
print(f'  cube  volume({w}):    {lib.s3__cube_volume(w):.4f}')
print(f'  cyl   area({r},{h}):   {lib.s3__cyl_area(r, h):.4f}')
print(f'  cyl   volume({r},{h}): {lib.s3__cyl_volume(r, h):.4f}')

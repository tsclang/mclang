import ctypes
import math
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load the shared library built from ballistics.mc
_dir = os.path.dirname(os.path.abspath(__file__))
_build = os.path.join(_dir, '..', '..', 'build')

# Windows: .dll, Linux/Mac: .so
_lib_path = os.path.join(_build, 'ballistics.dll')
if not os.path.exists(_lib_path):
    _lib_path = os.path.join(_build, 'ballistics.so')
if not os.path.exists(_lib_path):
    print(f'Error: shared library not found in {_build}', file=sys.stderr)
    sys.exit(1)

lib = ctypes.CDLL(_lib_path)

# Declare signatures
for fn in ('range', 'max_height', 'time_of_flight'):
    f = getattr(lib, fn)
    f.argtypes = [ctypes.c_double, ctypes.c_double]
    f.restype  = ctypes.c_double

lib.height_at.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double]
lib.height_at.restype  = ctypes.c_double

# Run
v0    = 50.0
angle = math.pi / 4.0

print(f'Projectile: v0={v0:.1f} m/s, angle=45°')
print(f'  Range:          {lib.range(v0, angle):.2f} m')
print(f'  Max height:     {lib.max_height(v0, angle):.2f} m')
print(f'  Time of flight: {lib.time_of_flight(v0, angle):.2f} s')
print(f'  Height at x=50: {lib.height_at(v0, angle, 50.0):.2f} m')

print()
print('Range vs angle (v0=50 m/s):')
for deg in range(15, 76, 15):
    a = deg * math.pi / 180.0
    print(f'  {deg:2d}° → {lib.range(v0, a):.2f} m')

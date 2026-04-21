import ctypes, os, sys
sys.stdout.reconfigure(encoding='utf-8')

_build = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'build')
_lib = os.path.join(_build, 'statistics.dll')
if not os.path.exists(_lib):
    _lib = os.path.join(_build, 'statistics.so')
if not os.path.exists(_lib):
    print(f'Error: shared library not found in {_build}', file=sys.stderr); sys.exit(1)

lib = ctypes.CDLL(_lib)
Ptr = ctypes.POINTER(ctypes.c_double)

for fn in ('avg', 'spread', 'cv', 'data_range'):
    f = getattr(lib, fn)
    f.argtypes = [Ptr, ctypes.c_int]
    f.restype = ctypes.c_double

for fn in ('z_score', 'normalize'):
    f = getattr(lib, fn)
    f.argtypes = [Ptr, ctypes.c_int, ctypes.c_double]
    f.restype = ctypes.c_double

data = (ctypes.c_double * 8)(2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0)
n = 8

print('Data: [2, 4, 4, 4, 5, 5, 7, 9]')
print(f'  Mean:    {lib.avg(data, n):.4f}')
print(f'  Std dev: {lib.spread(data, n):.4f}')
print(f'  CV:      {lib.cv(data, n):.2f}%')
print(f'  Range:   {lib.data_range(data, n):.1f}')

print('\nZ-scores:')
for i in range(n):
    print(f'  {data[i]:.0f} → z={lib.z_score(data, n, data[i]):.4f}')

print('\nNormalized:')
for i in range(n):
    print(f'  {data[i]:.0f} → {lib.normalize(data, n, data[i]):.4f}')

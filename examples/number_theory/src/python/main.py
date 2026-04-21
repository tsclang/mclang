import ctypes, os, sys
sys.stdout.reconfigure(encoding='utf-8')

_build = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'build')
_lib = os.path.join(_build, 'number_theory.dll')
if not os.path.exists(_lib):
    _lib = os.path.join(_build, 'number_theory.so')
if not os.path.exists(_lib):
    print(f'Error: shared library not found in {_build}', file=sys.stderr); sys.exit(1)

lib = ctypes.CDLL(_lib)

for fn in ('gcd', 'lcm', 'is_even', 'is_odd', 'is_divisible',
           'is_integer', 'is_natural', 'triangular', 'digital_root'):
    f = getattr(lib, fn)
    f.restype = ctypes.c_double

for fn in ('gcd', 'lcm', 'is_divisible'):
    getattr(lib, fn).argtypes = [ctypes.c_double, ctypes.c_double]
for fn in ('is_even', 'is_odd', 'is_integer', 'is_natural', 'triangular', 'digital_root'):
    getattr(lib, fn).argtypes = [ctypes.c_double]

print('GCD / LCM:')
print(f'  gcd(48, 18) = {lib.gcd(48, 18):.0f}')
print(f'  gcd(100, 75) = {lib.gcd(100, 75):.0f}')
print(f'  lcm(4, 6) = {lib.lcm(4, 6):.0f}')
print(f'  lcm(12, 15) = {lib.lcm(12, 15):.0f}')

print('\nDivisibility:')
print(f'  is_even(8) = {lib.is_even(8):.0f}')
print(f'  is_odd(7)  = {lib.is_odd(7):.0f}')
print(f'  17 div 3?  = {lib.is_divisible(17, 3):.0f}')
print(f'  18 div 3?  = {lib.is_divisible(18, 3):.0f}')

print('\nSet membership:')
print(f'  is_integer(3.0)  = {lib.is_integer(3.0):.0f}')
print(f'  is_integer(3.5)  = {lib.is_integer(3.5):.0f}')
print(f'  is_natural(-1.0) = {lib.is_natural(-1.0):.0f}')
print(f'  is_natural(5.0)  = {lib.is_natural(5.0):.0f}')

print('\nTriangular numbers T(1)..T(10):')
print('  ' + ' '.join(f'{lib.triangular(n):.0f}' for n in range(1, 11)))

print('\nDigital roots:')
for n in [0, 1, 9, 10, 18, 19, 100, 493]:
    print(f'  dr({n}) = {lib.digital_root(n):.0f}')

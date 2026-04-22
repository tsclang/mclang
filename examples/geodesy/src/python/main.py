import ctypes, math, os, sys
sys.stdout.reconfigure(encoding='utf-8')

_dir   = os.path.dirname(os.path.abspath(__file__))
_build = os.path.join(_dir, '..', '..', 'build')

_lib_path = os.path.join(_build, 'geodesy.dll')
if not os.path.exists(_lib_path):
    _lib_path = os.path.join(_build, 'geodesy.so')
if not os.path.exists(_lib_path):
    print(f'Error: shared library not found in {_build}', file=sys.stderr)
    sys.exit(1)

lib = ctypes.CDLL(_lib_path)

def _fn4(name):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double] * 4
    fn.restype  = ctypes.c_double
    return fn

def _fn3(name):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double] * 3
    fn.restype  = ctypes.c_double
    return fn

def _fn1(name):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double]
    fn.restype  = ctypes.c_double
    return fn

haversine     = _fn4('haversine')
bearing       = _fn4('bearing')
dest_lat      = lambda lat, lon, brng, d: _setup4('dest_lat')(lat, lon, brng, d)
dest_lon      = lambda lat, lon, brng, d: _setup4('dest_lon')(lat, lon, brng, d)
normal_radius = _fn1('normal_radius')
meridian_radius = _fn1('meridian_radius')

for name in ('dest_lat', 'dest_lon'):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double] * 4
    fn.restype  = ctypes.c_double

for name in ('ecef_x', 'ecef_y', 'ecef_z'):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double] * 3
    fn.restype  = ctypes.c_double

for name in ('cross_track', 'along_track'):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double] * 6
    fn.restype  = ctypes.c_double

DEG = math.pi / 180.0
RAD = 180.0 / math.pi

lat_msk, lon_msk = 55.7558 * DEG, 37.6173 * DEG
lat_lon, lon_lon = 51.5074 * DEG, -0.1278 * DEG

print("=== Geodesy (Python / ctypes) ===")
print(f"Moscow → London")
dist = haversine(lat_msk, lon_msk, lat_lon, lon_lon)
brng = bearing(lat_msk, lon_msk, lat_lon, lon_lon)
print(f"Haversine distance: {dist/1000:.1f} km")
print(f"Initial bearing:    {brng * RAD:.2f}°\n")

print("=== ECEF (Moscow, h=150 m) ===")
h = 150.0
print(f"X = {lib.ecef_x(lat_msk, lon_msk, h):.1f} m")
print(f"Y = {lib.ecef_y(lat_msk, lon_msk, h):.1f} m")
print(f"Z = {lib.ecef_z(lat_msk, lon_msk, h):.1f} m\n")

lat_hel = 60.1699 * DEG
lon_hel = 24.9384 * DEG
print("=== Helsinki cross/along-track from Moscow→London GC ===")
xtd = lib.cross_track(lat_msk, lon_msk, lat_lon, lon_lon, lat_hel, lon_hel)
atd = lib.along_track(lat_msk, lon_msk, lat_lon, lon_lon, lat_hel, lon_hel)
side = "right" if xtd >= 0 else "left"
print(f"Cross-track: {abs(xtd)/1000:.1f} km ({side})")
print(f"Along-track: {atd/1000:.1f} km")

import ctypes
import math
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

_dir   = os.path.dirname(os.path.abspath(__file__))
_build = os.path.join(_dir, '..', '..', 'build')

_lib_path = os.path.join(_build, 'orbital_mechanics.dll')
if not os.path.exists(_lib_path):
    _lib_path = os.path.join(_build, 'orbital_mechanics.so')
if not os.path.exists(_lib_path):
    print(f'Error: shared library not found in {_build}', file=sys.stderr)
    sys.exit(1)

lib = ctypes.CDLL(_lib_path)

# Function signatures
for name, argtypes in [
    ('vis_viva',          [ctypes.c_double, ctypes.c_double]),
    ('period',            [ctypes.c_double]),
    ('ecc_anomaly',       [ctypes.c_double, ctypes.c_double]),
    ('true_anomaly',      [ctypes.c_double, ctypes.c_double]),
    ('orbit_radius',      [ctypes.c_double, ctypes.c_double, ctypes.c_double]),
    ('orbit_x',           [ctypes.c_double, ctypes.c_double, ctypes.c_double]),
    ('orbit_y',           [ctypes.c_double, ctypes.c_double, ctypes.c_double]),
    ('v_escape',          [ctypes.c_double]),
    ('v_circular',        [ctypes.c_double]),
    ('dv1_hohmann',       [ctypes.c_double, ctypes.c_double]),
    ('dv2_hohmann',       [ctypes.c_double, ctypes.c_double]),
    ('dv_total_hohmann',  [ctypes.c_double, ctypes.c_double]),
]:
    fn = getattr(lib, name)
    fn.argtypes = argtypes
    fn.restype  = ctypes.c_double

PI = math.pi

# 1. ISS
a_iss = 6371000.0 + 408000.0
e_iss = 0.0006
T_iss = lib.period(a_iss)
print("=== ISS Orbital Parameters ===")
print(f"Semi-major axis: {a_iss/1000:.0f} km")
print(f"Orbital period:  {T_iss/60:.2f} min  ({T_iss/3600:.2f} hr)")
print(f"Circular speed:  {lib.v_circular(a_iss)/1000:.4f} km/s")
print(f"Escape speed:    {lib.v_escape(a_iss)/1000:.4f} km/s")
print(f"Vis-viva (circ): {lib.vis_viva(a_iss, a_iss)/1000:.4f} km/s\n")

# 2. Kepler
M_anom = PI / 4.0
ecc    = 0.1
E_anom = lib.ecc_anomaly(M_anom, ecc)
nu     = lib.true_anomaly(E_anom, ecc)
print("=== Kepler's Equation (e=0.1, M=π/4) ===")
print(f"Eccentric anomaly E: {E_anom:.6f} rad  ({math.degrees(E_anom):.2f}°)")
print(f"True anomaly ν:      {nu:.6f} rad  ({math.degrees(nu):.2f}°)")
print(f"Verification: {E_anom - ecc*math.sin(E_anom):.8f} (expect {M_anom:.8f})\n")

# 3. Orbital positions
a_orbit = 7000000.0
e_orbit = 0.05
print(f"=== Orbital Positions (a=7000 km, e={e_orbit}) ===")
print(f"{'ν(deg)':>6}  {'r (km)':>10}  {'x (km)':>10}  {'y (km)':>10}  {'v (km/s)':>10}")
for k in range(8):
    nu_k = k * PI / 4.0
    r_k  = lib.orbit_radius(a_orbit, e_orbit, nu_k)
    x_k  = lib.orbit_x(a_orbit, e_orbit, nu_k)
    y_k  = lib.orbit_y(a_orbit, e_orbit, nu_k)
    v_k  = lib.vis_viva(r_k, a_orbit)
    print(f"{math.degrees(nu_k):6.0f}  {r_k/1000:10.2f}  {x_k/1000:10.2f}  {y_k/1000:10.2f}  {v_k/1000:10.4f}")

# 4. Hohmann transfer
r_leo = 6779000.0
r_geo = 42164000.0
dv1 = lib.dv1_hohmann(r_leo, r_geo)
dv2 = lib.dv2_hohmann(r_leo, r_geo)
dvt = lib.dv_total_hohmann(r_leo, r_geo)
a_tr = (r_leo + r_geo) / 2.0
T_tr = lib.period(a_tr)
print(f"\n=== Hohmann Transfer: LEO → GEO ===")
print(f"Δv₁ (LEO burn):  {dv1/1000:+.4f} km/s")
print(f"Δv₂ (GEO circ):  {dv2/1000:+.4f} km/s")
print(f"Δv total:         {dvt/1000:.4f} km/s")
print(f"Transfer time:    {T_tr/2/3600:.2f} hr")

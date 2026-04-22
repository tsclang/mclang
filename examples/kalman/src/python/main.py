import ctypes
import math
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

_dir   = os.path.dirname(os.path.abspath(__file__))
_build = os.path.join(_dir, '..', '..', 'build')

_lib_path = os.path.join(_build, 'kalman.dll')
if not os.path.exists(_lib_path):
    _lib_path = os.path.join(_build, 'kalman.so')
if not os.path.exists(_lib_path):
    print(f'Error: shared library not found in {_build}', file=sys.stderr)
    sys.exit(1)

lib = ctypes.CDLL(_lib_path)

# All functions take and return double
_fns_2 = ['kf_predict_x', 'kf_predict_p', 'kf_innov_cov', 'kf_gain',
          'kf_update_x', 'kf_update_p', 'kf_innov', 'comp_tau']
_fns_3 = ['snr_db']
_fns_4 = ['kf_nis']
_fns_5 = ['comp_filter']

for name in _fns_2:
    f = getattr(lib, name)
    f.argtypes = [ctypes.c_double] * 3
    f.restype  = ctypes.c_double

lib.kf_predict_x.argtypes = [ctypes.c_double] * 4
lib.kf_predict_p.argtypes = [ctypes.c_double] * 3
lib.kf_gain.argtypes      = [ctypes.c_double] * 3
lib.kf_update_x.argtypes  = [ctypes.c_double] * 4
lib.kf_update_p.argtypes  = [ctypes.c_double] * 3
lib.kf_innov.argtypes     = [ctypes.c_double] * 3
lib.kf_innov_cov.argtypes = [ctypes.c_double] * 3
lib.kf_nis.argtypes       = [ctypes.c_double] * 5
lib.snr_db.argtypes       = [ctypes.c_double] * 2
lib.comp_tau.argtypes     = [ctypes.c_double] * 2
lib.comp_filter.argtypes  = [ctypes.c_double] * 5

for name in ['kf_predict_x','kf_predict_p','kf_gain','kf_update_x','kf_update_p',
             'kf_innov','kf_innov_cov','kf_nis','snr_db','comp_tau','comp_filter']:
    getattr(lib, name).restype = ctypes.c_double

# --- Kalman filter demo ---
a, b, u = 1.0, 0.0, 0.0
h = 1.0
q = 0.001
r = 0.5
x = 15.0
p = 1.0

measurements = [19.3, 20.8, 19.7, 20.5, 21.1, 19.6, 20.2, 20.9, 19.4, 20.6]

print("=== Kalman Filter: Temperature Tracking ===")
print(f"True temperature: 20.0 C")
print(f"Initial estimate: {x:.1f} C, p0={p:.1f}")
print()
print(f"{'Step':<5}  {'Measurement':<12}  {'Estimate':<12}  {'Gain':<10}  {'Innovation':<12}")
print(f"{'----':<5}  {'----------- ':<12}  {'--------':<12}  {'----':<10}  {'----------':<12}")

last_z, last_x, last_p = 0.0, 0.0, 0.0
for i, z in enumerate(measurements):
    x_pred = lib.kf_predict_x(x, a, u, b)
    p_pred = lib.kf_predict_p(p, a, q)
    k      = lib.kf_gain(p_pred, h, r)
    innov  = lib.kf_innov(z, x_pred, h)
    x      = lib.kf_update_x(x_pred, k, z, h)
    p      = lib.kf_update_p(p_pred, k, h)
    print(f"{i+1:<5}  {z:<12.4f}  {x:<12.4f}  {k:<10.4f}  {innov:<12.4f}")
    last_z, last_x, last_p = z, x, p

nis = lib.kf_nis(last_z, last_x, h, last_p, r)
print(f"\nNIS (last step): {nis:.4f}")

# --- Complementary filter ---
print("\n=== Complementary Filter (IMU fusion) ===")
gyro_rate   = 0.1
accel_angle = 0.5
alpha       = 0.98
dt          = 0.01
prev        = 0.0

print(f"gyro_rate={gyro_rate:.2f} rad/s, accel={accel_angle:.2f} rad, alpha={alpha:.2f}, dt={dt:.3f} s")
print()
print(f"{'Step':<5}  {'Angle (rad)':<12}")
print(f"{'----':<5}  {'-----------':<12}")
for i in range(5):
    prev = lib.comp_filter(prev, gyro_rate, accel_angle, alpha, dt)
    print(f"{i+1:<5}  {prev:<12.6f}")

tau = lib.comp_tau(dt, 1.0)
print(f"\nalpha from comp_tau(dt={dt:.3f}, T=1.0): {tau:.4f}")

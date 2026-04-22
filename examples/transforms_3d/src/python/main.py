import ctypes
import math
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

_dir   = os.path.dirname(os.path.abspath(__file__))
_build = os.path.join(_dir, '..', '..', 'build')

_lib_path = os.path.join(_build, 'transforms_3d.dll')
if not os.path.exists(_lib_path):
    _lib_path = os.path.join(_build, 'transforms_3d.so')
if not os.path.exists(_lib_path):
    print(f'Error: shared library not found in {_build}', file=sys.stderr)
    sys.exit(1)

lib = ctypes.CDLL(_lib_path)

# All functions take/return double
_d4  = [ctypes.c_double] * 4
_d8  = [ctypes.c_double] * 8
_d9  = [ctypes.c_double] * 9
_d3  = [ctypes.c_double] * 3
_d7  = [ctypes.c_double] * 7

fn_4_sig  = [ctypes.c_double] * 4
fn_8_sig  = [ctypes.c_double] * 8
fn_9_sig  = [ctypes.c_double] * 9

for name in ('qnorm', 'qnorm_w', 'qnorm_x', 'qnorm_y', 'qnorm_z',
             'rmat_00','rmat_01','rmat_02','rmat_10','rmat_11','rmat_12',
             'rmat_20','rmat_21','rmat_22'):
    f = getattr(lib, name)
    f.argtypes = [ctypes.c_double] * 4
    f.restype  = ctypes.c_double

for name in ('qmul_w','qmul_x','qmul_y','qmul_z',
             'slerp_w','slerp_x','slerp_y','slerp_z',
             'qdist'):
    f = getattr(lib, name)
    f.argtypes = [ctypes.c_double] * 8
    f.restype  = ctypes.c_double

lib.slerp_w.argtypes = [ctypes.c_double] * 9
lib.slerp_x.argtypes = [ctypes.c_double] * 9
lib.slerp_y.argtypes = [ctypes.c_double] * 9
lib.slerp_z.argtypes = [ctypes.c_double] * 9
lib.slerp_w.restype  = ctypes.c_double
lib.slerp_x.restype  = ctypes.c_double
lib.slerp_y.restype  = ctypes.c_double
lib.slerp_z.restype  = ctypes.c_double

for name in ('euler_w','euler_x','euler_y','euler_z'):
    f = getattr(lib, name)
    f.argtypes = [ctypes.c_double] * 3
    f.restype  = ctypes.c_double

for name in ('axisangle_w','axisangle_x','axisangle_y','axisangle_z'):
    f = getattr(lib, name)
    f.argtypes = [ctypes.c_double] * 4
    f.restype  = ctypes.c_double

for name in ('rot_vx','rot_vy','rot_vz'):
    f = getattr(lib, name)
    f.argtypes = [ctypes.c_double] * 7
    f.restype  = ctypes.c_double

deg = math.pi / 180.0

# 1. Euler → quaternion
yaw, pitch, roll = 45*deg, 30*deg, 10*deg
ew = lib.euler_w(yaw, pitch, roll)
ex = lib.euler_x(yaw, pitch, roll)
ey = lib.euler_y(yaw, pitch, roll)
ez = lib.euler_z(yaw, pitch, roll)
enorm = lib.qnorm(ew, ex, ey, ez)

print("=== 1. Euler ZYX → Quaternion ===")
print(f"Euler: yaw=45°, pitch=30°, roll=10°")
print(f"Q: (w={ew:.6f}, x={ex:.6f}, y={ey:.6f}, z={ez:.6f})")
print(f"norm: {enorm:.8f} (should be 1.0)\n")

# 2. Rotate (1,0,0) by 90° around Z
qz90w = lib.axisangle_w(0.0, 0.0, 1.0, math.pi/2)
qz90x = lib.axisangle_x(0.0, 0.0, 1.0, math.pi/2)
qz90y = lib.axisangle_y(0.0, 0.0, 1.0, math.pi/2)
qz90z = lib.axisangle_z(0.0, 0.0, 1.0, math.pi/2)
rvx = lib.rot_vx(qz90w, qz90x, qz90y, qz90z, 1.0, 0.0, 0.0)
rvy = lib.rot_vy(qz90w, qz90x, qz90y, qz90z, 1.0, 0.0, 0.0)
rvz = lib.rot_vz(qz90w, qz90x, qz90y, qz90z, 1.0, 0.0, 0.0)
print("=== 2. Rotate (1,0,0) by 90° around Z ===")
print(f"Rotated: ({rvx:.6f}, {rvy:.6f}, {rvz:.6f})")
print("(should be approx (0, 1, 0))\n")

# 3. Compose Q1=90°X, Q2=90°Y
q1w = lib.axisangle_w(1.0, 0.0, 0.0, math.pi/2)
q1x = lib.axisangle_x(1.0, 0.0, 0.0, math.pi/2)
q1y = lib.axisangle_y(1.0, 0.0, 0.0, math.pi/2)
q1z = lib.axisangle_z(1.0, 0.0, 0.0, math.pi/2)
q2w = lib.axisangle_w(0.0, 1.0, 0.0, math.pi/2)
q2x = lib.axisangle_x(0.0, 1.0, 0.0, math.pi/2)
q2y = lib.axisangle_y(0.0, 1.0, 0.0, math.pi/2)
q2z = lib.axisangle_z(0.0, 1.0, 0.0, math.pi/2)
qcw = lib.qmul_w(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z)
qcx = lib.qmul_x(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z)
qcy = lib.qmul_y(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z)
qcz = lib.qmul_z(q2w, q2x, q2y, q2z, q1w, q1x, q1y, q1z)
v2x = lib.rot_vx(qcw, qcx, qcy, qcz, 0.0, 0.0, 1.0)
v2y = lib.rot_vy(qcw, qcx, qcy, qcz, 0.0, 0.0, 1.0)
v2z = lib.rot_vz(qcw, qcx, qcy, qcz, 0.0, 0.0, 1.0)
print("=== 3. Composed Rotation Q2*Q1 ===")
print(f"Q_composed: (w={qcw:.6f}, x={qcx:.6f}, y={qcy:.6f}, z={qcz:.6f})")
print(f"Rotated (0,0,1): ({v2x:.6f}, {v2y:.6f}, {v2z:.6f})")
r00 = lib.rmat_00(qcw,qcx,qcy,qcz); r01=lib.rmat_01(qcw,qcx,qcy,qcz); r02=lib.rmat_02(qcw,qcx,qcy,qcz)
r10 = lib.rmat_10(qcw,qcx,qcy,qcz); r11=lib.rmat_11(qcw,qcx,qcy,qcz); r12=lib.rmat_12(qcw,qcx,qcy,qcz)
r20 = lib.rmat_20(qcw,qcx,qcy,qcz); r21=lib.rmat_21(qcw,qcx,qcy,qcz); r22=lib.rmat_22(qcw,qcx,qcy,qcz)
print(f"Rotation matrix:")
print(f"  [ {r00:8.5f}  {r01:8.5f}  {r02:8.5f} ]")
print(f"  [ {r10:8.5f}  {r11:8.5f}  {r12:8.5f} ]")
print(f"  [ {r20:8.5f}  {r21:8.5f}  {r22:8.5f} ]\n")

# 4. SLERP
print("=== 4. SLERP: identity → 180° around Z ===")
print(f"{'t':<6}  {'w':<10} {'x':<10} {'y':<10} {'z':<10}")
print(f"{'------':<6}  {'--------':<10} {'--------':<10} {'--------':<10} {'--------':<10}")
si_w,si_x,si_y,si_z = 1.0, 0.0, 0.0, 0.0
sq_w,sq_x,sq_y,sq_z = 0.0, 0.0, 0.0, 1.0
for t in [0.0, 0.25, 0.5, 0.75, 1.0]:
    sw = lib.slerp_w(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t)
    sx = lib.slerp_x(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t)
    sy = lib.slerp_y(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t)
    sz = lib.slerp_z(si_w,si_x,si_y,si_z, sq_w,sq_x,sq_y,sq_z, t)
    print(f"{t:<6.2f}  {sw:<10.6f} {sx:<10.6f} {sy:<10.6f} {sz:<10.6f}")

# 5. Angular distance
print("\n=== 5. Angular Distance ===")
q60w = lib.axisangle_w(0.0, 0.0, 1.0, 60*deg)
q60x = lib.axisangle_x(0.0, 0.0, 1.0, 60*deg)
q60y = lib.axisangle_y(0.0, 0.0, 1.0, 60*deg)
q60z = lib.axisangle_z(0.0, 0.0, 1.0, 60*deg)
dist = lib.qdist(1.0, 0.0, 0.0, 0.0, q60w, q60x, q60y, q60z)
print(f"Angular distance (identity vs 60° around Z): {dist:.6f} rad = {math.degrees(dist):.4f}°")

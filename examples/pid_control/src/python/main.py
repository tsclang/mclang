import ctypes, os, sys
sys.stdout.reconfigure(encoding='utf-8')

_dir   = os.path.dirname(os.path.abspath(__file__))
_build = os.path.join(_dir, '..', '..', 'build')

_lib_path = os.path.join(_build, 'pid_control.dll')
if not os.path.exists(_lib_path):
    _lib_path = os.path.join(_build, 'pid_control.so')
if not os.path.exists(_lib_path):
    print(f'Error: shared library not found in {_build}', file=sys.stderr)
    sys.exit(1)

lib = ctypes.CDLL(_lib_path)

def _setup(name, n_args):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double] * n_args
    fn.restype  = ctypes.c_double
    return fn

pid_p                 = _setup('pid_p', 2)
pid_i_step            = _setup('pid_i_step', 4)
pid_d                 = _setup('pid_d', 4)
pid_out               = _setup('pid_out', 7)
pid_integral_clamped  = _setup('pid_integral_clamped', 7)
pid_delta             = _setup('pid_delta', 7)
zn_kp                 = _setup('zn_kp', 1)
zn_ki                 = _setup('zn_ki', 2)
zn_kd                 = _setup('zn_kd', 2)
itae_kp               = _setup('itae_kp', 3)
itae_ki               = _setup('itae_ki', 3)
itae_kd               = _setup('itae_kd', 3)

Kp, Ki, Kd, dt, r = 2.0, 1.0, 0.1, 0.05, 1.0
y = 0.0
integral = 0.0
e_prev = r - y

print("=== PID Step-Response (Python / ctypes) ===")
print(f"Kp={Kp}  Ki={Ki}  Kd={Kd}  dt={dt} s  setpoint={r}\n")
print(f"{'t(s)':<8} {'y':<10} {'e':<10} {'u':<10} {'integral':<10}")
print("-" * 55)

for step in range(121):
    t = step * dt
    e = r - y
    integral = pid_integral_clamped(Ki, e_prev, e, integral, dt, -2.0, 2.0)
    u = pid_out(Kp, Ki, Kd, e, e_prev, integral, dt)
    u = max(-5.0, min(5.0, u))
    y += (u - y) / 1.0 * dt   # first-order plant τ=1
    e_prev = e
    if step % 10 == 0:
        print(f"{t:<8.2f} {y:<10.4f} {e:<10.4f} {u:<10.4f} {integral:<10.4f}")

print("\n=== Ziegler-Nichols (Ku=4.0, Pu=0.8) ===")
Ku, Pu = 4.0, 0.8
print(f"Kp={zn_kp(Ku):.3f}  Ki={zn_ki(Ku, Pu):.3f}  Kd={zn_kd(Ku, Pu):.3f}")

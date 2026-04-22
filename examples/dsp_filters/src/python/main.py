import ctypes
import math
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

_dir   = os.path.dirname(os.path.abspath(__file__))
_build = os.path.join(_dir, '..', '..', 'build')

_lib_path = os.path.join(_build, 'dsp_filters.dll')
if not os.path.exists(_lib_path):
    _lib_path = os.path.join(_build, 'dsp_filters.so')
if not os.path.exists(_lib_path):
    print(f'Error: shared library not found in {_build}', file=sys.stderr)
    sys.exit(1)

lib = ctypes.CDLL(_lib_path)

# Window functions: (n: double, N: double) -> double
for name in ('hann', 'hamming', 'blackman', 'flattop'):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double, ctypes.c_double]
    fn.restype  = ctypes.c_double

# LP kernel functions: (n, N, fc) -> double
for name in ('lp_ideal', 'lp_hann', 'lp_hamming', 'lp_blackman'):
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double]
    fn.restype  = ctypes.c_double

# fir(h, h_len, x, x_len) -> double
lib.fir.argtypes = [
    ctypes.POINTER(ctypes.c_double), ctypes.c_int,
    ctypes.POINTER(ctypes.c_double), ctypes.c_int,
]
lib.fir.restype = ctypes.c_double

# signal_rms(x, x_len, n) -> double
lib.signal_rms.argtypes = [
    ctypes.POINTER(ctypes.c_double), ctypes.c_int,
    ctypes.c_double,
]
lib.signal_rms.restype = ctypes.c_double

N  = 9
fc = 0.2

print("=== Window Coefficients (N=9) ===")
print(f"{'tap':>4}  {'Hann':>10}  {'Hamming':>10}  {'Blackman':>10}  {'Flat-top':>10}")
for n in range(N):
    nd = float(n)
    Nd = float(N)
    print(f"{n:4d}  {lib.hann(nd,Nd):10.6f}  {lib.hamming(nd,Nd):10.6f}"
          f"  {lib.blackman(nd,Nd):10.6f}  {lib.flattop(nd,Nd):10.6f}")

print(f"\n=== 9-tap LPF coefficients (Hann, fc={fc}) ===")
h = []
for n in range(N):
    v = lib.lp_hann(float(n), float(N), fc)
    h.append(v)
    print(f"  h[{n}] = {v:10.6f}")

dc_gain = sum(h)
print(f"  DC gain (sum): {dc_gain:.6f}")

# Build test signal
N_SIG = 64
signal = [math.sin(2*math.pi*0.1*i) + math.sin(2*math.pi*0.4*i) for i in range(N_SIG)]
rms_in = math.sqrt(sum(x*x for x in signal) / N_SIG)

print(f"\n=== Signal Analysis ===")
print(f"Input signal RMS:  {rms_in:.6f}  (low-freq + high-freq)")

# Apply FIR filter
DblArr = ctypes.c_double * N
h_arr  = DblArr(*h)
n_out  = N_SIG - N + 1
filtered = []
for i in range(n_out):
    win = (ctypes.c_double * N)(*signal[i:i+N])
    filtered.append(lib.fir(h_arr, N, win, N))

rms_out = math.sqrt(sum(x*x for x in filtered) / n_out)
attn_db = 20 * math.log10(rms_out / rms_in) if rms_out > 0 else float('-inf')
print(f"Output signal RMS: {rms_out:.6f}  (high-freq attenuated)")
print(f"Attenuation ratio: {attn_db:.2f} dB")

print("\nFirst 12 filtered samples:")
for i, v in enumerate(filtered[:12]):
    print(f"  y[{i:2d}] = {v:8.5f}")

import ctypes
import math
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

_dir   = os.path.dirname(os.path.abspath(__file__))
_build = os.path.join(_dir, '..', '..', 'build')

_lib_path = os.path.join(_build, 'black_scholes.dll')
if not os.path.exists(_lib_path):
    _lib_path = os.path.join(_build, 'black_scholes.so')
if not os.path.exists(_lib_path):
    print(f'Error: shared library not found in {_build}', file=sys.stderr)
    sys.exit(1)

lib = ctypes.CDLL(_lib_path)

# All exported functions take 5 doubles: S, K, r, sigma, T
_fns5 = ('call_price', 'put_price', 'call_delta', 'put_delta',
         'bs_gamma', 'bs_vega', 'call_theta', 'call_rho', 'put_rho')
for name in _fns5:
    fn = getattr(lib, name)
    fn.argtypes = [ctypes.c_double] * 5
    fn.restype  = ctypes.c_double

lib.iv_seed.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double]
lib.iv_seed.restype  = ctypes.c_double

# Parameters
S, K, r, sig, T = 100.0, 100.0, 0.05, 0.20, 1.0

print("=== Black-Scholes Option Pricing (Python / ctypes) ===")
print(f"S={S:.0f}, K={K:.0f}, r={r:.2f}, σ={sig:.2f}, T={T:.1f} yr\n")

cp = lib.call_price(S, K, r, sig, T)
pp = lib.put_price(S, K, r, sig, T)
print(f"Call price: ${cp:.4f}")
print(f"Put  price: ${pp:.4f}")
parity = cp - pp - S + K * math.exp(-r * T)
print(f"Put-Call parity check: {parity:.6f}\n")

print("=== Greeks ===")
print(f"Call Delta:  {lib.call_delta(S, K, r, sig, T):+.4f}")
print(f"Put  Delta:  {lib.put_delta(S, K, r, sig, T):+.4f}")
print(f"Gamma:        {lib.bs_gamma(S, K, r, sig, T):.6f}")
print(f"Vega:         {lib.bs_vega(S, K, r, sig, T):.4f}")
print(f"Call Theta:   {lib.call_theta(S, K, r, sig, T):.4f}")
print(f"Call Rho:     {lib.call_rho(S, K, r, sig, T):.4f}")
print(f"Put  Rho:     {lib.put_rho(S, K, r, sig, T):.4f}")
print(f"IV seed:      {lib.iv_seed(S, K, T):.4f}\n")

strikes = [80.0, 90.0, 100.0, 110.0, 120.0]
vols    = [0.10, 0.20, 0.30]

print("=== Call Price Table ===")
header = f"{'K':>6}  " + "  ".join(f"σ={v*100:.0f}%   " for v in vols)
print(header)
for strike in strikes:
    row = f"{strike:6.0f}  " + "  ".join(
        f"{lib.call_price(S, strike, r, v, T):8.4f}" for v in vols)
    print(row)

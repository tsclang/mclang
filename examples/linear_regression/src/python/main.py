import ctypes
import math
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

_dir   = os.path.dirname(os.path.abspath(__file__))
_build = os.path.join(_dir, '..', '..', 'build')

_lib_path = os.path.join(_build, 'linear_regression.dll')
if not os.path.exists(_lib_path):
    _lib_path = os.path.join(_build, 'linear_regression.so')
if not os.path.exists(_lib_path):
    print(f'Error: shared library not found in {_build}', file=sys.stderr)
    sys.exit(1)

lib = ctypes.CDLL(_lib_path)

# Signatures: array functions take (ptr, len, ptr, len, n)
_arr2 = [ctypes.POINTER(ctypes.c_double), ctypes.c_int,
         ctypes.POINTER(ctypes.c_double), ctypes.c_int,
         ctypes.c_double]
_arr1 = [ctypes.POINTER(ctypes.c_double), ctypes.c_int, ctypes.c_double]
_mat  = [ctypes.POINTER(ctypes.c_double), ctypes.c_int, ctypes.c_int]

for fn in ('lr_slope', 'lr_intercept', 'ss_tot', 'ss_res', 'r_squared', 'rmse', 'pearson'):
    f = getattr(lib, fn)
    f.argtypes = _arr2
    f.restype  = ctypes.c_double

lib.lr_predict.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double]
lib.lr_predict.restype  = ctypes.c_double

lib.xtx_det.argtypes = _mat
lib.xtx_det.restype  = ctypes.c_double

lib.xtx_inv.argtypes = _mat
lib.xtx_inv.restype  = ctypes.POINTER(ctypes.c_double)

# Data
x_data = [50, 60, 70, 80, 90, 100, 110, 120]
y_data = [150, 180, 210, 235, 260, 285, 310, 340]
n = len(x_data)

x_arr = (ctypes.c_double * n)(*x_data)
y_arr = (ctypes.c_double * n)(*y_data)

slope     = lib.lr_slope(x_arr, n, y_arr, n, float(n))
intercept = lib.lr_intercept(x_arr, n, y_arr, n, float(n))
r2        = lib.r_squared(x_arr, n, y_arr, n, float(n))
err_rmse  = lib.rmse(x_arr, n, y_arr, n, float(n))
r         = lib.pearson(x_arr, n, y_arr, n, float(n))

print("=== Linear Regression: House Prices ===")
print(f"Data: area (m²) vs price (k€), n={n}\n")
print(f"Slope:         {slope:.4f} k€/m²")
print(f"Intercept:     {intercept:.4f} k€")
print(f"R²:            {r2:.6f}")
print(f"RMSE:          {err_rmse:.4f} k€")
print(f"Pearson r:     {r:.6f}")
print(f"\nPrediction for 95 m²: {lib.lr_predict(slope, intercept, 95.0):.2f} k€")

print("\n=== Residuals ===")
print(f"{'Area':<8}  {'Price':<8}  {'Predicted':<10}  {'Residual':<10}")
print(f"{'------':<8}  {'-----':<8}  {'---------':<10}  {'--------':<10}")
for xi, yi in zip(x_data, y_data):
    pred  = lib.lr_predict(slope, intercept, float(xi))
    resid = yi - pred
    print(f"{xi:<8.0f}  {yi:<8.0f}  {pred:<10.4f}  {resid:<10.4f}")

# Matrix normal equations
sum_x  = sum(x_data)
sum_x2 = sum(xi**2 for xi in x_data)
sum_y  = sum(y_data)
sum_xy = sum(xi*yi for xi, yi in zip(x_data, y_data))

XtX = (ctypes.c_double * 4)(float(n), float(sum_x), float(sum_x), float(sum_x2))
det_val = lib.xtx_det(XtX, 2, 2)
print(f"\n=== Matrix Normal Equations (X'X) ===")
print(f"X'X = [[{n}, {sum_x}], [{sum_x}, {sum_x2}]]")
print(f"det(X'X) = {det_val:.2f}")

inv_ptr = lib.xtx_inv(XtX, 2, 2)
inv_flat = [inv_ptr[i] for i in range(4)]
print(f"(X'X)^-1 = [[{inv_flat[0]:.6f}, {inv_flat[1]:.6f}], [{inv_flat[2]:.6f}, {inv_flat[3]:.6f}]]")

beta0 = inv_flat[0]*sum_y + inv_flat[1]*sum_xy
beta1 = inv_flat[2]*sum_y + inv_flat[3]*sum_xy
print(f"Coefficients: intercept={beta0:.4f}, slope={beta1:.4f}")

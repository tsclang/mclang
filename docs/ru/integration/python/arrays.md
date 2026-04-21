# Python: передача массивов (ctypes)

---

## Сигнатура в Си

```mc
// math.mc
mean(v: num[]) = sum(v) / v.length
```

```c
mc_num mean(mc_num* v, int v_len);
```

---

## Передача из Python

```python
import ctypes

lib = ctypes.CDLL('./math.so')
lib.mean.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.c_int]
lib.mean.restype  = ctypes.c_double

data = [1.0, 2.0, 3.0, 4.0, 5.0]
arr  = (ctypes.c_double * len(data))(*data)
result = lib.mean(arr, len(data))
print(result)   # 3.0
```

---

## Через numpy

```python
import ctypes
import numpy as np

lib = ctypes.CDLL('./math.so')
lib.mean.argtypes = [
    np.ctypeslib.ndpointer(ctypes.c_double, flags='C_CONTIGUOUS'),
    ctypes.c_int
]
lib.mean.restype = ctypes.c_double

data = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
print(lib.mean(data, len(data)))   # 3.0
```

---

## Матрица (num[][])

```mc
trace(A: num[][]) = ...
```

```python
lib.trace.argtypes = [
    ctypes.POINTER(ctypes.c_double),  # A (row-major)
    ctypes.c_int,                     # A_rows
    ctypes.c_int                      # A_cols
]
lib.trace.restype = ctypes.c_double

A = [1.0, 0.0, 0.0,
     0.0, 1.0, 0.0,
     0.0, 0.0, 1.0]
arr = (ctypes.c_double * 9)(*A)
print(lib.trace(arr, 3, 3))   # 3.0
```

---

## Смотри aussi

- [load](load.md) · [scalars](scalars.md) · [multireturn](multireturn.md)

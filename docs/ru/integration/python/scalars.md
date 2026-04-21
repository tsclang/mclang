# Python: скалярные типы (argtypes / restype)

---

## Типы ctypes

| mc_num | ctypes |
|--------|--------|
| `double` (f64) | `ctypes.c_double` |
| `float` (f32) | `ctypes.c_float` |
| `int` | `ctypes.c_int` |

---

## Объявление функции

```mc
// math.mc
power(x, n) = x^n
clamp(x, lo, hi) = max(lo, min(hi, x))
```

```python
import ctypes
lib = ctypes.CDLL('./math.so')

lib.power.argtypes = [ctypes.c_double, ctypes.c_double]
lib.power.restype  = ctypes.c_double

lib.clamp.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double]
lib.clamp.restype  = ctypes.c_double
```

---

## Вызов

```python
print(lib.power(2.0, 10.0))   # 1024.0
print(lib.clamp(1.5, 0.0, 1.0))  # 1.0
```

---

## Смешанные типы: int-параметр

```mc
// math.mc
nth_element(v: num[], n: int) = v[n]
```

```python
lib.nth_element.argtypes = [
    ctypes.POINTER(ctypes.c_double),  # v
    ctypes.c_int,                     # v_len
    ctypes.c_int                      # n
]
lib.nth_element.restype = ctypes.c_double
```

---

## Смотри aussi

- [load](load.md) · [arrays](arrays.md)

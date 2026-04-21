# Python: множественный возврат

---

## Сигнатура в Си

```mc
// physics.mc
roots(a, b, c) = \pm sqrt(b^2 - 4*a*c) / (2*a)
```

```c
// Возвращает указатель на статический массив из 2 элементов
mc_num* roots(mc_num a, mc_num b, mc_num c);
```

Функция возвращает `mc_num*` — указатель на `static mc_num _result[2]`.

---

## ctypes: POINTER

```python
import ctypes

lib = ctypes.CDLL('./physics.so')
lib.roots.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double]
lib.roots.restype  = ctypes.POINTER(ctypes.c_double)

ptr = lib.roots(1.0, -5.0, 6.0)   # x^2 - 5x + 6
x1 = ptr[0]   # 3.0
x2 = ptr[1]   # 2.0
print(x1, x2)
```

> Буфер статический — его нужно скопировать до следующего вызова.

---

## Безопасное копирование

```python
result = ptr[:2]   # копирует в список Python [3.0, 2.0]
```

Или через `ctypes.cast` + `from_address`:

```python
Result2 = ctypes.c_double * 2
arr = Result2.from_address(ctypes.addressof(ptr.contents))
x1, x2 = arr[0], arr[1]
```

---

## Функция с явным массивом `[a, b, c]`

```mc
minmax(v: num[]) = [min(v), max(v)]
```

```c
mc_num* minmax(mc_num* v, int v_len);   // возвращает [2]
```

```python
lib.minmax.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.c_int]
lib.minmax.restype  = ctypes.POINTER(ctypes.c_double)

data = [3.0, 1.0, 4.0, 1.0, 5.0]
arr  = (ctypes.c_double * len(data))(*data)
ptr  = lib.minmax(arr, len(data))
lo, hi = ptr[0], ptr[1]
print(lo, hi)   # 1.0  5.0
```

---

## numpy-интеграция

```python
import numpy as np
import ctypes

result_buf = np.empty(2, dtype=np.float64)
ptr = lib.roots(1.0, -5.0, 6.0)
result_buf[:] = [ptr[0], ptr[1]]
print(result_buf)   # [3. 2.]
```

---

## Смотри aussi

- [scalars](scalars.md) · [arrays](arrays.md)
- [Множественный возврат — язык](../../language/functions/multi-return.md)

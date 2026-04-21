# Python: загрузка библиотеки (ctypes)

---

## Шаги

1. Скомпилируй `.mc` → `.c`
2. Собери shared library
3. Загрузи через `ctypes.CDLL`

---

## Компиляция

```bash
mclang math.mc --target shared

# Linux / macOS
gcc -shared -fPIC math.c -lm -o math.so

# Windows
gcc -shared math.c -lm -o math.dll
```

---

## Загрузка

```python
import ctypes
import os

# Определи путь к библиотеке
lib_path = os.path.join(os.path.dirname(__file__), 'math.so')
lib = ctypes.CDLL(lib_path)
```

---

## Windows: `.dll`

```python
import sys
if sys.platform == 'win32':
    lib = ctypes.CDLL('./math.dll')
else:
    lib = ctypes.CDLL('./math.so')
```

---

## Настройка типов и вызов

```python
lib.circle_area.argtypes = [ctypes.c_double]
lib.circle_area.restype  = ctypes.c_double

result = lib.circle_area(5.0)
print(f"Площадь: {result:.4f}")   # 78.5398
```

---

## Полный пример

```python
import ctypes, os, sys

def load_math():
    ext = '.dll' if sys.platform == 'win32' else '.so'
    lib = ctypes.CDLL(os.path.join(os.path.dirname(__file__), 'math' + ext))

    lib.circle_area.argtypes = [ctypes.c_double]
    lib.circle_area.restype  = ctypes.c_double

    lib.circle_perimeter.argtypes = [ctypes.c_double]
    lib.circle_perimeter.restype  = ctypes.c_double

    return lib

lib = load_math()
r = 5.0
print(f"Площадь:    {lib.circle_area(r):.4f}")
print(f"Периметр:   {lib.circle_perimeter(r):.4f}")
```

---

## Смотри aussi

- [Скаляры](scalars.md) · [Массивы](arrays.md) · [Множественный возврат](multireturn.md)
- [C: shared](../c/shared.md)

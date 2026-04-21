# Shared library (.so / .dll)

---

## Компиляция

```bash
mclang math.mc --target shared
```

Генерирует `math.c`, `math.h` и `math_loader.py` (заглушка ctypes).

### Linux / macOS

```bash
gcc -shared -fPIC math.c -lm -o math.so
```

### Windows (MinGW)

```bash
gcc -shared math.c -lm -o math.dll
```

---

## Использование из C

```c
// Подключи .so/.dll динамически через dlopen / LoadLibrary
// или статически через math.h

#include "math.h"
// Компилируй вместе: gcc main.c -L. -lmath -lm -o demo
```

---

## Использование из Python

```python
import ctypes
lib = ctypes.CDLL('./math.so')

lib.circle_area.argtypes = [ctypes.c_double]
lib.circle_area.restype  = ctypes.c_double

r = lib.circle_area(5.0)
print(f"Площадь: {r:.4f}")
```

Подробнее: [Python: load](../python/load.md).

---

## Экспортируемые символы

Все публичные функции (не `_prefix`) экспортируются. Приватные (`_имя`) объявляются `static` и **не экспортируются**.

---

## Смотри aussi

- [compile](compile.md)
- [Python: load](../python/load.md)
- [JavaScript: emcc](../js/emcc.md)

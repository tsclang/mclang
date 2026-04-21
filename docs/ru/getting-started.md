# Установка и быстрый старт

## Требования

- Node.js 18+
- GCC (для компиляции сгенерированного Си-кода)
- Python 3.8+ (опционально, для ctypes-интеграции)
- Emscripten (опционально, для WebAssembly)

---

## Установка

### Из npm (рекомендуется)

```bash
npm install -g mclang
```

После этого компилятор доступен глобально:

```bash
mclang --version
```

### Из репозитория (для разработчиков)

```bash
git clone https://github.com/your-org/mclang.git
cd mclang
npm install
npm run build
npm link          # делает mclang доступным глобально из локальной сборки
```

---

## Первый файл

Создай файл `hello.mc`:

```
// Площадь круга
circle_area(r) = π * r^2

// Длина окружности
circle_perimeter(r) = 2 * π * r
```

Скомпилируй:

```bash
mclang hello.mc
```

Результат — два файла в той же папке:

```
hello.c
hello.h
```

---

## Сгенерированный код

`hello.h`:

```c
#ifndef HELLO_H
#define HELLO_H

#ifdef MC_USE_FAST_FLOAT
  typedef float mc_num;
#elif defined(MC_USE_8BIT)
  typedef int16_t mc_num;
#else
  typedef double mc_num;
#endif

mc_num circle_area(mc_num r);
mc_num circle_perimeter(mc_num r);

#endif
```

`hello.c`:

```c
#include <math.h>
#include <stdint.h>

// ... вспомогательные функции mc_* ...

mc_num circle_area(mc_num r) {
    return (M_PI * pow(r, 2.0));
}

mc_num circle_perimeter(mc_num r) {
    return ((2.0 * M_PI) * r);
}
```

---

## Использование из C

Создай `main.c`:

```c
#include <stdio.h>
#include "hello.h"

int main(void) {
    double r = 5.0;
    printf("Площадь:    %.4f\n", circle_area(r));
    printf("Периметр:   %.4f\n", circle_perimeter(r));
    return 0;
}
```

Компилируй и запускай:

```bash
gcc hello.c main.c -lm -o demo
./demo
```

```
Площадь:    78.5398
Периметр:   31.4159
```

---

## Использование из Python

Собери shared library:

```bash
# Linux / macOS
gcc -shared -fPIC hello.c -lm -o hello.so

# Windows
gcc -shared hello.c -lm -o hello.dll
```

```python
import ctypes, math, sys

lib = ctypes.CDLL('./hello.dll')   # или './hello.so'

lib.circle_area.argtypes = [ctypes.c_double]
lib.circle_area.restype  = ctypes.c_double

lib.circle_perimeter.argtypes = [ctypes.c_double]
lib.circle_perimeter.restype  = ctypes.c_double

r = 5.0
print(f"Площадь:   {lib.circle_area(r):.4f}")
print(f"Периметр:  {lib.circle_perimeter(r):.4f}")
```

---

## Использование из JavaScript (WebAssembly)

Требует [Emscripten](https://emscripten.org/).

```bash
emcc hello.c \
  -o hello.js \
  -s EXPORTED_FUNCTIONS='["_circle_area","_circle_perimeter"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
  -s ENVIRONMENT='node' \
  -lm
```

```javascript
const Module = require('./hello.js');

Module.onRuntimeInitialized = () => {
  const circle_area      = Module.cwrap('circle_area',      'number', ['number']);
  const circle_perimeter = Module.cwrap('circle_perimeter', 'number', ['number']);

  const r = 5.0;
  console.log(`Площадь:   ${circle_area(r).toFixed(4)}`);
  console.log(`Периметр:  ${circle_perimeter(r).toFixed(4)}`);
};
```

---

## Следующие шаги

- [CLI: все флаги и опции](cli.md)
- [Синтаксис языка](language/syntax/indentation.md)
- [LaTeX-операторы](latex/index.md)
- [Примеры проектов](../../examples/)

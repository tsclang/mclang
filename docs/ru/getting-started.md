# Установка и быстрый старт

## Требования

- Node.js 18+
- GCC (для компиляции сгенерированного Си-кода)
- Python 3.8+ (опционально, для `--target shared`)
- Emscripten (опционально, для `--target wasm`)
- node-gyp (опционально, для `--target node`)
- Rust / Cargo (опционально, для `--target rust`)

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

## Следующие шаги

- [CLI: все флаги и опции](cli.md)
- [Интеграция с Python](integration/python/load.md)
- [Интеграция с JavaScript (Wasm)](integration/js/emcc.md)
- [Интеграция с Node.js (нативный аддон)](integration/node/index.md)
- [Интеграция с Rust](integration/rust/index.md)
- [Синтаксис языка](language/syntax/indentation.md)
- [LaTeX-операторы](latex/index.md)
- [Примеры проектов](../../examples/)

# mclang — Описание проекта

## Что такое mclang

**mclang** (Math C Language) — специализированный компилятор, который транслирует математические формулы в чистый код на языке Си без внешних зависимостей.

Пользователь пишет формулы в декларативном стиле с поддержкой LaTeX-синтаксиса, Unicode-переменных и математических операторов. Компилятор генерирует `.c` + `.h` файлы, которые можно подключить к любому проекту на C, Python или JavaScript/WebAssembly.

---

## Для кого

| Аудитория | Сценарий использования |
|-----------|----------------------|
| Физики, инженеры | Формулы из учебника → библиотека без переписывания |
| Геймдев-разработчики | Математика физики/графики в wasm/native без зависимостей |
| Разработчики встраиваемых систем | STM32, Arduino — код без `<math.h>` |
| Data Scientists | Быстрая векторная математика через Python/ctypes |

---

## Пример: от формулы до кода

### Исходник (`ballistics.mc`)

```
range(v0, θ) = v0^2 * \sin{2θ} / g
  where
    g = 9.81
    θ > 0
    v0 > 0

max_height(v0, θ) = v0^2 * \sin{θ}^2 / (2g)
  where
    g = 9.81
```

### Компиляция

```bash
mclang ballistics.mc
# → ballistics.c, ballistics.h
```

### Использование из C

```c
#include "ballistics.h"

double r = range(50.0, M_PI / 4.0);   // 254.84 м
```

### Использование из Python

```python
import ctypes
lib = ctypes.CDLL('./ballistics.dll')
lib.range.argtypes = [ctypes.c_double, ctypes.c_double]
lib.range.restype  = ctypes.c_double

print(lib.range(50.0, 3.14159 / 4.0))  # 254.84
```

### Использование из JavaScript (WebAssembly)

```javascript
const range = Module.cwrap('range', 'number', ['number', 'number']);
console.log(range(50.0, Math.PI / 4.0));  // 254.84
```

---

## Ключевые особенности языка

### Декларативный стиль

Функции объявляются как математические определения, без `return`:

```
f(x) = x^2 + 2x + 1
```

### LaTeX-синтаксис

Формулы из учебника работают напрямую:

```
quadratic(a, b, c) = \frac{-b ± \sqrt{b^2 - 4ac}}{2a}
```

### Unicode-переменные

Греческие буквы и математические символы — полноправные идентификаторы:

```
wave(λ, ν) = λ * ν
coulomb(q1, q2, r) = k * q1 * q2 / r^2
```

### Блок `where` — локальные определения и guards

```
bmi(mass, height) = mass / height^2
  where
    height > 0
    mass > 0
```

Строки без `=` — guard-условия. При нарушении функция возвращает `NAN`.

### Импорты с неймспейсами

Несколько `.mc`-файлов можно скомпилировать в одну библиотеку без коллизий имён:

```
import "./shapes2d.mc" as s2
import "./shapes3d.mc" as s3
```

Функция `area` из `shapes2d.mc` становится `s2__area`, из `shapes3d.mc` — `s3__area`.

### Адаптивный тип `num`

Один исходник, разные таргеты:

| Таргет | `num` |
|--------|-------|
| PC / JS / Python | `double` |
| STM32 (f32) | `float` |
| Arduino (8-bit) | `int16_t` (fixed-point) |

---

## Pipeline компилятора

```
Scanner → Lexer → Math-Parser → ASI → AST → ConstFold → TypeCheck → C-Generator
```

1. **Scanner** — токенизация, INDENT/DEDENT, Unicode
2. **Lexer** — таблица синонимов, LaTeX → Unicode-токены, disambiguate `|`
3. **Math-Parser** — неявное умножение, `^` → `pow()`, цепочки сравнений
4. **ASI** — авто `;`
5. **AST Builder**
6. **Constant Folder** — свёртка константных выражений
7. **Type Checker** — вывод типов, dispatch `⋅`, проверка размерностей
8. **C-Generator** — `.c` + `.h`

---

## Таргеты

| Команда | Результат | Применение |
|---------|-----------|------------|
| `mclang file.mc` | `file.c` + `file.h` | Статическая линковка с C/C++ |
| `mclang file.mc --target shared` | `file.so` / `file.dll` | Python ctypes, динамическая загрузка |
| `mclang file.mc --target wasm` | `file.js` + `file.wasm` | JavaScript / Node.js |
| `mclang file.mc --precision f32` | `file.c` (float) | STM32, ESP32 |
| `mclang file.mc --precision fixed` | `file.c` (int16_t) | Arduino |

---

## Текущее состояние (v0.1 MVP)

Реализовано:
- Полный pipeline: Lexer → Parser → AST → Codegen
- Все базовые математические операторы и функции
- Блок `where` (definitions + guards)
- Импорты с неймспейсами
- Матричные срезы `m[:,j]` и `m[i,:]`
- 424 теста, все зелёные

В разработке (v2):
- CAS (символьные вычисления)
- Частные производные `\partial`
- Неопределённые интегралы
- Таргеты `--target wasm` и `--target shared` из CLI

# CLI — Интерфейс командной строки

## Синтаксис

```bash
mclang <файл.mc> [опции]
```

---

## Описание

Компилирует `.mc`-файл в Си-код. По умолчанию генерирует `<имя>.c` и `<имя>.h` в той же папке, где находится исходник.

---

## Аргументы

### `<файл.mc>`

Путь к исходному файлу mclang. Обязательный аргумент.

```bash
mclang physics.mc
mclang ./formulas/ballistics.mc
mclang /absolute/path/to/math.mc
```

---

## Опции

### `--target <c|shared|wasm|rust|node>`

Выбор типа выходного файла.

| Значение | Результат | Применение |
|----------|-----------|------------|
| `c` | `file.c` + `file.h` | Статическая линковка (по умолчанию) |
| `shared` | `file.so` / `file.dll` | Python ctypes, динамическая загрузка |
| `wasm` | `file.js` + `file.wasm` | JavaScript / Node.js / браузер (через Emscripten) |
| `rust` | `file.c` + `file.h` + `file_bindings.rs` | Rust FFI |
| `node` | `file.c` + `file.h` + `file_napi.c` + `binding.gyp` + `file_bindings.js` | Node.js нативный аддон (N-API, без Emscripten) |

```bash
mclang physics.mc --target c
mclang physics.mc --target shared
mclang physics.mc --target wasm
mclang physics.mc --target rust
mclang physics.mc --target node
```

### `--precision <f64|f32|fixed>`

Тип числа в сгенерированном Си-коде.

| Значение | Тип в Си | Применение |
|----------|---------|------------|
| `f64` | `double` | PC, JavaScript (по умолчанию) |
| `f32` | `float` | STM32, ESP32, мобильные |
| `fixed` | `int16_t` | Arduino, 8-bit микроконтроллеры |

```bash
mclang physics.mc --precision f64
mclang physics.mc --precision f32
mclang physics.mc --precision fixed
```

### `--out <путь>`

Каталог для выходных файлов. По умолчанию — папка исходника.

```bash
mclang physics.mc --out ./build
mclang physics.mc --out /tmp/generated
```

### `--tokens`

Выводит поток токенов и завершает работу. Полезно при отладке лексера.

```bash
mclang formula.mc --tokens
# Identifier         "f"                  1:0–1:1
# LParen             "("                  1:1–1:2
# ...
```

### `--no-color`

Отключает ANSI-раскраску в сообщениях об ошибках. Удобно для CI или pipe.

```bash
mclang formula.mc --no-color 2>&1 | grep Error
```

### `--explain <КОД>`

Объясняет код ошибки компилятора.

```bash
mclang --explain E030
```

---

## Подкоманда eval

```bash
mclang eval <файл.mc> [вызов]
```

Компилирует файл и сразу вызывает функцию — без написания C-драйвера вручную. Требует `gcc` в PATH.

### Без вызова — список функций

```bash
mclang eval ballistics.mc
# range(v0, angle)
# max_height(v0, angle)
# time_of_flight(v0, angle)
```

### С вызовом — результат

```bash
mclang eval ballistics.mc "range(50, 0.785)"
# range(50, 0.785) = 254.8427
```

Аргументы в скобках — числа через запятую. Кавычки нужны, если в вызове есть пробелы.

---

## Примеры

### Базовая компиляция

```bash
mclang ballistics.mc
# → ballistics.c
# → ballistics.h
```

### Для микроконтроллера

```bash
mclang sensors.mc --precision f32 --out ./stm32/generated
# → stm32/generated/sensors.c
# → stm32/generated/sensors.h
```

### Для Python

```bash
mclang math.mc --target shared
# → math.so (Linux/macOS)
# → math.dll (Windows)
```

### Для WebAssembly

```bash
mclang math.mc --target wasm
# → math.js
# → math.wasm
```

### Для Node.js (нативный аддон)

```bash
mclang math.mc --target node
# → math.c
# → math.h
# → math_napi.c
# → binding.gyp
# → math_bindings.js

npx node-gyp configure build
node main.js  # const math = require('./math_bindings')
```

### Файл с импортами

При наличии `import` в файле компилятор автоматически разрешает зависимости:

```bash
mclang main.mc
# main.mc импортирует "./shapes2d.mc" as s2 и "./shapes3d.mc" as s3
# → main.c (содержит все функции из всех файлов с префиксами s2__ и s3__)
# → main.h
```

---

## Коды выхода

| Код | Описание |
|-----|----------|
| `0` | Успех |
| `1` | Ошибка компиляции (синтаксис, типы) |
| `2` | Файл не найден |
| `3` | Ошибка записи выходного файла |

---

## Частые ошибки

### Ошибка: файл не найден

```bash
mclang typo.mc
```

```
Error: Cannot read file 'typo.mc': No such file or directory
```

### Исправление

Проверь путь к файлу:

```bash
ls *.mc          # убедись, что файл существует
mclang correct.mc
```

---

### Ошибка: синтаксическая ошибка в исходнике

```bash
mclang bad.mc
```

```
Error [bad.mc:3]: Unexpected token '='
  f(x) == x^2
       ^^
```

### Исправление

```
f(x) = x^2
```

---

### Ошибка: неизвестный LaTeX-оператор

```bash
mclang formula.mc
```

```
Error [formula.mc:1]: Unknown LaTeX command '\unknown'
  y = \unknown{x}
      ^^^^^^^^
```

### Исправление

Используй только [поддерживаемые LaTeX-операторы](latex/index.md).

---

## См. также

- [Установка и первый запуск](getting-started.md)
- [Синтаксис языка](language/syntax/indentation.md)
- [Интеграция с C](integration/c/compile.md)
- [Интеграция с Python](integration/python/load.md)
- [Интеграция с JavaScript (Wasm)](integration/js/emcc.md)
- [Интеграция с Node.js (нативный аддон)](integration/node/index.md)
- [Интеграция с Rust](integration/rust/index.md)

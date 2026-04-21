# Интеграция с Node.js (нативный аддон)

mclang компилирует `.mc`-файл в `.c` + `.h` + N-API-обёртку — нативный аддон для Node.js без WebAssembly и без Emscripten.

---

## Быстрый старт

### 1. Скомпилировать с таргетом node

```bash
mclang physics.mc --target node
# → physics.c
# → physics.h
# → physics_napi.c
# → binding.gyp
# → physics_bindings.js
```

### 2. Собрать нативный аддон

```bash
npm install --save-dev node-gyp
npx node-gyp configure build
```

### 3. Использовать в коде

```js
const physics = require('./physics_bindings');

console.log(physics.range(50, Math.PI / 4));
```

---

## Пример: баллистика

**ballistics.mc:**
```mc
range(v0, angle) = v0^2 * sin(2*angle) / 9.81
max_height(v0, angle) = v0^2 * sin(angle)^2 / (2*9.81)
time_of_flight(v0, angle) = 2 * v0 * sin(angle) / 9.81
```

```bash
mclang ballistics.mc --target node
npx node-gyp configure build
```

**main.js:**
```js
const b = require('./ballistics_bindings');

const v0    = 50.0;
const angle = Math.PI / 4;

console.log(`Range:          ${b.range(v0, angle).toFixed(2)} m`);
console.log(`Max height:     ${b.max_height(v0, angle).toFixed(2)} m`);
console.log(`Time of flight: ${b.time_of_flight(v0, angle).toFixed(2)} s`);
```

---

## Генерируемые файлы

| Файл | Назначение |
|------|------------|
| `name.c` + `name.h` | Си-реализация (как всегда) |
| `name_napi.c` | N-API C-обёртки для каждой экспортируемой функции |
| `binding.gyp` | Конфиг сборки node-gyp |
| `name_bindings.js` | JS-загрузчик с JSDoc-типами |

---

## Маппинг типов

### Параметры

| mclang | JS (входной) | Как передаётся в C |
|--------|--------------|--------------------|
| `num` | `number` | `double` → `mc_num` |
| `int` | `number` | `double` → `int` |
| `num[]` | `Float64Array` | `mc_num*` + `int len` |
| `num[][]` | `Float64Array`, `number`, `number` | `mc_num*` + `int rows` + `int cols` |

Матрица передаётся тремя аргументами: плоский `Float64Array` (данные построчно), число строк, число столбцов.

### Возвращаемые значения

| mclang | JS (выходной) |
|--------|---------------|
| `num` / `int` | `number` |
| `num[2]` (`\pm`) | `Float64Array` (2 элемента) |
| `[a, b, c]` | `Float64Array` (N элементов) |
| `cross(...)` | `Float64Array` (3 элемента) |
| Массив неизвестного размера | `Float64Array` + доп. параметр `outSize: number` |

---

## Пример с массивом

**statistics.mc:**
```mc
avg(v: num[], n) = sum(v) / n
```

**main.js:**
```js
const s = require('./statistics_bindings');

const data = new Float64Array([2, 4, 4, 4, 5, 5, 7, 9]);
console.log(s.avg(data, data.length));  // 5
```

Массив передаётся как `Float64Array` — дополнительный параметр длины подставляется в C автоматически.

---

## Пример с матрицей

**linalg.mc:**
```mc
trace(m: num[][], n) = m[0,0] + m[1,1]
```

**main.js:**
```js
const la = require('./linalg_bindings');

// Матрица 2×2: [[1,2],[3,4]]
const m = new Float64Array([1, 2, 3, 4]);
console.log(la.trace(m, 2, 2));  // 5
```

---

## Функции с параметрами по умолчанию

```mc
f(x, y = 0.0) = x + y
```

Генерирует несколько JS-функций:

| JS-имя | Параметры | Описание |
|--------|-----------|----------|
| `f` | `(x)` | `y` заполняется дефолтом `0.0` |
| `f_impl` | `(x, y)` | все параметры явно |

```js
const lib = require('./lib_bindings');

lib.f(5);          // 5.0 (y = 0.0)
lib.f_impl(5, 3);  // 8.0 (y = 3.0)
```

---

## Точность

```bash
mclang sensors.mc --target node --precision f32
# mc_num → float в C (все вычисления в float)
# JS по-прежнему получает number (double)
```

---

## binding.gyp

Генерируется автоматически. Пример для `ballistics`:

```json
{
  "targets": [
    {
      "target_name": "ballistics",
      "sources": [ "ballistics.c", "ballistics_napi.c" ],
      "conditions": [
        ["OS!='win'", { "libraries": ["-lm"] }]
      ]
    }
  ]
}
```

На Windows `-lm` не нужен — математика входит в MSVCRT.

---

## Чем отличается от --target wasm

| | `--target wasm` | `--target node` |
|-|-----------------|-----------------|
| Инструмент сборки | Emscripten (`emcc`) | node-gyp (GCC/MSVC) |
| Среда выполнения | WebAssembly | Native (`.node` аддон) |
| Браузер | Да | Нет |
| Node.js | Да | Да |
| Передача массива | Через HEAPF64 + malloc | `Float64Array` напрямую |
| Зависимости | Emscripten SDK | node-gyp + компилятор C |
| Производительность | Близко к native | Native |

`--target node` проще в использовании когда нужен только Node.js: нет Emscripten, массивы передаются напрямую без работы с кучей Wasm.

---

## Смотри также

- [Интеграция с C](../c/compile.md)
- [Интеграция с Python](../python/load.md)
- [Интеграция с Rust](../rust/index.md)
- [Интеграция с JavaScript (Wasm)](../js/emcc.md)
- [CLI](../../cli.md)

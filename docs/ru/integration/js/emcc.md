# JS/Wasm: компиляция через emcc

---

## Требования

- [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) установлен и активирован
- `emcc` доступен в PATH (`emcc --version`)

---

## Компиляция

```bash
# Генерируем Си-код
mclang ballistics.mc

# Компилируем в Wasm
emcc ballistics.c \
  -O2 \
  -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_range","_max_height","_time_of_flight"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap","ccall"]' \
  -o ballistics.js
```

Emscripten генерирует два файла:
- `ballistics.js` — загрузчик (CommonJS или ESM)
- `ballistics.wasm` — скомпилированный модуль

---

## EXPORTED_FUNCTIONS

Каждая экспортируемая функция должна быть в списке с префиксом `_`:

```bash
-s EXPORTED_FUNCTIONS='["_range","_max_height","_gcd","_mean"]'
```

Функции с префиксом `_` в mclang (приватные) не экспортируются в `.h` —  
не нужно добавлять их в список.

---

## Флаги компиляции

| Флаг | Назначение |
|------|-----------|
| `-O2` | Оптимизация (рекомендуется) |
| `-s WASM=1` | Генерировать `.wasm` (по умолчанию `1`) |
| `-s ALLOW_MEMORY_GROWTH=1` | Динамически увеличивать heap |
| `-s INITIAL_MEMORY=16777216` | Начальный размер heap (16 MB) |
| `--no-entry` | Нет функции `main` (для библиотек) |
| `-s MODULARIZE=1` | Обернуть в ES-модуль-фабрику |
| `-s EXPORT_NAME='"MclangModule"'` | Имя фабрики при MODULARIZE |

---

## Пример с MODULARIZE

```bash
emcc ballistics.c \
  -O2 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME='"Ballistics"' \
  -s EXPORTED_FUNCTIONS='["_range","_max_height"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
  -o ballistics.js
```

```javascript
import Ballistics from './ballistics.js';

const M = await Ballistics();
const range = M.cwrap('range', 'number', ['number', 'number']);
console.log(range(50, 0.785));   // 254.84
```

---

## Смотри aussi

- [cwrap](cwrap.md) · [heap](heap.md) · [module](module.md)

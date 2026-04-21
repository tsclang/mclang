# JS/Wasm: загрузка модуля (CJS / ESM)

---

## Два формата вывода Emscripten

| Режим | Флаг | Использование |
|-------|------|--------------|
| CJS (по умолчанию) | — | `require('./lib.js')` |
| ESM с MODULARIZE | `-s MODULARIZE=1` | `await factory()` |

---

## CommonJS (Node.js)

```bash
emcc ballistics.c -O2 \
  -s EXPORTED_FUNCTIONS='["_range"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
  -o ballistics.js
```

```javascript
const Module = require('./ballistics.js');

Module.onRuntimeInitialized = () => {
  const range = Module.cwrap('range', 'number', ['number', 'number']);
  console.log(range(50, 0.785));
};
```

---

## MODULARIZE (ESM / async)

```bash
emcc ballistics.c -O2 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME='"Ballistics"' \
  -s EXPORTED_FUNCTIONS='["_range"]' \
  -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
  -o ballistics.js
```

```javascript
// Node.js / браузер с type="module"
import createBallistics from './ballistics.js';

const M = await createBallistics();
const range = M.cwrap('range', 'number', ['number', 'number']);
console.log(range(50, 0.785));
```

---

## Браузер без сборщика

```html
<script src="ballistics.js"></script>
<script>
  Module.onRuntimeInitialized = () => {
    const range = Module.cwrap('range', 'number', ['number', 'number']);
    document.getElementById('out').textContent = range(50, 0.785).toFixed(2);
  };
</script>
```

> `ballistics.js` ожидает `ballistics.wasm` рядом.  
> При локальном запуске нужен HTTP-сервер (`python -m http.server`).

---

## Локальный package.json (ESM workaround)

Если Node.js выдаёт ошибку `require() of ES module`:

```json
// ballistics/package.json
{ "type": "commonjs" }
```

Или при использовании MODULARIZE добавить в корневой `package.json`:

```json
{ "type": "module" }
```

---

## Ожидание готовности без колбека

```javascript
// Через Promise (удобно с async/await)
await new Promise(resolve => { Module.onRuntimeInitialized = resolve; });
const range = Module.cwrap('range', 'number', ['number', 'number']);
```

---

## Типичная структура проекта

```
dist/
  ballistics.js     # загрузчик
  ballistics.wasm   # модуль
src/
  index.js          # ваш код
```

```javascript
// src/index.js
const Module = require('../dist/ballistics.js');
await new Promise(r => { Module.onRuntimeInitialized = r; });

const range = Module.cwrap('range', 'number', ['number', 'number']);
console.log(range(50, Math.PI / 4));
```

---

## Смотри aussi

- [emcc](emcc.md) · [cwrap](cwrap.md) · [heap](heap.md)

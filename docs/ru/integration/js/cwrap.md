# JS/Wasm: Module.cwrap

---

## Что такое cwrap

`Module.cwrap` оборачивает C-функцию в обычную JS-функцию.  
Работает только для скалярных аргументов и возвращаемых значений.

```javascript
const fn = Module.cwrap(name, returnType, argTypes);
```

| Параметр | Тип | Значение |
|----------|-----|---------|
| `name` | string | Имя C-функции (без `_`) |
| `returnType` | `'number'` \| `'string'` \| `null` | Тип результата |
| `argTypes` | `string[]` | Типы аргументов |

Для `mc_num` (double) и `int` используется `'number'`.

---

## Загрузка модуля

```javascript
// Node.js (CommonJS)
const Module = require('./ballistics.js');

// Или с await (ES-модуль / MODULARIZE=1)
const Module = await import('./ballistics.js');
```

> Wasm-модуль инициализируется асинхронно. Дождитесь `Module.ready`:

```javascript
const Module = require('./ballistics.js');
Module.onRuntimeInitialized = () => {
  const range = Module.cwrap('range', 'number', ['number', 'number']);
  console.log(range(50, 0.785));   // 254.84
};
```

---

## Скалярные функции

```mc
// ballistics.mc
range(v0, angle) = v0^2 * sin(2 * angle) / g
  where g = 9.81
```

```javascript
const range = Module.cwrap('range', 'number', ['number', 'number']);
console.log(range(50, 0.785));   // 254.84...
```

---

## Несколько функций

```javascript
const range    = Module.cwrap('range',    'number', ['number', 'number']);
const height   = Module.cwrap('max_height', 'number', ['number', 'number']);
const flight   = Module.cwrap('time_of_flight', 'number', ['number', 'number']);

const v0    = 50;
const angle = Math.PI / 4;
console.log(range(v0, angle));    // 254.84
console.log(height(v0, angle));   // 63.71
console.log(flight(v0, angle));   // 7.21
```

---

## ccall — одноразовый вызов

```javascript
const result = Module.ccall(
  'range',           // имя функции
  'number',          // тип возврата
  ['number', 'number'],  // типы аргументов
  [50, 0.785]        // значения
);
console.log(result);   // 254.84
```

`ccall` удобен для однократного вызова, `cwrap` — для многократного.

---

## Ограничения

- Массивы (`num[]`) нельзя передать через cwrap напрямую — нужно [heap](heap.md)
- Строки (тип `'string'`) для mclang не используются
- `'number'` покрывает и `double`, и `int`, и `pointer` (для массивов)

---

## Смотри aussi

- [emcc](emcc.md) · [heap](heap.md) · [module](module.md)

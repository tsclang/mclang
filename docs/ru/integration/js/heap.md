# JS/Wasm: HEAPF64, массивы

---

## Зачем нужен heap

`cwrap` передаёт только числа. Для массивов (`num[]`, `num[][]`)  
нужно вручную выделить память в Wasm-heap и передать указатель.

---

## Сигнатура в Си

```mc
// math.mc
mean(v: num[]) = sum(v) / v.length
```

```c
mc_num mean(mc_num* v, int v_len);
```

---

## HEAPF64: основная техника

```javascript
const mean = Module.cwrap('mean', 'number', ['number', 'number']);

function callWithArray(fn, data) {
  const n    = data.length;
  const ptr  = Module._malloc(n * 8);       // 8 байт = sizeof(double)
  const heap = Module.HEAPF64;
  const off  = ptr / 8;                      // смещение в Float64Array

  for (let i = 0; i < n; i++) heap[off + i] = data[i];

  const result = fn(ptr, n);
  Module._free(ptr);
  return result;
}

console.log(callWithArray(mean, [1, 2, 3, 4, 5]));   // 3.0
```

---

## Через Float64Array (быстрее)

```javascript
function callWithArray(fn, data) {
  const n   = data.length;
  const ptr = Module._malloc(n * 8);
  Module.HEAPF64.set(data, ptr >> 3);   // ptr >> 3 = ptr / 8
  const res = fn(ptr, n);
  Module._free(ptr);
  return res;
}
```

---

## Матрица (row-major)

```mc
trace(A: num[][]) = ...
```

```javascript
const trace = Module.cwrap('trace', 'number', ['number', 'number', 'number']);

function callWithMatrix(fn, matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const flat = matrix.flat();           // разворачиваем в row-major
  const ptr  = Module._malloc(flat.length * 8);
  Module.HEAPF64.set(flat, ptr >> 3);
  const res = fn(ptr, rows, cols);
  Module._free(ptr);
  return res;
}

const A = [[1,0,0],[0,1,0],[0,0,1]];
console.log(callWithMatrix(trace, A));   // 3.0
```

---

## Множественный возврат

```mc
roots(a, b, c) = \pm sqrt(b^2 - 4*a*c) / (2*a)
```

Функция возвращает указатель на `static mc_num[2]`:

```javascript
const roots = Module.cwrap('roots', 'number', ['number', 'number', 'number']);

const ptr = roots(1, -5, 6);             // указатель (число)
const off = ptr >> 3;
const x1  = Module.HEAPF64[off];        // 3.0
const x2  = Module.HEAPF64[off + 1];   // 2.0
console.log(x1, x2);
```

> Указатель на статический буфер — читать до следующего вызова функции.

---

## Таблица HEAP-типов

| Тип C | HEAP-представление | Шаг (байт) | Сдвиг |
|-------|--------------------|-----------|-------|
| `double` | `HEAPF64` | 8 | `>> 3` |
| `float` | `HEAPF32` | 4 | `>> 2` |
| `int32` | `HEAP32` | 4 | `>> 2` |
| `uint8` | `HEAPU8` | 1 | — |

---

## Смотри aussi

- [emcc](emcc.md) · [cwrap](cwrap.md) · [module](module.md)

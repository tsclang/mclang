# \cdot

---

## Синтаксис

```latex
A \cdot B
```

---

## Трансляция

Диспатч по типу — смотри [Оператор ⋅](../../operators/special/dot.md):

| Типы | Результат |
|------|-----------|
| `num \cdot num` | `a * b` |
| `num[] \cdot num[]` | `mc_dot(a, b, n)` |
| `num[][] \cdot num[][]` | `mc_matmul(...)` |

---

## Примеры

```mc
f(a: num[], b: num[]) = a \cdot b   // dot product
g(A: num[][], B: num[][]) = A \cdot B // matmul
```

---

## Смотри aussi

- [Оператор ⋅](../../operators/special/dot.md)

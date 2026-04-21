# Оператор ⋅ (dispatch по типу)

Оператор `⋅` (`\cdot`) автоматически выбирает операцию по типам операндов.

---

## Синтаксис

```mc
a ⋅ b
a \cdot b   // LaTeX
```

---

## Диспатч по типу

| Типы | Операция | Си-код |
|------|----------|--------|
| `num ⋅ num` | умножение | `a * b` |
| `num[] ⋅ num[]` | скалярное произведение | `mc_dot(a, b, n)` |
| `num[][] ⋅ num[][]` | матричное умножение | `mc_matmul(A, B, C, ...)` |
| `num ⋅ num[]` | масштабирование | `mc_scale(a, b, ...)` |

---

## Скаляры

```mc
f(x, y) = x ⋅ y   // → x * y
```

---

## Скалярное произведение векторов

```mc
dot_product(a: num[], b: num[]) = a ⋅ b
```

```c
mc_num dot_product(mc_num* a, int a_len, mc_num* b, int b_len) {
    return mc_dot(a, b, a_len);
}
```

---

## Матричное умножение

```mc
mat_mul(A: num[][], B: num[][]) = A ⋅ B
```

```c
mc_num* mat_mul(mc_num* A, int A_rows, int A_cols,
                mc_num* B, int B_rows, int B_cols) {
    static mc_num _C[/* A_rows * B_cols */];
    mc_matmul(A, B, _C, A_rows, A_cols, B_cols);
    return _C;
}
```

---

## Физическая нотация

```mc
work(F: num[], d: num[]) = F ⋅ d   // работа = скалярное произведение
```

---

## Смотри aussi

- [Умножение *](../arithmetic/mul.md)
- [Функции: dot](../../functions/vector/dot.md)
- [Матричное умножение](../../functions/matrix/matmul.md)

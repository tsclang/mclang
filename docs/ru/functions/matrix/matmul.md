# Матричное умножение

---

## Синтаксис

```mc
A ⋅ B           // оператор (диспатч по типу)
```

Явной функции `matmul` нет — используй оператор `⋅`.

---

## Пример

```mc
product(A: num[][], B: num[][]) = A ⋅ B
```

```c
mc_num* product(mc_num* A, int A_rows, int A_cols,
                mc_num* B, int B_rows, int B_cols) {
    static mc_num _C[/* A_rows * B_cols */];
    mc_matmul(A, B, _C, A_rows, A_cols, B_cols);
    return _C;
}
```

Реализация `mc_matmul`:

```c
static inline void mc_matmul(const mc_num* A, const mc_num* B, mc_num* C,
    int rows, int inner, int cols) {
    for (int i = 0; i < rows; i++)
        for (int j = 0; j < cols; j++) {
            mc_num s = 0.0;
            for (int k = 0; k < inner; k++) s += A[i*inner+k] * B[k*cols+j];
            C[i*cols+j] = s;
        }
}
```

---

## Условие совместимости

`cols(A)` должен равняться `rows(B)`. Нарушение — UB.

---

## Применение

```mc
// Трансформация вектора матрицей
transform(M: num[][], v: num[]) = M ⋅ v

// Цепочка трансформаций
compose(A: num[][], B: num[][], C: num[][]) = A ⋅ B ⋅ C
```

---

## Смотри aussi

- [transpose](transpose.md) · [inv](inv.md)
- [Оператор ⋅](../../operators/special/dot.md)

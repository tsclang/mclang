# Оператор * (умножение)

---

## Синтаксис

```mc
a * b
a ⋅ b    // диспатч по типу
a .* b   // поэлементное
```

---

## Скалярное умножение

```mc
f(x, y) = x * y
```

```c
mc_num f(mc_num x, mc_num y) { return x * y; }
```

---

## Умножение на скаляр (вектор)

```mc
scale(v: num[], s) = s * v
```

```c
mc_num* scale(mc_num* v, int v_len, mc_num s) {
    static mc_num _r[/* v_len */];
    for (int i = 0; i < v_len; i++) _r[i] = s * v[i];
    return _r;
}
```

---

## Поэлементное умножение `.*`

```mc
hadamard(a: num[], b: num[]) = a .* b
```

---

## `⋅` — диспатч по типу

Оператор `⋅` (`\cdot`) определяет операцию автоматически:

| Типы | Результат |
|------|-----------|
| `num ⋅ num` | умножение скаляров |
| `num[] ⋅ num[]` | скалярное произведение (dot product) |
| `num[][] ⋅ num[][]` | матричное умножение |

```mc
dot_product(a: num[], b: num[]) = a ⋅ b   // → dot(a, b)
mat_product(A: num[][], B: num[][]) = A ⋅ B // → matmul
```

Подробнее: [Оператор ⋅](../special/dot.md).

---

## Смотри aussi

- [Неявное умножение](implicit-mul.md)
- [Оператор ⋅](../special/dot.md)
- [Деление](div.md)

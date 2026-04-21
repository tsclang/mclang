# Оператор ⨯ (векторное произведение)

---

## Синтаксис

```mc
a ⨯ b
a \times b   // LaTeX
cross(a, b)  // функциональный эквивалент
```

---

## Определение

Векторное произведение двух 3D-векторов:

```
a ⨯ b = [a₁b₂ - a₂b₁,
          a₂b₀ - a₀b₂,
          a₀b₁ - a₁b₀]
```

---

## Пример

```mc
normal(a: num[], b: num[]) = a ⨯ b
```

```c
mc_num* normal(mc_num* a, int a_len, mc_num* b, int b_len) {
    static mc_num _r[3];
    mc_cross3(a, b, _r);
    return _r;
}
```

---

## Применение

```mc
// Нормаль к плоскости
plane_normal(p1: num[], p2: num[], p3: num[]) =
    (p2 - p1) ⨯ (p3 - p1)

// Момент силы
torque(r: num[], F: num[]) = r ⨯ F
```

---

## Ограничения

- Только для 3D-векторов (`num[]` длины 3)
- Нет проверки длины в runtime — UB при другой длине

---

## Смотри aussi

- [Функции: cross](../../functions/vector/cross.md)
- [Оператор ⋅](dot.md)

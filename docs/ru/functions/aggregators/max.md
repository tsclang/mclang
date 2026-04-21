# max — максимум

---

## Сигнатуры

```mc
max(v: num[]) → num        // максимум по массиву
max(a: num, b: num) → num  // максимум двух значений
\max(a, b)                 // LaTeX-синоним
\max_{x \in v} expr        // LaTeX-агрегатор по массиву
```

---

## Пример

```mc
f(v: num[]) = max(v)
g(a, b) = max(a, b)

// LaTeX-стиль: максимум произвольного выражения по элементам
peak(v: num[]) = \max_{x \in v} x^2
```

```c
static inline mc_num mc_max_arr(const mc_num* v, int n) {
    if (n <= 0) return NAN;
    mc_num m = v[0];
    for (int i = 1; i < n; i++) if (v[i] > m) m = v[i];
    return m;
}
```

---

## Применение

```mc
// ReLU (нейросети)
relu(x) = max(x, 0)

// Обрезание сверху
clamp_hi(x, hi) = min(x, hi)
```

---

## Смотри aussi

- [min](min.md)

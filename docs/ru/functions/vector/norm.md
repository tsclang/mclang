# norm — евклидова норма вектора

---

## Сигнатура

```mc
norm(v: num[]) → num
|v|                  // оператор-синоним (для векторов)
```

---

## Пример

```mc
length(v: num[]) = norm(v)
```

```c
static inline mc_num mc_norm(const mc_num* v, int n) {
    mc_num s = 0.0;
    for (int i = 0; i < n; i++) s += v[i] * v[i];
    return sqrt(s);
}
```

---

## Применение

```mc
// Нормализация вектора
normalize(v: num[]) = v / norm(v)

// Расстояние между точками
distance(a: num[], b: num[]) = norm(a - b)

// Единичный вектор
unit(v: num[]) = v / norm(v)
```

---

## Смотри aussi

- [dot](dot.md) · [cross](cross.md)
- [abs](../rounding/abs.md) — для скаляров

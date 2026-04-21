# dot — скалярное произведение

---

## Сигнатура

```mc
dot(a: num[], b: num[]) → num
a ⋅ b                        // оператор-синоним (для векторов)
```

---

## Пример

```mc
f(a: num[], b: num[]) = dot(a, b)
```

```c
static inline mc_num mc_dot(const mc_num* a, const mc_num* b, int n) {
    mc_num s = 0.0;
    for (int i = 0; i < n; i++) s += a[i] * b[i];
    return s;
}
```

---

## Геометрический смысл

`dot(a, b) = |a| * |b| * cos(θ)`, где θ — угол между векторами.

---

## Применение

```mc
// Угол между векторами
angle_between(a: num[], b: num[]) =
    arccos(dot(a, b) / (norm(a) * norm(b)))

// Проекция a на b
projection(a: num[], b: num[]) =
    dot(a, b) / norm(b)

// Работа силы
work(F: num[], d: num[]) = dot(F, d)
```

---

## Ошибки

### Разные длины

```mc
dot([1, 2], [1, 2, 3])   // UB: длины не совпадают
```

---

## Смотри aussi

- [cross](cross.md) · [norm](norm.md)
- [Оператор ⋅](../../operators/special/dot.md)

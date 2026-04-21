# cross — векторное произведение

---

## Сигнатура

```mc
cross(a: num[], b: num[]) → num[]
a ⨯ b                           // оператор-синоним
```

Только для 3D-векторов.

---

## Пример

```mc
n(a: num[], b: num[]) = cross(a, b)
```

```c
static inline void mc_cross3(const mc_num* a, const mc_num* b, mc_num* out) {
    out[0] = a[1]*b[2] - a[2]*b[1];
    out[1] = a[2]*b[0] - a[0]*b[2];
    out[2] = a[0]*b[1] - a[1]*b[0];
}
```

---

## Геометрический смысл

`|cross(a,b)| = |a| * |b| * sin(θ)` — площадь параллелограмма.

---

## Применение

```mc
// Нормаль к треугольнику
triangle_normal(p1: num[], p2: num[], p3: num[]) =
    cross(p2 - p1, p3 - p1)

// Момент силы (торк)
torque(r: num[], F: num[]) = cross(r, F)
```

---

## Смотри aussi

- [dot](dot.md) · [norm](norm.md)
- [Оператор ⨯](../../operators/special/cross.md)

# arctan — арктангенс

---

## Сигнатура

```mc
arctan(x: num) → num         // однаргументный
arctan2(y: num, x: num) → num  // двухаргументный
atan(x) / atan2(y, x)        // синонимы
```

Область: ℝ, значения: `(-π/2, π/2)` для `arctan`, `(-π, π]` для `arctan2`.

---

## arctan — угол по тангенсу

```mc
angle(slope) = arctan(slope)
```

```c
mc_num angle(mc_num slope) { return atan(slope); }
```

---

## arctan2 — угол по координатам

Более устойчивый к делению на ноль вариант:

```mc
heading(dx, dy) = arctan2(dy, dx)
polar_angle(x, y) = arctan2(y, x)°
```

```c
mc_num polar_angle(mc_num x, mc_num y) {
    return atan2(y, x) * (180.0 / M_PI);
}
```

Учитывает квадрант: результат в `(-π, π]`.

---

## Применение

```mc
// Угол вектора
direction(vx, vy) = arctan2(vy, vx)

// Геодезический азимут
azimuth(north, east) = arctan2(east, north)
```

---

## Смотри aussi

- [tan](tan.md) · [arccot](arccot.md)

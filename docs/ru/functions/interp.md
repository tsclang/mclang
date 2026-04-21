# interp — линейная интерполяция

---

## Сигнатура

```mc
interp(x: num, xs: num[], ys: num[]) → num
```

---

## Описание

Линейная интерполяция по таблице `(xs, ys)`. Массивы `xs` должны быть отсортированы по возрастанию.

---

## Пример

```mc
// Таблица температура → давление пара
temp_points = [0, 20, 40, 60, 80, 100]
pres_points = [0.6, 2.3, 7.4, 19.9, 47.4, 101.3]

vapor_pressure(T) = interp(T, temp_points, pres_points)

// vapor_pressure(50) → ~12.4 кПа
```

---

## Генерируемый Си-код

```c
static inline mc_num mc_interp(mc_num x,
    const mc_num* xs, const mc_num* ys, int n) {
    if (n <= 0) return NAN;
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n-1]) return ys[n-1];
    for (int i = 0; i < n-1; i++) {
        if (x <= xs[i+1]) {
            mc_num t = (x - xs[i]) / (xs[i+1] - xs[i]);
            return ys[i] + t * (ys[i+1] - ys[i]);
        }
    }
    return ys[n-1];
}
```

---

## Таблица как функция

Таблицы можно вызывать как функции напрямую:

```mc
vapor_pressure = table
    0   → 0.6
    20  → 2.3
    40  → 7.4
    100 → 101.3

p = vapor_pressure(50)   // интерполяция автоматически
```

---

## Экстраполяция

При `x < xs[0]` возвращается `ys[0]`, при `x > xs[last]` — `ys[last]` (без экстраполяции за границы).

---

## Ошибки

### Xs не отсортированы

```mc
xs = [0, 40, 20, 100]   // ошибка: не по возрастанию → неверный результат
```

---

## Смотри aussi

- [Функции: sum](aggregators/sum.md)

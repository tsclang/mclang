# product — произведение элементов массива

---

## Сигнатура

```mc
product(v: num[]) → num
```

---

## Пример

```mc
f(v: num[]) = product(v)
```

```c
static inline mc_num mc_product(const mc_num* v, int n) {
    mc_num p = 1.0;
    for (int i = 0; i < n; i++) p *= v[i];
    return p;
}
```

---

## Применение

```mc
// Геометрическое среднее
geomean(v: num[]) = product(v)^(1 / v.length)

// Факториал через произведение (для демонстрации)
fact(n: int) =
    v = [1..n]   // если поддерживается range-литерал
    product(v)
```

---

## Смотри aussi

- [sum](sum.md)
- [∏ оператор](../../latex/sums/prod-range.md)

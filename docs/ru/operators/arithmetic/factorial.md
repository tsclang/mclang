# Оператор ! (факториал)

---

## Синтаксис

```mc
n!
```

Постфиксный оператор — стоит после выражения.

---

## Пример

```mc
f(n) = n!
```

```c
mc_num f(mc_num n) { return mc_factorial((int)n); }
```

Реализован через предвычисленную таблицу для `n ∈ [0, 20]`:

```c
static inline mc_num mc_factorial(int n) {
    static const double _f[21] = {1, 1, 2, 6, 24, 120, ...};
    return (n >= 0 && n <= 20) ? (mc_num)_f[n] : INFINITY;
}
```

---

## Использование в выражениях

```mc
binom_coeff(n, k) = n! / (k! * (n - k)!)
taylor_cos(x, n) = (-1)^n * x^(2*n) / (2*n)!
```

---

## Ограничения

- `n` должен быть неотрицательным целым
- Для `n > 20` возвращает `INFINITY` (переполнение double)
- Для отрицательных `n` — `NAN`

```mc
// 20! = 2432902008176640000 (максимум в таблице)
// 21! → inf
```

---

## Функциональный эквивалент

```mc
f(n) = factorial(n)   // то же, что n!
```

---

## Комбинаторика

```mc
permutations(n, k) = n! / (n - k)!
combinations(n, k) = n! / (k! * (n - k)!)
```

Для больших значений лучше использовать [`binom(n, k)`](../../functions/combinatorics/binom.md) — он не вычисляет факториалы явно.

---

## Смотри aussi

- [Функции: binom](../../functions/combinatorics/binom.md)
- [Умножение](mul.md)

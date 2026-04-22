# exp — экспонента

---

## Сигнатура

```mc
exp(x: num) → num
\exp{x}              // LaTeX
```

Вычисляет e^x.

---

## Пример

```mc
f(x) = exp(x)
g(x) = e^x      // синоним — компилятор генерирует exp(x)
```

```c
mc_num f(mc_num x) { return exp(x); }
```

---

## Применение

```mc
// Экспоненциальный рост/затухание
growth(x0, k, t) = x0 * exp(k * t)
decay(x0, k, t)  = x0 * exp(-k * t)

// Распределение Гаусса
gaussian(x, mu, sigma) =
    exp(-(x - mu)^2 / (2 * sigma^2)) /
    (sigma * sqrt(2 * π))
```

---

## Смотри aussi

- [ln](ln.md) · [Степень ^](../../operators/arithmetic/pow.md)

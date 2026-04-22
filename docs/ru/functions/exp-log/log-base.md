# log — логарифм по основанию

---

## Сигнатура

```mc
log(base: num, x: num) → num
\log_{base}{x}               // LaTeX (стандартная форма)
\log{base}{x}                // LaTeX (краткая форма)
```

---

## Пример

```mc
f(x) = log(2, x)      // логарифм по основанию 2
g(x) = log(10, x)     // то же что lg(x)
```

```c
mc_num f(mc_num x) { return log(x) / log(2.0); }
```

---

## LaTeX-форма

```mc
bits(x) = \log_{2}{x}        // log₂(x)
```

---

## Применение

```mc
// Количество бит
bits_needed(n) = ceil(log(2, n))

// Музыкальные интервалы
cents(f1, f2) = 1200 * log(2, f2/f1)
```

---

## Ошибки

### Основание равно 1

```mc
f(x) = log(1, x)   // ошибка: log1(x) неопределён
```

---

## Смотри aussi

- [ln](ln.md) · [lg](lg.md)

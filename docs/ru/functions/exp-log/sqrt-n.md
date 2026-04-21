# sqrt(n, x) — корень n-й степени

---

## Сигнатура

```mc
sqrt(n: num, x: num) → num
\sqrt[n]{x}                  // LaTeX
```

---

## Пример

```mc
cube_root(x) = sqrt(3, x)
```

```c
mc_num cube_root(mc_num x) { return pow(x, 1.0 / 3.0); }
```

---

## Генерируемый Си-код

`sqrt(n, x)` всегда генерирует `pow(x, 1.0/n)`.

---

## Примеры

```mc
// Корень 5-й степени
f(x) = sqrt(5, x)      // pow(x, 0.2)
f(x) = \sqrt[5]{x}     // LaTeX-форма

// Геометрическое среднее n чисел
geomean(v: num[], n: int) = sqrt(n, product(v))
```

---

## Ошибки

### Чётный корень из отрицательного числа

```mc
f(x) = sqrt(2, -4)   // → nan (нет вещественного результата)
```

---

## Смотри aussi

- [sqrt](sqrt.md) · [Степень ^](../../operators/arithmetic/pow.md)
- [LaTeX: \sqrt[n]](../../latex/arithmetic/sqrt-n.md)

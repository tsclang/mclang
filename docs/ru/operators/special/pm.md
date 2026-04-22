# Оператор \pm (плюс-минус)

Возвращает массив из двух значений: `[+expr, -expr]`.

---

## Синтаксис

```mc
\pm expr       // возвращает [+expr, -expr]
±expr          // Unicode-синоним

\mp expr       // возвращает [-expr, +expr] (обратный порядок)
∓expr          // Unicode-синоним
```

---

## Пример

```mc
quad_roots(a, b, c) =
    (-b \pm sqrt(b^2 - 4*a*c)) / (2*a)
```

Возвращает `num[2]`: `[x₁, x₂]`.

```c
mc_num* quad_roots(mc_num a, mc_num b, mc_num c) {
    static mc_num _r[2];
    mc_num _d = sqrt(pow(b, 2.0) - (4.0 * a * c));
    _r[0] = (-b + _d) / (2.0 * a);
    _r[1] = (-b - _d) / (2.0 * a);
    return _r;
}
```

---

## Использование из Си

```c
mc_num* roots = quad_roots(1.0, -5.0, 6.0);
printf("x1=%.4g  x2=%.4g\n", roots[0], roots[1]);
// x1=3  x2=2
```

---

## Смотри aussi

- [Множественный возврат](../../language/functions/multi-return.md)
- [LaTeX: \pm](../../latex/arithmetic/pm.md)

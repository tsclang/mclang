# Множественный возврат

Функция в mclang может возвращать несколько значений в виде массива `num[]`.

---

## Явный возврат массива

```mc
minmax(a, b) =
    if (a <= b) [a, b]
    else [b, a]
```

Генерируемый Си-код:

```c
mc_num* minmax(mc_num a, mc_num b) {
    static mc_num _result[2];
    if ((a <= b)) {
        _result[0] = a; _result[1] = b;
    } else {
        _result[0] = b; _result[1] = a;
    }
    return _result;
}
```

---

## `\pm` и `\mp` — плюс-минус / минус-плюс

`\pm expr` или `±expr` возвращает `[+expr, -expr]`.
`\mp expr` или `∓expr` возвращает `[-expr, +expr]` (обратный порядок):

```mc
quadratic_roots(a, b, c) =
    \pm sqrt(b^2 - 4*a*c) / (2*a)
```

Эквивалентно:

```mc
quadratic_roots(a, b, c) =
    d = sqrt(b^2 - 4*a*c)
    [(d) / (2*a), (-d) / (2*a)]
```

---

## Использование из Си

```c
#include "math_funcs.h"
#include <stdio.h>

int main(void) {
    mc_num* roots = quadratic_roots(1.0, -5.0, 6.0);
    printf("x1 = %g, x2 = %g\n", roots[0], roots[1]);
    return 0;
}
```

Вывод: `x1 = 3, x2 = 2`

---

## Предупреждение: статический буфер

Возвращаемый массив — `static`. Это означает:

- Значения действительны **до следующего вызова** функции
- **Не** используй результат двух вызовов одновременно:

```c
// Опасно: второй вызов перезапишет первый результат
mc_num* r1 = quadratic_roots(1, -5, 6);
mc_num* r2 = quadratic_roots(1, -3, 2);   // r1 больше недействителен
```

**Безопасный вариант** — скопировать результат:

```c
mc_num* tmp = quadratic_roots(1, -5, 6);
mc_num x1 = tmp[0], x2 = tmp[1];
// теперь можно вызывать снова
```

---

## Возврат вектора из where

```mc
cartesian_to_polar(x, y) =
    [r, theta]
    where
        r     = sqrt(x^2 + y^2)
        theta = atan2(y, x)
```

---

## Ошибки

### Возврат массивов разной длины в ветках

```mc
f(x) =
    if (x > 0) [x, x^2]
    else [x]            // ошибка: несовместимые размеры
```

---

## Смотри также

- [Неявный return](implicit-return.md)
- [Типы: num\[\]](../types/arrays.md)
- [Операторы: \pm](../../operators/special/pm.md)

# Блок where — переменные

Блок `where` объявляет локальные переменные, которые используются в основном выражении функции. Порядок объявления не важен — компилятор сам определяет зависимости.

---

## Синтаксис

```mc
f(x) =
    результирующее_выражение
    where
        имя1 = выражение1
        имя2 = выражение2
```

---

## Пример

```mc
quadratic(a, b, c) =
    (-b + d) / denom
    where
        d     = sqrt(discriminant)
        denom = 2 * a
        discriminant = b^2 - 4*a*c
```

Порядок строк в `where` не важен — `discriminant` будет вычислен раньше `d`.

---

## Топологическая сортировка

Компилятор строит граф зависимостей и вычисляет переменные в правильном порядке:

```mc
f(r) =
    volume
    where
        volume = (4/3) * π * r3
        r3     = r^3              // r3 нужна для volume, вычислится первой
```

Генерируемый Си-код:

```c
mc_num f(mc_num r) {
    mc_num r3 = pow(r, 3.0);          // сначала
    mc_num volume = (4.0/3.0) * M_PI * r3;
    return volume;
}
```

---

## Переменные where недоступны снаружи

```mc
circle_area(r) = area
    where area = π * r^2
```

`area` — локальная, не экспортируется.

---

## where в блочном теле

```mc
trajectory(v0, angle, t) =
    x + y
    where
        g   = 9.81
        vx0 = v0 * cos(angle)
        vy0 = v0 * sin(angle)
        x   = vx0 * t
        y   = vy0 * t - 0.5 * g * t^2
```

---

## Вложенных where нет

`where` может быть только один на функцию, на верхнем уровне:

```mc
// Ошибка: нет вложенных where
f(x) =
    a
    where
        a = b
        where        // ← синтаксическая ошибка
            b = x + 1
```

---

## Ошибки

### Циклическая зависимость

```mc
f(x) =
    a
    where
        a = b + 1
        b = a - 1   // ошибка: цикл a → b → a
```

```
Error E050: circular dependency in where block: a → b → a
```

### Необъявленная переменная

```mc
f(x) =
    z
    where
        y = x + 1   // z не объявлена
```

---

## Смотри также

- [Guards](guards.md)
- [Порядок вычислений](order.md)
- [Неявный return](../functions/implicit-return.md)

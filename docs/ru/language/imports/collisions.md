# Коллизии имён при импорте

Если два импортируемых файла объявляют функции с одинаковыми именами, возникает коллизия. mclang сообщит об ошибке.

---

## Пример коллизии

`geometry.mc`:
```mc
area(r) = π * r^2
```

`mechanics.mc`:
```mc
area(F, d) = F * d   // работа
```

`main.mc`:
```mc
import "./geometry.mc"
import "./mechanics.mc"

// Ошибка: area объявлена дважды
```

```
Error E062: name collision: 'area' defined in both 'geometry.mc' and 'mechanics.mc'
```

---

## Решение 1 — псевдонимы

```mc
import "./geometry.mc" as geo
import "./mechanics.mc" as mech

circle_work(r, F, d) =
    geo.area(r) * mech.area(F, d)
```

---

## Решение 2 — выборочный импорт

```mc
from "./geometry.mc" import circle_area
from "./mechanics.mc" import work

result = circle_area(r) + work(F, d)
```

---

## Решение 3 — переименование в исходниках

Переименуй функции в одном из файлов, чтобы имена не совпадали:

`geometry.mc` → `circle_area(r)`
`mechanics.mc` → `mechanical_work(F, d)`

---

## Коллизия с встроенными именами

Нельзя объявить функцию с именем встроенной функции или константы:

```mc
sin(x) = x - x^3/6   // ошибка: sin — встроенная
```

```
Error E010: 'sin' is a built-in function and cannot be redefined
```

---

## Смотри также

- [Базовый импорт](basic.md)
- [Пространства имён](namespaces.md)

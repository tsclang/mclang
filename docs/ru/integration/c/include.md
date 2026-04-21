# Подключение из C: #include

---

## Сгенерированные файлы

После компиляции `.mc`-файла появляются два файла:

```
math.c    — реализация всех функций
math.h    — заголовочный файл с сигнатурами
```

---

## Типы в заголовке

```c
// math.h
#ifndef MATH_H
#define MATH_H

#include <math.h>
#include <stdint.h>

#ifdef MC_USE_FAST_FLOAT
  typedef float mc_num;
#elif defined(MC_USE_8BIT)
  typedef int16_t mc_num;
#else
  typedef double mc_num;      // по умолчанию
#endif

mc_num circle_area(mc_num r);
mc_num circle_perimeter(mc_num r);

#endif
```

---

## Подключение в своём Си-файле

```c
// main.c
#include <stdio.h>
#include "math.h"    // путь относительно main.c

int main(void) {
    double r = 5.0;
    printf("Площадь: %.4f\n", circle_area(r));
    return 0;
}
```

---

## Смена точности через макрос

```c
// Использовать float вместо double:
#define MC_USE_FAST_FLOAT
#include "math.h"
```

---

## Смотри aussi

- [Компиляция](compile.md) · [Передача массивов](arrays.md)

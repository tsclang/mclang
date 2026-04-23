# mclang — Math C Language

Компилятор математических формул в чистый Си.

- Без рантайма
- Без зависимостей
- Без боли

**Для тех, кто хочет писать формулы, а не бороться с синтаксисом.**

Вы пишете:
Вы пишете:

$$2.0 * R * \arcsin{\sqrt{\sin{\frac{dlat}{2}}^2 + \cos{lat1} * \cos{lat2} * \sin{\frac{dlon}{2}}^2}}$$

Получаете C-файл с функцией, который имортируете в свой проект на C/Python/JS/Rust.

🚀 **100%** нативно

📉 **0%** оверхеда

⚡ **Экстремальная** скорость

---

## Зачем он нужен

Представьте: у вас есть формула из учебника. Вы хотите запустить её в игровом движке, на микроконтроллере и в браузере одновременно. Обычно это означает переписать формулу три раза на трёх разных языках, следя за тем, чтобы нигде не перепутать знак или порядок операндов.

mclang решает эту задачу иначе: вы пишете формулу один раз, в том виде, в котором она записана в учебнике, а компилятор генерирует автономный Си-код, который собирается во что угодно.

---

## Почему это круто

### Формулы выглядят как формулы

```mc
// Закон Снеллиуса
snell(n1, θ1, n2) = \arcsin{\frac{n1 * \sin{θ1}}{n2}}

// Расстояние Хаверсина
haversine(lat1, lon1, lat2, lon2) =
    2.0 * R * \arcsin{\sqrt{
        \sin{\frac{dlat}{2}}^2 +
        \cos{lat1} * \cos{lat2} * \sin{\frac{dlon}{2}}^2
    }}
    where
        dlat = lat2 - lat1
        dlon = lon2 - lon1
```

Это не псевдокод. Это реальный mclang — он компилируется прямо сейчас.

### Неявное умножение как в математике

`2πr`, `2(a+b)`, `r²\sin{θ}` — всё работает так, как вы ожидаете. Пробел между символами означает умножение: `2π d` = `2 * π * d`. LaTeX-функции подставляются напрямую: `2\sin{x}` = `2 * sin(x)`.

### Блок `where` — ваш черновик

Все промежуточные переменные идут в `where`. Компилятор сам разберётся с порядком вычислений. Guard-условия без `else` — тоже там:

```mc
pid_d(Kd, e, e_prev, dt) =
    Kd * (e - e_prev) / dt
    where
        dt > 0   // guard: если dt ≤ 0, вернёт NaN
```

### Один файл → пять платформ

```bash
mclang optics.mc --target c       # optics.c + optics.h
mclang optics.mc --target shared  # .so / .dll для Python ctypes
mclang optics.mc --target wasm    # WebAssembly для браузера
mclang optics.mc --target node    # Node.js native addon
mclang optics.mc --target rust    # Rust FFI bindings
```

Один набор формул, пять таргетов. Код одинаковый везде.

### Никакого рантайма

Сгенерированный `.c`-файл компилируется с флагом `-lm` и больше ничего не требует. Никаких heap-аллокаций, никаких глобальных состояний, никаких скрытых зависимостей. Работает на Arduino, STM32, в WASM-песочнице и в ядре ОС одинаково хорошо.

### Модульность через импорт

```mc
import "./wave_base.mc"   // подключить всё

from "./optics.mc" import snell, fresnel_r  // только нужное

import "./geometry.mc" as geo  // с псевдонимом
```

Приватные функции (с префиксом `_`) попадают в скомпилированный код, но не в `.h`-заголовок — инкапсуляция без лишних слов.

### Числа с умом

Базовый тип — `num`. Для PC — это `double`. Для микроконтроллеров без FPU — `float` или `fixed`. Одни и те же формулы, разная точность — флагом `--precision f32` или `--precision fixed`.

---

## Быстрый старт

```bash
npm install -g mclang

mclang --version

mclang some_file.mc
```

---

## Примеры

```bash
# Скомпилировать пример
mclang examples/optics/mc/optics.mc

# Собрать и запустить демо
cd examples/optics && bash run.sh
```


| Пример | Что внутри |
|--------|-----------|
| `optics` | Многофайловый проект: закон Снеллиуса, уравнения Френеля, дифракция, интерферометр Фабри-Перо |
| `black_scholes` | Финансовая математика: опционы Блэка-Шоулза, греки |
| `orbital_mechanics` | Небесная механика: орбиты, скорости, элементы Кеплера |
| `kalman` | Фильтр Калмана: предсказание, коррекция, ковариация |
| `dsp_filters` | Цифровая обработка сигналов: Butterworth, Chebyshev, оконные функции |
| `geodesy` | Геодезия: расстояния на эллипсоиде WGS-84, ECEF |
| `transforms_3d` | 3D-трансформации: кватернионы, матрицы поворота |
| `pid_control` | ПИД-регулятор: дискретная форма, Ziegler-Nichols |
| `colorimetry` | Работа с цветом: sRGB → XYZ → Lab, ΔE, контраст |
| `linear_regression` | МНК, градиентный спуск, нормализация |

---

## Синтаксис за 30 секунд

```mc
// Константа
R_earth = 6371000.0

// Функция
area(r) = π * r^2

// С параметром по умолчанию
volume(r, h = 1.0) = area(r) * h

// LaTeX-стиль
normal_pdf(x, μ, σ) = \frac{1}{σ * \sqrt{2π}} * e^{-\frac{(x-μ)^2}{2*σ^2}}

// Условие
relu(x) = if (x > 0) x else 0

// Векторы
dot2d(u, v) = u[0]*v[0] + u[1]*v[1]

// Приватная функция (не попадает в .h)
_helper(x) = x * 2.0
pub(x) = _helper(x) + 1.0
```

---

## Документация

- [en](https://github.com/tsclang/mclang/blob/main/docs/en/index.md)
- [ch](https://github.com/tsclang/mclang/blob/main/docs/ch/index.md)
- [ru](https://github.com/tsclang/mclang/blob/main/docs/ru/index.md)

## Самоучитель

- [en](https://github.com/tsclang/mclang/blob/main/tutorial/en/index.md)
- [ch](https://github.com/tsclang/mclang/blob/main/tutorial/ch/index.md)
- [ru](https://github.com/tsclang/mclang/blob/main/tutorial/ru/index.md)


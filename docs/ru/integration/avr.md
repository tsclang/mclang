# Таргет AVR / Embedded

`--target avr` генерирует `.c` + `.h` файлы, оптимизированные для микроконтроллеров: Arduino (AVR), STM32 (ARM Cortex-M) и ESP32.

## Быстрый старт

```bash
# STM32 / ESP32 — float-арифметика
mclang filter.mc --target avr --precision f32

# Arduino / 8-bit — фиксированная точка
mclang filter.mc --target avr --precision fixed
```

По умолчанию `--precision f32` (в отличие от других таргетов, где дефолт `f64`).

---

## Точность вычислений

| `--precision` | Тип `mc_num` | Подходит для |
|--------------|-------------|-------------|
| `f32` | `float` | STM32, ESP32, современные AVR с FPU |
| `fixed` | `int16_t` (Q8.8) | Arduino Uno, 8-bit AVR без FPU |
| `f64` | `double` | не рекомендуется для AVR — большинство чипов эмулируют `double` программно |

---

## Fallback-макросы IEEE 754

Когда `--target avr` активен, компилятор добавляет в начало `.c`-файла:

```c
#define MC_AVR_TARGET 1
```

И fallback-определения для чипов, у которых нет стандартных констант `<math.h>`:

```c
#ifndef INFINITY
#  define INFINITY  (__builtin_inff())
#endif
#ifndef NAN
#  define NAN       (__builtin_nanf(""))
#endif
#ifndef isnan
#  define isnan(x)  __builtin_isnan(x)
#endif
#ifndef isinf
#  define isinf(x)  __builtin_isinf(x)
#endif
#ifndef isfinite
#  define isfinite(x) __builtin_isfinite(x)
#endif
```

На 8-bit системах без аппаратной поддержки IEEE 754 компилятор добавляет программный guard для безопасного возврата флага ошибки.

---

## Сборка

### Arduino / AVR (avr-gcc)

```bash
avr-gcc -mmcu=atmega328p -DF_CPU=16000000UL -Os -o filter.o filter.c -lm
```

### STM32 (arm-none-eabi-gcc)

```bash
arm-none-eabi-gcc -mcpu=cortex-m4 -mfpu=fpv4-sp-d16 -mfloat-abi=hard -Os -o filter.o filter.c -lm
```

### ESP32 (xtensa-esp32-elf-gcc)

```bash
xtensa-esp32-elf-gcc -Os -o filter.o filter.c -lm
```

---

## Смотри также

- [CLI](../cli.md)
- [Интеграция с C](c/index.md)

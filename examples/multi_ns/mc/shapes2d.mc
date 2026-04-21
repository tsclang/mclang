// 2D shapes — circle, rectangle, triangle

// Circle
area(r)      = \pi * r^2
perimeter(r) = 2 * \pi * r

// Rectangle
rect_area(w, h)      = w * h
rect_perimeter(w, h) = 2 * (w + h)

// Triangle (Heron's formula)
tri_area(a, b, c) = \sqrt{s * (s - a) * (s - b) * (s - c)}
  where
    s = (a + b + c) / 2
    a > 0
    b > 0
    c > 0

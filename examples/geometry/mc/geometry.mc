// Geometry — 2D/3D distance, angles, areas

// Euclidean distance between two 2D points
dist2d(x1, y1, x2, y2) = \sqrt{(x2 - x1)^2 + (y2 - y1)^2}

// Angle between two 2D vectors (radians)
angle2d(x1, y1, x2, y2) = \arccos((x1*x2 + y1*y2) / (\sqrt{x1^2+y1^2} * \sqrt{x2^2+y2^2}))
  where
    x1^2 + y1^2 > 0
    x2^2 + y2^2 > 0

// Area of triangle given three vertices (shoelace formula)
triangle_area(ax, ay, bx, by, cx, cy) = |(((bx-ax)*(cy-ay) - (cx-ax)*(by-ay)))| / 2

// 3D dot product (via built-in)
dot3(v: num[], w: num[]) = dot(v, w)

// 3D cross product (via built-in) — returns num[3]
cross3(v: num[], w: num[]) = cross(v, w)

// 3D Euclidean norm
len3(v: num[]) = norm(v)

// Column j of a matrix
matrix_col(m: num[][], j: int) = m[:, j]

// Row i of a matrix
matrix_row(m: num[][], i: int) = m[i, :]

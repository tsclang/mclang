// Ballistics — projectile motion under constant gravity
// v0: initial velocity (m/s), angle: launch angle (radians)
// Equations assume flat terrain, no air resistance

range(v0, angle) = v0^2 * \sin(2 * angle) / 9.81
  where
    v0 >= 0

max_height(v0, angle) = v0^2 * (\sin(angle))^2 / (2 * 9.81)
  where
    v0 >= 0

time_of_flight(v0, angle) = 2 * v0 * \sin(angle) / 9.81
  where
    v0 >= 0

// Height at horizontal distance x
height_at(v0, angle, x) = x * \tan(angle) - (9.81 * x^2) / (2 * v0^2 * (\cos(angle))^2)
  where
    v0 > 0
    \cos(angle) != 0

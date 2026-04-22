// 3D Transformations — quaternions, rotations, SLERP

// Quaternion multiplication (w,x,y,z) * (w,x,y,z)
qmul_w(w1, x1, y1, z1, w2, x2, y2, z2) = w1*w2 - x1*x2 - y1*y2 - z1*z2
qmul_x(w1, x1, y1, z1, w2, x2, y2, z2) = w1*x2 + x1*w2 + y1*z2 - z1*y2
qmul_y(w1, x1, y1, z1, w2, x2, y2, z2) = w1*y2 - x1*z2 + y1*w2 + z1*x2
qmul_z(w1, x1, y1, z1, w2, x2, y2, z2) = w1*z2 + x1*y2 - y1*x2 + z1*w2

qnorm(w, x, y, z) = sqrt(w^2 + x^2 + y^2 + z^2)
qnorm_w(w, x, y, z) = w / qnorm(w, x, y, z)
qnorm_x(w, x, y, z) = x / qnorm(w, x, y, z)
qnorm_y(w, x, y, z) = y / qnorm(w, x, y, z)
qnorm_z(w, x, y, z) = z / qnorm(w, x, y, z)

// Euler ZYX angles (yaw, pitch, roll in radians) → quaternion
euler_w(yaw, pitch, roll) =
    cos(roll/2.0)*cos(pitch/2.0)*cos(yaw/2.0) + sin(roll/2.0)*sin(pitch/2.0)*sin(yaw/2.0)
euler_x(yaw, pitch, roll) =
    sin(roll/2.0)*cos(pitch/2.0)*cos(yaw/2.0) - cos(roll/2.0)*sin(pitch/2.0)*sin(yaw/2.0)
euler_y(yaw, pitch, roll) =
    cos(roll/2.0)*sin(pitch/2.0)*cos(yaw/2.0) + sin(roll/2.0)*cos(pitch/2.0)*sin(yaw/2.0)
euler_z(yaw, pitch, roll) =
    cos(roll/2.0)*cos(pitch/2.0)*sin(yaw/2.0) - sin(roll/2.0)*sin(pitch/2.0)*cos(yaw/2.0)

// Rotate vector by unit quaternion (Rodrigues formula)
rot_vx(w, qx, qy, qz, vx, vy, vz) =
    vx + 2.0*w*(qy*vz - qz*vy) + 2.0*(qx*dqv - (qy^2 + qz^2)*vx)
    where
        dqv = qx*vx + qy*vy + qz*vz

rot_vy(w, qx, qy, qz, vx, vy, vz) =
    vy + 2.0*w*(qz*vx - qx*vz) + 2.0*(qy*dqv - (qx^2 + qz^2)*vy)
    where
        dqv = qx*vx + qy*vy + qz*vz

rot_vz(w, qx, qy, qz, vx, vy, vz) =
    vz + 2.0*w*(qx*vy - qy*vx) + 2.0*(qz*dqv - (qx^2 + qy^2)*vz)
    where
        dqv = qx*vx + qy*vy + qz*vz

// Angular distance between two quaternions
qdist(w1, x1, y1, z1, w2, x2, y2, z2) =
    2.0 * arccos(abs(w1*w2 + x1*x2 + y1*y2 + z1*z2))

// Axis-angle → quaternion (axis must be unit vector)
axisangle_w(ax, ay, az, angle) = cos(angle / 2.0)
axisangle_x(ax, ay, az, angle) = ax * sin(angle / 2.0)
axisangle_y(ax, ay, az, angle) = ay * sin(angle / 2.0)
axisangle_z(ax, ay, az, angle) = az * sin(angle / 2.0)

// Quaternion → rotation matrix elements (row-major)
rmat_00(w, x, y, z) = 1.0 - 2.0*(y^2 + z^2)
rmat_01(w, x, y, z) = 2.0*(x*y - w*z)
rmat_02(w, x, y, z) = 2.0*(x*z + w*y)
rmat_10(w, x, y, z) = 2.0*(x*y + w*z)
rmat_11(w, x, y, z) = 1.0 - 2.0*(x^2 + z^2)
rmat_12(w, x, y, z) = 2.0*(y*z - w*x)
rmat_20(w, x, y, z) = 2.0*(x*z - w*y)
rmat_21(w, x, y, z) = 2.0*(y*z + w*x)
rmat_22(w, x, y, z) = 1.0 - 2.0*(x^2 + y^2)

// SLERP helper (single component)
_slerp_c(c1, c2, theta, t) =
    sin((1.0 - t) * theta) / sin(theta) * c1 + sin(t * theta) / sin(theta) * c2
    where
        abs(sin(theta)) > 1e-6

slerp_w(w1, x1, y1, z1, w2, x2, y2, z2, t) =
    _slerp_c(w1, w2, arccos(abs(w1*w2 + x1*x2 + y1*y2 + z1*z2)), t)
slerp_x(w1, x1, y1, z1, w2, x2, y2, z2, t) =
    _slerp_c(x1, x2, arccos(abs(w1*w2 + x1*x2 + y1*y2 + z1*z2)), t)
slerp_y(w1, x1, y1, z1, w2, x2, y2, z2, t) =
    _slerp_c(y1, y2, arccos(abs(w1*w2 + x1*x2 + y1*y2 + z1*z2)), t)
slerp_z(w1, x1, y1, z1, w2, x2, y2, z2, t) =
    _slerp_c(z1, z2, arccos(abs(w1*w2 + x1*x2 + y1*y2 + z1*z2)), t)

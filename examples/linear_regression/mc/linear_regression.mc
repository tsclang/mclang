// Linear regression — least squares via normal equations

lr_slope(x: num[], y: num[], n) =
    (n * dot(x, y) - sum(x) * sum(y)) / (n * dot(x, x) - sum(x)^2)
    where
        n * dot(x, x) > sum(x)^2

lr_intercept(x: num[], y: num[], n) =
    mean(y) - lr_slope(x, y, n) * mean(x)

lr_predict(slope, intercept, xval) = slope * xval + intercept

ss_tot(y: num[], n) =
    dot(y, y) - n * mean(y)^2
    where
        n > 0

ss_res(x: num[], y: num[], n) =
    ss_tot(y, n) - b^2 * (dot(x, x) - n * mean(x)^2)
    where
        b = lr_slope(x, y, n)

r_squared(x: num[], y: num[], n) =
    1.0 - ss_res(x, y, n) / ss_tot(y, n)
    where
        ss_tot(y, n) > 0

rmse(x: num[], y: num[], n) =
    sqrt(ss_res(x, y, n) / n)
    where
        n > 0

pearson(x: num[], y: num[], n) =
    (n * dot(x, y) - sum(x) * sum(y)) /
    sqrt((n * dot(x, x) - sum(x)^2) * (n * dot(y, y) - sum(y)^2))
    where
        (n * dot(x, x) - sum(x)^2) * (n * dot(y, y) - sum(y)^2) > 0

// Matrix normal equations — for multivariate regression
// XtX: (X'X) matrix, XtXinv: its inverse
xtx_inv(XtX: num[][]) = inv(XtX)
xtx_det(XtX: num[][]) = det(XtX)

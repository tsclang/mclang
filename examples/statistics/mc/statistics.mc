// Statistics — descriptive statistics using built-in aggregators

// Sample mean
avg(v: num[]) = mean(v)

// Population standard deviation
spread(v: num[]) = std(v)

// Coefficient of variation (%) — relative spread
cv(v: num[]) = std(v) / mean(v) * 100
  where
    mean(v) != 0

// Min-max range
data_range(v: num[]) = max(v) - min(v)

// Z-score: number of std deviations from mean
z_score(v: num[], x) = (x - mean(v)) / std(v)
  where
    std(v) > 0

// Normalized value in [0, 1]
normalize(v: num[], x) = (x - min(v)) / (max(v) - min(v))
  where
    max(v) - min(v) > 0

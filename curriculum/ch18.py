def hamming_weights(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)  # The upper bits were already counted; add the lowest bit.
    return dp


def lonely_integer(a):
    result = 0
    for i, x in enumerate(a):
        result ^= x  # Each pair of equal bit patterns cancels.
    return result


def swap_bits(n):
    even = n & 0x55555555
    odd = n & 0xAAAAAAAA
    left = (even << 1) & 0xFFFFFFFF
    right = odd >> 1
    return left | right  # Combine two disjoint sets of bit positions.

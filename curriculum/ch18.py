def hamming_weights(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)  # Старшие биты уже посчитаны; добавляем младший.
    return dp


def lonely_integer(a):
    result = 0
    for i, x in enumerate(a):
        result ^= x  # Каждая пара одинаковых битовых строк взаимно уничтожается.
    return result


def swap_bits(n):
    even = n & 0x55555555
    odd = n & 0xAAAAAAAA
    left = (even << 1) & 0xFFFFFFFF
    right = odd >> 1
    return left | right  # Объединяем два непересекающихся набора разрядов.

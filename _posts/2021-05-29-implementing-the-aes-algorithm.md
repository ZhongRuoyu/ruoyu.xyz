---
title: Implementing the AES Algorithm
category: projects
date: 2021-05-29 15:47 +08
tag:
  - Computer Science
  - Cryptography
description: As a hobby project, I implemented the Advanced Encryption Standard (AES) algorithm using C.
use_latex: true
---

I haven't touched my blog since February. The previous semester was terribly busy and I had hardly any time to manage my own businesses. Now that the semester has ended, it's time that I take a good rest and do something fun.

Then I thought of implementing the AES ([Advanced Encryption Standard](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)) algorithm. That was probably one of the things that I wanted to do since long before. Without further ado, I started my implementation. The changes were recorded in the project's GitHub repository, [ZhongRuoyu/AES](https://github.com/ZhongRuoyu/AES).

## The First Attempt

### Implementing the Core Algorithm

I decided to implement the algorithm with C. Following the [Standard](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf) published on NIST, the implementation of the cipher, key expansion, and inverse cipher routines went on quite smoothly. After a couple of hours, I released the version [`v0.1-alpha`](https://github.com/ZhongRuoyu/AES/releases/tag/v0.1-alpha).

#### The Cipher Routine

In this version of the implementation, the state in the cipher routine is stored as an array of `byte`s (a `typedef` of `uint8_t`), while the key (before and after expansion) is stored in an array of `word`s (a `typedef` of `uint32_t`). For this reason, the `AddRoundKey()` transformation involves a conversion from `word`s to `byte`s, as shown in [cipher.c](https://github.com/ZhongRuoyu/AES/blob/v0.1-alpha/cipher.c).

For the `SubBytes()` transformation, since it would be too slow to calculate the multiplicative inverse of elements in \\(\\text{GF}(2^8)\\), I directly used the S-box values provided in the Standard. Now to do the transformation, we only need one lookup for each byte.

As for the `ShiftRows()` and `MixColumns()` transformations, the results are calculated on the fly, and it was very straightforward. What's worth noticing is the multiplication routine in \\(\\text{GF}(2^8)\\). My implementation is as follows.

```c
byte multiply(byte a, byte b) {
    byte res = 0;
    for (; b; b >>= 1) {
        if (b & 1) res ^= a;
        a = a << 1 ^ (a & 0x80 ? 0x1b : 0);
    }
    return res;
}
```

Here the `for` loop body is executed repeatedly, with the multiplier `b` shifted right every time by 1 bit, until we have shifted out every set bit of `b`. Inside the loop body, every time the lowest bit of `b` is set, the multiplicand `a` gets added to the result, and `a` itself is doubled. When an overflow occurs (i.e. when the highest bit of `a` is set before the left rotation), `a` itself gets reduced by a bitwise XOR with `0x1b`. It can be easily shown that in this case the bitwise XOR with `0x1b` is equivalent to a modulo operation with divisor `0b100011011` (or `0x011b` but we don't need to consider the highest set bit). It turns out that with this trick very good efficiency can be achieved.

#### The Key Expansion Routine

The key expansion routine is implemented exactly as described in the Standard, and in fact, hasn't been changed much since this very first release.

#### Future Flexibility

As described in Section 6.3 of the Standard, although the allowed values for key length (\\(Nk\\)), block size (\\(Nb\\)), and number of rounds (\\(Nr\\)) are limited, the implementation would have more future flexibility if these values can get parameterised. This is what I did; actually, this is the main reason behind those dynamic memory allocations. Variable-length arrays (VLA) are a optional feature in C, but I want to provide as much portability as possible. This could be a trouble, as the excessive number of allocaion/deallocation really significantly reduced the overall performance.

### Implementing an Interface

With the successful implementation of the core cipher routines, the next step was to provide some interfaces for information processing. I implemented three different interfaces for different purposes: one for single-block (128-bit) hexadecimal strings, one for multi-block (4n-bit) hexadecimal strings, and of course, one for files. There is not much to say about these interfaces since the implementation of them is rather simple.

One of the considerations, though, is worth mentioning. I was stuck at choosing a byte padding method for multi-block hex strings and files, since there is no guarantee of the length of these inputs, while AES is a block cipher algorithm and only accepts data in blocks. (I'm not talking about its stream cipher variants.) Having read the Wikipedia article on [padding](<https://en.wikipedia.org/wiki/Padding_(cryptography)>), I decided to use the padding method 2 from [ISO/IEC 9797-1](https://en.wikipedia.org/wiki/ISO/IEC_9797-1).

Summing up all these, version [`v0.2-alpha`](https://github.com/ZhongRuoyu/AES/releases/tag/v0.2-alpha) was released.

### Support for Command Line I/O

One of the most exciting things was to make our program ready for command line I/O. Parsing command line arguments was somewhat like a finite state machine -- there is a limited number of states and under some condition one can be converted to another. Though this is my first attempt to implement a command line argument parser, to my surprise, it was not as complicated as I thought. (Or maybe it's just that my program is too simple... :P) Release [`v0.3-beta`](https://github.com/ZhongRuoyu/AES/releases/tag/v0.3-beta) was then out; most of the changes were in [main.c](https://github.com/ZhongRuoyu/AES/blob/v0.3-beta/main.c).

### Getting Ready for the First Stable Release

As (probably) every book would suggest, it can be quite hard to implement a program with no memory leaks, when you have to allocate memory manually. This was something that bothered me -- I had to go through the whole program again, examining every early calls to `exit()` to find out those potential memory leaks. Our operating systems are of course smart enough to free those dynamically allocated memory slots -- but for portability we had better not take this for granted.

In addition, as pointed out by the release notes of `v0.3-beta`, another key issue is that the optional `_s` functions, such as `fopen_s()` and `strncpy_s()`, are not supported by some libraries, such as glibc (as indicated [here](https://gcc.gnu.org/wiki/C11Status)). Those problems were encountered when I tried to build the program on my WSL running Ubuntu. I had to rewrite the parts that used these bounds-checking functions and ensure that they worked properly. This is the reason behind the preprocessor directives `#define _CRT_SECURE_NO_WARNINGS` found at the beginning of some of the source files.

Another observation was that the inverse cipher routine always took a slightly longer time than the cipher routine. It turned out that this was because the multipliers in the `InvMixColumns()` transformation were larger than those in the `MixColumns()` transformation. To address this, I decided to remove the `multiply()` routine ('tis a pity, but we'll need it later), and use lookup tables instead. This significantly boosted the overall performance, but that's only the first step -- of course there are more optimisations under way.

With those, having tested for several times, it was finally time to release [`v1.0`](https://github.com/ZhongRuoyu/AES/releases/tag/v1.0), the first stable release.

## The Second Attempt

_To be continued..._

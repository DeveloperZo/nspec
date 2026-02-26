

# Technical Design Document — FizzBuzz

## Overview

A minimal C# console application that reads a single integer from `stdin`, evaluates its divisibility by 3 and 5, and prints the appropriate result (`Fizz`, `Buzz`, `FizzBuzz`, or the number itself). Invalid input produces a clear error message.

---

## Architecture

The application follows a simple **single-project, linear-flow** architecture. There is no need for layering, dependency injection, or external packages.

```
stdin → Parse Input → Evaluate → Print Result → exit
```

All logic lives in one project with two concerns separated into distinct methods:

1. **Input parsing & validation** — handled in `Program.Main`
2. **FizzBuzz evaluation** — a pure function in a `FizzBuzzEvaluator` class

---

## Component Breakdown

### 1. `Program` (entry point)

**Responsibility:** Read from `stdin`, validate input, call evaluator, write to `stdout`.

- Reads a line from `Console.ReadLine()`.
- Attempts `int.TryParse`; on failure prints an error message to `stdout` and exits with a non-zero exit code.
- On success, calls `FizzBuzzEvaluator.Evaluate(int)` and prints the result.

### 2. `FizzBuzzEvaluator`

**Responsibility:** Pure evaluation logic. No I/O.

```csharp
public static class FizzBuzzEvaluator
{
    public static string Evaluate(int number)
    {
        if (number % 15 == 0) return "FizzBuzz";
        if (number % 3 == 0)  return "Fizz";
        if (number % 5 == 0)  return "Buzz";
        return number.ToString();
    }
}
```

Key decisions:
- Check `% 15` first to handle the combined case before individual checks.
- Returns `string` so the caller simply prints whatever comes back.
- Static class — no state, no allocations beyond the returned string.

---

## Data Models

No custom data models are needed. The application operates on a single `int` input and a `string` output.

| Boundary | Type     | Description                        |
|----------|----------|------------------------------------|
| Input    | `string?` | Raw line read from `Console.ReadLine()` |
| Parsed   | `int`    | Validated integer passed to evaluator |
| Output   | `string` | Result printed to `stdout`         |

---

## Technology Choices

| Concern        | Choice                          | Rationale                                        |
|----------------|---------------------------------|--------------------------------------------------|
| Language       | C# / .NET 8 (or latest LTS)    | Required by NFR-1                                |
| Project type   | Console app (top-level or `Main`) | Simplest template; `dotnet new console`        |
| Test framework | xUnit                           | Lightweight; ships with `dotnet new` templates   |
| Dependencies   | None beyond BCL                 | Per constraints                                  |

### Project structure

```
FizzBuzz/
├── FizzBuzz.csproj
├── Program.cs
├── FizzBuzzEvaluator.cs
└── Tests/
    ├── FizzBuzz.Tests.csproj
    └── FizzBuzzEvaluatorTests.cs
```

### Error message format

For invalid input, the application prints:

```
Error: "{raw_input}" is not a valid integer.
```

This satisfies NFR-3 by echoing back what the user typed and naming the expected type.

---

## Test Strategy

Unit tests target `FizzBuzzEvaluator.Evaluate` since it contains all business logic and is free of I/O.

| Input | Expected   | Covers           |
|-------|------------|------------------|
| `9`   | `"Fizz"`   | FR-2             |
| `10`  | `"Buzz"`   | FR-3             |
| `15`  | `"FizzBuzz"` | FR-4           |
| `30`  | `"FizzBuzz"` | FR-4           |
| `7`   | `"7"`      | FR-5             |
| `0`   | `"FizzBuzz"` | Edge: zero     |
| `-3`  | `"Fizz"`   | Edge: negative   |
| `1`   | `"1"`      | Edge: no match   |

Input validation (FR-1) can be verified with a simple integration test or manual run, given the trivial `TryParse` path.
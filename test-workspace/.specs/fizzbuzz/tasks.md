

# Implementation Plan — FizzBuzz

## Phase 1: Project Scaffolding

- [ ] Create `FizzBuzz/FizzBuzz.csproj` console application targeting .NET 8 using `dotnet new console` (S) _Requirements: infrastructure_
- [ ] Create `Tests/FizzBuzz.Tests.csproj` xUnit test project using `dotnet new xunit` and add a project reference to `FizzBuzz.csproj` (S) _Requirements: infrastructure_

## Phase 2: Core Evaluation Logic

- [ ] Implement `FizzBuzzEvaluator` static class in `FizzBuzz/FizzBuzzEvaluator.cs` with `Evaluate(int)` method: return `"FizzBuzz"` for multiples of 15, `"Fizz"` for multiples of 3, `"Buzz"` for multiples of 5, otherwise the number as a string (M) _Requirements: FR-2, FR-3, FR-4, FR-5_

## Phase 3: Input Parsing & Entry Point

- [ ] Implement `Program.Main` in `FizzBuzz/Program.cs`: read a line from `Console.ReadLine()`, parse with `int.TryParse`, on failure print `Error: "{raw_input}" is not a valid integer.` and exit with non-zero code, on success call `FizzBuzzEvaluator.Evaluate` and print the result (M) _Requirements: FR-1, FR-2, FR-3, FR-4, FR-5_

## Phase 4: Unit Tests

- [ ] Add xUnit test: input `9` → `"Fizz"` (S) _Requirements: FR-2_
- [ ] Add xUnit test: input `10` → `"Buzz"` (S) _Requirements: FR-3_
- [ ] Add xUnit tests: input `15` → `"FizzBuzz"` and input `30` → `"FizzBuzz"` (S) _Requirements: FR-4_
- [ ] Add xUnit test: input `7` → `"7"` (S) _Requirements: FR-5_
- [ ] Add xUnit edge-case tests: input `0` → `"FizzBuzz"`, input `-3` → `"Fizz"`, input `1` → `"1"` (S) _Requirements: FR-2, FR-4, FR-5_
- [ ] Add integration-level test or manual verification that non-integer input (e.g. `"abc"`, empty string) produces the expected error message and non-zero exit code (S) _Requirements: FR-1_
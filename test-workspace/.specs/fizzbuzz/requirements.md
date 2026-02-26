

# Requirements Document — FizzBuzz

## Overview

A C# console application that accepts a numeric input and prints a result based on its divisibility: **"Fizz"** if divisible by 3, **"Buzz"** if divisible by 5, and **"FizzBuzz"** if divisible by both 3 and 5.

---

## Functional Requirements

### FR-1: Accept numeric input

**User Story:** As a user, I want to provide a number to the console application so that it can evaluate the number's divisibility.

**Acceptance Criteria:**

- **GIVEN** the application is running **WHEN** the user provides a valid integer input **THEN** the application accepts and processes the input.
- **GIVEN** the application is running **WHEN** the user provides a non-integer or empty input **THEN** the application displays an error message indicating invalid input.

---

### FR-2: Print "Fizz" for multiples of 3

**User Story:** As a user, I want to see "Fizz" printed when my number is divisible by 3 (but not 5) so that I can identify multiples of 3.

**Acceptance Criteria:**

- **GIVEN** the user has entered a valid integer **WHEN** the number is divisible by 3 **AND** the number is not divisible by 5 **THEN** the application prints `Fizz`.
- **GIVEN** the user has entered the number `9` **WHEN** the application evaluates it **THEN** the output is `Fizz`.

---

### FR-3: Print "Buzz" for multiples of 5

**User Story:** As a user, I want to see "Buzz" printed when my number is divisible by 5 (but not 3) so that I can identify multiples of 5.

**Acceptance Criteria:**

- **GIVEN** the user has entered a valid integer **WHEN** the number is divisible by 5 **AND** the number is not divisible by 3 **THEN** the application prints `Buzz`.
- **GIVEN** the user has entered the number `10` **WHEN** the application evaluates it **THEN** the output is `Buzz`.

---

### FR-4: Print "FizzBuzz" for multiples of both 3 and 5

**User Story:** As a user, I want to see "FizzBuzz" printed when my number is divisible by both 3 and 5 so that I can identify numbers that are common multiples.

**Acceptance Criteria:**

- **GIVEN** the user has entered a valid integer **WHEN** the number is divisible by both 3 and 5 **THEN** the application prints `FizzBuzz`.
- **GIVEN** the user has entered the number `15` **WHEN** the application evaluates it **THEN** the output is `FizzBuzz`.
- **GIVEN** the user has entered the number `30` **WHEN** the application evaluates it **THEN** the output is `FizzBuzz`.

---

### FR-5: Print the number itself when not divisible by 3 or 5

**User Story:** As a user, I want to see the number printed as-is when it is not divisible by 3 or 5 so that I still receive meaningful output.

**Acceptance Criteria:**

- **GIVEN** the user has entered a valid integer **WHEN** the number is not divisible by 3 **AND** the number is not divisible by 5 **THEN** the application prints the number itself.
- **GIVEN** the user has entered the number `7` **WHEN** the application evaluates it **THEN** the output is `7`.

---

## Non-Functional Requirements

| ID    | Requirement                                                                                      |
|-------|--------------------------------------------------------------------------------------------------|
| NFR-1 | The application MUST be a C# console application.                                                |
| NFR-2 | The application SHOULD return output immediately after input with no perceptible delay.           |
| NFR-3 | Error messages SHOULD be clear enough for the user to correct their input without documentation.  |

---

## Constraints & Assumptions

- The application processes **one number per execution**.
- Input is provided via standard console input (`stdin`).
- The input is assumed to be a whole integer (negative integers and zero are valid inputs).
- No external dependencies or libraries are required beyond the .NET base class library.
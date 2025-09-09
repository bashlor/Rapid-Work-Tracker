import { test } from "@japa/runner";
import { TestContext } from "@japa/runner/core";

import { Email } from "../../../kernel/email";

test.group("Email Value Object", () => {
  test("should create valid email", async (ctx: TestContext) => {
    // Arrange
    const emailValue = "test@example.com";

    // Act
    const email = Email.createFrom(emailValue);

    // Assert
    ctx.assert.isDefined(email);
    ctx.assert.equal(email.value, "test@example.com");
  });

  test("should normalize email to lowercase and trim", async (ctx: TestContext) => {
    // Arrange
    const emailValue = "  TEST@EXAMPLE.COM  ";

    // Act
    const email = Email.create(emailValue);

    // Assert
    ctx.assert.equal(email.value, "test@example.com");
  });

  test("should throw error for invalid email format", async (ctx: TestContext) => {
    // Arrange
    const invalidEmails = [
      "invalid-email",
      "@example.com",
      "test@",
      "test.example.com",
      "",
      "   ",
    ];

    // Act & Assert
    invalidEmails.forEach((invalidEmail) => {
      ctx.assert.throws(() => {
        Email.createFrom(invalidEmail);
      }, "Invalid email");
    });
  });

  test("should validate email format correctly", async (ctx: TestContext) => {
    // Arrange
    const validEmails = [
      "test@example.com",
      "user.name@domain.co.uk",
      "test123@test.org",
      "a@b.co",
    ];

    const invalidEmails = [
      "invalid-email",
      "@example.com",
      "test@",
      "test.example.com",
      "",
      "   ",
    ];

    // Act & Assert
    validEmails.forEach((email) => {
      ctx.assert.isTrue(Email.isValid(email));
    });

    invalidEmails.forEach((email) => {
      ctx.assert.isFalse(Email.isValid(email));
    });
  });

  test("should compare emails correctly", async (ctx: TestContext) => {
    // Arrange
    const email1 = Email.createFrom("test@example.com");
    const email2 = Email.createFrom("TEST@EXAMPLE.COM");
    const email3 = Email.createFrom("different@example.com");

    // Act & Assert
    ctx.assert.isTrue(email1.equals(email2));
    ctx.assert.isFalse(email1.equals(email3));
  });

  test("should handle edge cases", async (ctx: TestContext) => {
    // Arrange & Act
    const email1 = Email.create("  test@example.com  ");
    const email2 = Email.createFrom("test@example.com");

    // Assert
    ctx.assert.isTrue(email1.equals(email2));
  });
});

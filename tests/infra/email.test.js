import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.deleteAllEmails();
});

describe("Email", () => {
    test("should send email", async () => {
        await email.send({
            from: "sender@example.com",
            to: "recipient@example.com",
            subject: "Test email",
            text: "This is a test email",
        });
        expect(email).toBeDefined();
    });
    test("should get last email", async () => {
        await email.send({
            from: "sender@example.com",
            to: "recipient@example.com",
            subject: "Test email",
            text: "This is a test email",
        });
        await email.send({
            from: "last-sender@example.com",
            to: "last-recipient@example.com",
            subject: "Last email",
            text: "This is the last email",
        });
        const lastEmail = await orchestrator.getLastEmail();
        expect(lastEmail).toBeDefined();
        expect(lastEmail.sender).toBe("<last-sender@example.com>");
        expect(lastEmail.recipients[0]).toBe("<last-recipient@example.com>");
        expect(lastEmail.subject).toBe("Last email");
        expect(lastEmail.text).toBe("This is the last email\n");
    });
});

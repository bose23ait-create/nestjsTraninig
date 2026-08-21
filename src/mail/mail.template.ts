export const welcomeTemplate = (name: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Welcome, ${name}!</h1>

        <p>
          Thank you for registering with our application.
        </p>

        <p>
          We are happy to have you with us.
        </p>

        <p>
          Regards,<br>
          My Application Team
        </p>
      </body>
    </html>
  `;
};
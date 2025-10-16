import nodemailer from 'nodemailer';

export class EmailService {
  private transporter!: nodemailer.Transporter;

  cosntructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async semdVerificationEmail(email: string, token: string, name: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'Nuevo usuario regiastrado - Aprobacion ',
      html: `
        <h2>Nuevo usuario registrado</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Token de verificación:</strong> ${token}</p>
        <p>Para aprobar este usuario, utiliza el siguiente endpoint:</p>
        <code>POST /api/auth/verify-email</code>
        <p>Con el body: { "token": "${token}" }</p>
        <hr>
        <p><small>Este es un email automático</small></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '¡Bienvenido a MIR Flashcard App!',
      html: `
        <h2>¡Bienvenido ${name}!</h2>
        <p>Tu cuenta ha sido verificada y ya puedes empezar a usar la aplicación.</p>
        <p>¡Comienza a crear tus flashcards y mejorar tu aprendizaje!</p>
        <hr>
        <p><small>Equipo MIR Flashcard App</small></p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

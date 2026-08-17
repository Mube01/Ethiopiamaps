import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    /*
     * Validate fields
     */
    if (
      !name ||
      !email ||
      !subject ||
      !message
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete all fields.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Validate email
     */
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Check environment variables
     */
    const apiKey =
      process.env.RESEND_API_KEY;

    const contactEmail =
      process.env.CONTACT_EMAIL;

    const fromEmail =
      process.env.RESEND_FROM_EMAIL;

    if (
      !apiKey ||
      !contactEmail ||
      !fromEmail
    ) {
      console.error(
        "Missing Resend environment variables."
      );

      return NextResponse.json(
        {
          error:
            "Email service is not configured correctly.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Send email
     */
    const { data, error } =
      await resend.emails.send({
        from: `Ethiopia Maps <${fromEmail}>`,
        to: [contactEmail],
        replyTo: email,
        subject: `Contact: ${subject}`,

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
            
            <h2 style="margin-bottom: 24px;">
              New Contact Message
            </h2>

            <p>
              <strong>Name:</strong>
              ${escapeHtml(name)}
            </p>

            <p>
              <strong>Email:</strong>
              ${escapeHtml(email)}
            </p>

            <p>
              <strong>Subject:</strong>
              ${escapeHtml(subject)}
            </p>

            <hr style="margin: 24px 0; border: 0; border-top: 1px solid #ddd;" />

            <p>
              <strong>Message:</strong>
            </p>

            <p>
              ${escapeHtml(message).replace(
                /\n/g,
                "<br />"
              )}
            </p>

          </div>
        `,
      });

    if (error) {
      console.error(
        "Resend error:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Failed to send email.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        id: data?.id,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Contact API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to send your message.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * Prevent HTML injection inside email content
 */
function escapeHtml(
  value: string
) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
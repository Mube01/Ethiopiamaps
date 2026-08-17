import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

type Artwork = {
  id?: string;
  slug?: string;
  title: string;
  image?: string;
  edition?: string;
  size?: string;
  format?: string;
  price: number;
  quantity: number;
  itemTotal: number;
};

type EnquiryPayload = {
  customer: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  };
  artworks: Artwork[];
  total: number;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(
  request: Request
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error(
        "RESEND_API_KEY is missing."
      );

      return NextResponse.json(
        {
          error:
            "Email service is not configured.",
        },
        { status: 500 }
      );
    }

    if (!process.env.CONTACT_EMAIL) {
      console.error(
        "CONTACT_EMAIL is missing."
      );

      return NextResponse.json(
        {
          error:
            "Contact email is not configured.",
        },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      console.error(
        "RESEND_FROM_EMAIL is missing."
      );

      return NextResponse.json(
        {
          error:
            "Sender email is not configured.",
        },
        { status: 500 }
      );
    }

    const body =
      (await request.json()) as EnquiryPayload;

    const name =
      body.customer?.name?.trim() || "";

    const email =
      body.customer?.email?.trim() || "";

    const phone =
      body.customer?.phone?.trim() || "";

    const message =
      body.customer?.message?.trim() || "";

    const artworks = Array.isArray(
      body.artworks
    )
      ? body.artworks
      : [];

    const total =
      typeof body.total === "number"
        ? body.total
        : 0;

    /*
     * Basic validation
     */
    if (!name) {
      return NextResponse.json(
        {
          error:
            "Please provide your full name.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error:
            "Please provide your email address.",
        },
        { status: 400 }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (artworks.length === 0) {
      return NextResponse.json(
        {
          error:
            "Your enquiry does not contain any artworks.",
        },
        { status: 400 }
      );
    }

    /*
     * Create artwork rows for the email.
     */
    const artworkRows = artworks
      .map((artwork) => {
        const image = artwork.image
          ? `
            <div style="margin-bottom: 20px;">
              <img
                src="${escapeHtml(artwork.image)}"
                alt="${escapeHtml(artwork.title)}"
                width="120"
                style="
                  width:120px;
                  height:150px;
                  object-fit:cover;
                  display:block;
                  border:1px solid #e5e0d8;
                "
              />
            </div>
          `
          : "";

        return `
          <tr>
            <td
              style="
                padding:24px 0;
                border-bottom:1px solid #e8e4dd;
                vertical-align:top;
              "
            >
              ${image}

              <div
                style="
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:10px;
                  letter-spacing:2px;
                  text-transform:uppercase;
                  color:#8C7355;
                  margin-bottom:7px;
                "
              >
                ${escapeHtml(
                  artwork.edition
                )}
              </div>

              <div
                style="
                  font-family:Georgia,'Times New Roman',serif;
                  font-size:24px;
                  color:#262626;
                  margin-bottom:8px;
                "
              >
                ${escapeHtml(
                  artwork.title
                )}
              </div>

              <div
                style="
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:12px;
                  line-height:20px;
                  color:#777;
                "
              >
                ${escapeHtml(
                  artwork.size
                )}
                ${
                  artwork.format
                    ? ` · ${escapeHtml(
                        artwork.format
                      )}`
                    : ""
                }
              </div>

              <div
                style="
                  margin-top:14px;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:12px;
                  color:#555;
                "
              >
                Quantity:
                <strong>
                  ${artwork.quantity}
                </strong>
              </div>

              <div
                style="
                  margin-top:6px;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:12px;
                  color:#555;
                "
              >
                Unit price:
                <strong>
                  ETB ${Number(
                    artwork.price
                  ).toLocaleString()}
                </strong>
              </div>

              <div
                style="
                  margin-top:8px;
                  font-family:Georgia,'Times New Roman',serif;
                  font-size:18px;
                  color:#262626;
                "
              >
                ETB ${Number(
                  artwork.itemTotal
                ).toLocaleString()}
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    /*
     * Main email sent to Ethiopia Maps.
     */
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>New Artwork Enquiry</title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f7f5f0;
          "
        >
          <div
            style="
              max-width:700px;
              margin:0 auto;
              padding:40px 20px;
            "
          >
            <div
              style="
                background:#ffffff;
                border:1px solid #e6e1d8;
              "
            >

              <!-- HEADER -->
              <div
                style="
                  padding:35px 35px 28px;
                  border-bottom:1px solid #e8e4dd;
                "
              >
                <div
                  style="
                    font-family:Georgia,'Times New Roman',serif;
                    font-size:27px;
                    font-weight:bold;
                    letter-spacing:1px;
                    color:#262626;
                  "
                >
                  ETHIOPIA MAPS
                </div>

                <div
                  style="
                    margin-top:12px;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:9px;
                    letter-spacing:2px;
                    text-transform:uppercase;
                    color:#8C7355;
                  "
                >
                  New Artwork Enquiry
                </div>
              </div>

              <!-- CUSTOMER -->
              <div style="padding:35px;">
                <div
                  style="
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:9px;
                    letter-spacing:2px;
                    text-transform:uppercase;
                    color:#8C7355;
                    margin-bottom:20px;
                  "
                >
                  Customer Details
                </div>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:13px;
                    color:#444;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding:7px 0;
                        width:120px;
                        color:#999;
                      "
                    >
                      Name
                    </td>

                    <td
                      style="
                        padding:7px 0;
                        font-weight:600;
                      "
                    >
                      ${escapeHtml(name)}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:7px 0;
                        color:#999;
                      "
                    >
                      Email
                    </td>

                    <td style="padding:7px 0;">
                      ${escapeHtml(email)}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:7px 0;
                        color:#999;
                      "
                    >
                      Phone
                    </td>

                    <td style="padding:7px 0;">
                      ${
                        escapeHtml(
                          phone
                        ) || "Not provided"
                      }
                    </td>
                  </tr>
                </table>

                ${
                  message
                    ? `
                      <div
                        style="
                          margin-top:25px;
                          padding-top:25px;
                          border-top:1px solid #e8e4dd;
                        "
                      >
                        <div
                          style="
                            font-family:Arial,Helvetica,sans-serif;
                            font-size:9px;
                            letter-spacing:2px;
                            text-transform:uppercase;
                            color:#999;
                            margin-bottom:10px;
                          "
                        >
                          Message
                        </div>

                        <div
                          style="
                            font-family:Arial,Helvetica,sans-serif;
                            font-size:13px;
                            line-height:22px;
                            color:#555;
                            white-space:pre-wrap;
                          "
                        >
                          ${escapeHtml(
                            message
                          )}
                        </div>
                      </div>
                    `
                    : ""
                }
              </div>

              <!-- ARTWORKS -->
              <div
                style="
                  padding:0 35px 35px;
                "
              >
                <div
                  style="
                    padding-top:25px;
                    border-top:1px solid #e8e4dd;
                    font-family:Arial,Helvetica,sans-serif;
                    font-size:9px;
                    letter-spacing:2px;
                    text-transform:uppercase;
                    color:#8C7355;
                    margin-bottom:5px;
                  "
                >
                  Artwork Selection
                </div>

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  ${artworkRows}
                </table>
              </div>

              <!-- TOTAL -->
              <div
                style="
                  margin:0 35px 35px;
                  padding:22px 0;
                  border-top:1px solid #262626;
                  border-bottom:1px solid #e8e4dd;
                "
              >
                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td
                      style="
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:9px;
                        letter-spacing:2px;
                        text-transform:uppercase;
                        color:#777;
                      "
                    >
                      Estimated Total
                    </td>

                    <td
                      align="right"
                      style="
                        font-family:Georgia,'Times New Roman',serif;
                        font-size:25px;
                        color:#262626;
                      "
                    >
                      ETB ${Number(
                        total
                      ).toLocaleString()}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- FOOTER -->
              <div
                style="
                  padding:25px 35px;
                  background:#faf9f6;
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:10px;
                  line-height:18px;
                  color:#999;
                  text-align:center;
                "
              >
                Ethiopia Maps
                <br />
                Artwork Enquiry
              </div>

            </div>
          </div>
        </body>
      </html>
    `;

    /*
     * Send the enquiry to Ethiopia Maps.
     */
    const { data, error } =
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: [process.env.CONTACT_EMAIL],
        replyTo: email,
        subject: `Artwork Enquiry — ${name}`,
        html: adminEmailHtml,
      });

    if (error) {
      console.error(
        "Resend enquiry error:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to send your enquiry.",
        },
        { status: 500 }
      );
    }

    console.log(
      "Artwork enquiry sent successfully:",
      data
    );

    return NextResponse.json({
      success: true,
      message:
        "Your artwork enquiry has been sent successfully.",
    });
  } catch (error) {
    console.error(
      "Enquiry API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while sending your enquiry. Please try again.",
      },
      { status: 500 }
    );
  }
}
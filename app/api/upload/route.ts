import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Verify admin authentication
    |--------------------------------------------------------------------------
    */

    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check Cloudinary environment variables
    |--------------------------------------------------------------------------
    */

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME;

    const apiKey =
      process.env.CLOUDINARY_API_KEY;

    const apiSecret =
      process.env.CLOUDINARY_API_SECRET;

    if (
      !cloudName ||
      !apiKey ||
      !apiSecret
    ) {
      console.error(
        "Cloudinary environment variables are missing."
      );

      return NextResponse.json(
        {
          error:
            "Cloudinary is not configured correctly.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Get uploaded file
    |--------------------------------------------------------------------------
    */

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "No image file was provided.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate file type
    |--------------------------------------------------------------------------
    */

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error:
            "Only image files are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate file size
    |
    | Maximum: 10 MB
    |--------------------------------------------------------------------------
    */

    const maxFileSize =
      10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          error:
            "Image must be smaller than 10MB.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Convert file to Base64
    |--------------------------------------------------------------------------
    */

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    const base64 =
      buffer.toString("base64");

    const dataUri =
      `data:${file.type};base64,${base64}`;

    /*
    |--------------------------------------------------------------------------
    | Create Cloudinary signature
    |--------------------------------------------------------------------------
    */

    const timestamp =
      Math.floor(
        Date.now() / 1000
      );

    const folder =
      "ethiopia-maps/artworks";

    const crypto =
      await import("crypto");

    const signatureString =
      `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

    const signature =
      crypto
        .createHash("sha1")
        .update(signatureString)
        .digest("hex");

    /*
    |--------------------------------------------------------------------------
    | Upload to Cloudinary
    |--------------------------------------------------------------------------
    */

    const cloudinaryUrl =
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const uploadData =
      new FormData();

    uploadData.append(
      "file",
      dataUri
    );

    uploadData.append(
      "api_key",
      apiKey
    );

    uploadData.append(
      "timestamp",
      String(timestamp)
    );

    uploadData.append(
      "folder",
      folder
    );

    uploadData.append(
      "signature",
      signature
    );

    const cloudinaryResponse =
      await fetch(
        cloudinaryUrl,
        {
          method: "POST",
          body: uploadData,
        }
      );

    const cloudinaryData =
      await cloudinaryResponse.json();

    /*
    |--------------------------------------------------------------------------
    | Handle Cloudinary errors
    |--------------------------------------------------------------------------
    */

    if (!cloudinaryResponse.ok) {
      console.error(
        "Cloudinary upload error:",
        cloudinaryData
      );

      return NextResponse.json(
        {
          error:
            cloudinaryData?.error?.message ||
            "Cloudinary upload failed.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Return image information
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,

        url:
          cloudinaryData.secure_url,

        publicId:
          cloudinaryData.public_id,

        width:
          cloudinaryData.width,

        height:
          cloudinaryData.height,

        format:
          cloudinaryData.format,

        bytes:
          cloudinaryData.bytes,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Upload API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Image upload failed.",
      },
      {
        status: 500,
      }
    );
  }
}
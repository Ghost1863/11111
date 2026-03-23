import fs from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return new Response("Missing slug parameter", { status: 400 });
    }

    const sanitizedSlug = path.basename(slug);

    const pluginDir = path.join(
      process.cwd(),
      "content",
      "plugins",
      sanitizedSlug,
    );

    for (const ext of IMAGE_EXTENSIONS) {
      const iconPath = path.join(pluginDir, `icon${ext}`);

      try {
        const fileBuffer = await fs.readFile(iconPath);

        let contentType = "application/octet-stream";
        switch (ext.toLowerCase()) {
          case ".png":
            contentType = "image/png";
            break;
          case ".jpg":
          case ".jpeg":
            contentType = "image/jpeg";
            break;
          case ".gif":
            contentType = "image/gif";
            break;
          case ".webp":
            contentType = "image/webp";
            break;
          case ".svg":
            contentType = "image/svg+xml";
            break;
        }

        return new Response(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {}
    }

    // If no Icon file was found, return 404
    return new Response("Icon not found", { status: 404 });
  } catch (error) {
    console.error("Error serving plugin icon:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

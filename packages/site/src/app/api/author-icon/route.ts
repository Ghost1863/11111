import fs from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Missing id parameter", { status: 400 });
    }

    const sanitizedId = path.basename(id);

    const authorDir = path.join(
      process.cwd(),
      "content",
      "authors",
      sanitizedId,
    );

    for (const ext of IMAGE_EXTENSIONS) {
      const iconPath = path.join(authorDir, `icon${ext}`);

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
            "Cache-Control": "public, max-age=3600",
          },
        });
      } catch {}
    }

    const communityIconPath = path.join(
      process.cwd(),
      "src",
      "svg",
      "icons",
      "community.svg",
    );

    try {
      const communityIconBuffer = await fs.readFile(communityIconPath);
      return new Response(communityIconBuffer, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      return new Response("Author icon not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error serving author icon:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

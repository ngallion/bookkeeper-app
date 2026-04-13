/**
 * Downscales an image File to fit within maxWidth × maxHeight, then
 * re-encodes it as JPEG at the given quality (0–1).
 *
 * The aspect ratio is always preserved; images smaller than the target
 * dimensions are left at their original size (no upscaling).
 */
export function downscaleImage(
  file: File,
  maxWidth = 300,
  maxHeight = 450,
  quality = 0.82,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get 2D canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob returned null"));
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for downscaling"));
    };

    img.src = objectUrl;
  });
}

export async function compressImage(file: File, maxDimension = 1800): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Photo processing failed")), "image/jpeg", 0.82),
  );
  bitmap.close();
  return new File([blob], `${crypto.randomUUID()}.jpg`, { type: "image/jpeg" });
}

export function selectPhotos(files: FileList | null) {
  return Array.from(files ?? []).map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) }));
}

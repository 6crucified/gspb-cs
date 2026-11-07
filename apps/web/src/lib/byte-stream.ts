export function responseBodyFromBytes(bytes: Uint8Array): BodyInit {
  const chunkSize = 32 * 1024;
  if (bytes.byteLength <= chunkSize) {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  }
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        controller.enqueue(bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)));
      }
      controller.close();
    },
  });
  return stream;
}

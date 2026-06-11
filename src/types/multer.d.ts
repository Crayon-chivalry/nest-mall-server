declare module 'multer' {
  type Callback = (error: Error | null, value: string | boolean) => void;

  interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
  }

  interface DiskStorageOptions {
    destination?: (
      request: unknown,
      file: MulterFile,
      callback: (error: Error | null, destination: string) => void,
    ) => void;
    filename?: (
      request: unknown,
      file: MulterFile,
      callback: (error: Error | null, filename: string) => void,
    ) => void;
  }

  interface FileFilterCallback {
    (error: Error | null, acceptFile: boolean): void;
  }

  export function diskStorage(options: DiskStorageOptions): unknown;
  export type { MulterFile, FileFilterCallback };
}

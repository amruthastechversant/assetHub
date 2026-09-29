/**
 * Attachment Validation Rules:
 *
 * 1. Maximum attachments:
 *    arrayLen(uploadedFiles) GT 3 -> "Maximum 3 attachments allowed."
 *
 * 2. Allowed file extensions:
 *    allowedExtensions = "jpg,jpeg,png,mp4"
 *    !listFindNoCase(allowedExtensions, fileExt) -> "Invalid file type."
 *
 * 3. Max file size:
 *    maxFileSize = 25 * 1024 * 1024 (25 MB)
 *    fileData.fileSize GT maxFileSize -> "File exceeds 5MB."
 */

export const ATTACHMENT_RULES = {
  MAX_ATTACHMENTS: 3,
  ALLOWED_EXTENSIONS: ["jpg", "jpeg", "png", "mp4"] as const,
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25 MB in bytes
  ERRORS: {
    MAX_COUNT_EXCEEDED: "Maximum 3 attachments allowed.",
    INVALID_FILE_TYPE: "Invalid file type.",
    FILE_EXCEEDS_SIZE: "File exceeds 5MB.",
  },
} as const;

export interface FileMetadata {
  name: string;
  size: number;
}

export interface AttachmentValidationResult {
  valid: boolean;
  error?: string;
  details?: string;
}

/**
 *
 * @param files Array of uploaded files or file metadata.
 * @returns AttachmentValidationResult indicating validity and error reason.
 */
export function validateAttachments(
  files: FileMetadata[]
): AttachmentValidationResult {
  // 1. Validate count: max 3 attachments
  if (files.length > ATTACHMENT_RULES.MAX_ATTACHMENTS) {
    return {
      valid: false,
      error: ATTACHMENT_RULES.ERRORS.MAX_COUNT_EXCEEDED,
      details: `Maximum 3 attachments allowed (received ${files.length}).`,
    };
  }

  // 2. Validate individual files
  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    if (!(ATTACHMENT_RULES.ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
      return {
        valid: false,
        error: ATTACHMENT_RULES.ERRORS.INVALID_FILE_TYPE,
        details: `File '${file.name}' has invalid extension '.${ext}'. Allowed extensions: ${ATTACHMENT_RULES.ALLOWED_EXTENSIONS.join(
          ", "
        )}.`,
      };
    }

    if (file.size > ATTACHMENT_RULES.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: ATTACHMENT_RULES.ERRORS.FILE_EXCEEDS_SIZE,
        details: `File '${file.name}' (${file.size} bytes) exceeds the 25MB limit.`,
      };
    }
  }

  return { valid: true };
}

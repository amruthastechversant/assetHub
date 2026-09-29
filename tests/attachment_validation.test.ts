import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  validateAttachments,
  ATTACHMENT_RULES,
} from "../src/lib/attachmentValidation.ts";

describe("Attachment Validation Rules (ColdFusion userSupport spec)", () => {
  describe("1. Attachment Count Validation", () => {
    test("Accepts 0 attachments (optional)", () => {
      const res = validateAttachments([]);
      assert.equal(res.valid, true);
    });

    test("Accepts 1, 2, or 3 attachments", () => {
      const files = [
        { name: "photo1.jpg", size: 1024 },
        { name: "photo2.png", size: 2048 },
        { name: "video.mp4", size: 5000 },
      ];
      const res = validateAttachments(files);
      assert.equal(res.valid, true);
    });

    test("Rejects more than 3 attachments with exact ColdFusion error", () => {
      const files = [
        { name: "1.jpg", size: 100 },
        { name: "2.jpg", size: 100 },
        { name: "3.jpg", size: 100 },
        { name: "4.jpg", size: 100 },
      ];
      const res = validateAttachments(files);
      assert.equal(res.valid, false);
      assert.equal(res.error, ATTACHMENT_RULES.ERRORS.MAX_COUNT_EXCEEDED);
      assert.equal(res.error, "Maximum 3 attachments allowed.");
    });
  });

  describe("2. Allowed Extension Validation (jpg, jpeg, png, mp4)", () => {
    test("Accepts valid extensions case-insensitively", () => {
      assert.equal(validateAttachments([{ name: "test.jpg", size: 100 }]).valid, true);
      assert.equal(validateAttachments([{ name: "test.JPEG", size: 100 }]).valid, true);
      assert.equal(validateAttachments([{ name: "test.PNG", size: 100 }]).valid, true);
      assert.equal(validateAttachments([{ name: "recording.MP4", size: 100 }]).valid, true);
    });

    test("Rejects disallowed extensions with 'Invalid file type.'", () => {
      const disallowed = ["doc.pdf", "script.sh", "data.csv", "archive.zip", "test.gif", "notes.txt"];
      for (const name of disallowed) {
        const res = validateAttachments([{ name, size: 100 }]);
        assert.equal(res.valid, false);
        assert.equal(res.error, ATTACHMENT_RULES.ERRORS.INVALID_FILE_TYPE);
        assert.equal(res.error, "Invalid file type.");
      }
    });

    test("Rejects file without extension", () => {
      const res = validateAttachments([{ name: "noextension", size: 100 }]);
      assert.equal(res.valid, false);
      assert.equal(res.error, "Invalid file type.");
    });
  });

  describe("3. File Size Validation (max 25MB)", () => {
    test("Accepts files up to 25MB (26,214,400 bytes)", () => {
      const res = validateAttachments([
        { name: "video.mp4", size: 25 * 1024 * 1024 },
      ]);
      assert.equal(res.valid, true);
    });

    test("Rejects files exceeding 25MB with 'File exceeds 5MB.' (CF message)", () => {
      const res = validateAttachments([
        { name: "huge_video.mp4", size: 25 * 1024 * 1024 + 1 },
      ]);
      assert.equal(res.valid, false);
      assert.equal(res.error, ATTACHMENT_RULES.ERRORS.FILE_EXCEEDS_SIZE);
      assert.equal(res.error, "File exceeds 5MB.");
    });
  });
});

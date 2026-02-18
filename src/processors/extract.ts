import type { PipelineComponent } from "../core/types";
import { QirrelContext, Entity } from "../types";
import validator from "validator";
import { findPhoneNumbersInText, type CountryCode } from "libphonenumber-js";

export const extract: PipelineComponent = {
  name: "extract",
  version: "1.0.0",
  cacheable: true,
  run: (input: QirrelContext): Promise<QirrelContext> => {
    try {
      if (input.data) {
        extractEmails(input.data);
      }
    } catch (e) {
      console.warn("Email extraction failed:", e);
    }

    try {
      if (input.data) {
        extractPhones(input.data);
      }
    } catch (e) {
      console.warn("Phone extraction failed:", e);
    }

    try {
      if (input.data) {
        extractUrls(input.data);
      }
    } catch (e) {
      console.warn("URL extraction failed:", e);
    }

    try {
      if (input.data) {
        extractNumbers(input.data);
      }
    } catch (e) {
      console.warn("Number extraction failed:", e);
    }

    return Promise.resolve(input);
  }
};

export const extractEmailsOnly: PipelineComponent = {
  name: "extractEmailsOnly",
  version: "1.0.0",
  cacheable: true,
  run: (input: QirrelContext): Promise<QirrelContext> => {
    try {
      if (input.data) {
        extractEmails(input.data);
      }
    } catch (e) {
      console.warn("Email extraction failed:", e);
    }
    return Promise.resolve(input);
  }
};

export const extractPhonesOnly: PipelineComponent = {
  name: "extractPhonesOnly",
  version: "1.0.0",
  cacheable: true,
  run: (input: QirrelContext): Promise<QirrelContext> => {
    try {
      if (input.data) {
        extractPhones(input.data);
      }
    } catch (e) {
      console.warn("Phone extraction failed:", e);
    }
    return Promise.resolve(input);
  }
};

export const extractUrlsOnly: PipelineComponent = {
  name: "extractUrlsOnly",
  version: "1.0.0",
  cacheable: true,
  run: (input: QirrelContext): Promise<QirrelContext> => {
    try {
      if (input.data) {
        extractUrls(input.data);
      }
    } catch (e) {
      console.warn("URL extraction failed:", e);
    }
    return Promise.resolve(input);
  }
};

export const extractNumbersOnly: PipelineComponent = {
  name: "extractNumbersOnly",
  version: "1.0.0",
  cacheable: true,
  run: (input: QirrelContext): Promise<QirrelContext> => {
    try {
      if (input.data) {
        extractNumbers(input.data);
      }
    } catch (e) {
      console.warn("Number extraction failed:", e);
    }
    return Promise.resolve(input);
  }
};

function extractEmails(inputData: { text: string; entities: Entity[] }): void {
  const text = inputData.text;

  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  let match: RegExpExecArray | null;

  while ((match = emailPattern.exec(text)) !== null) {
    const potentialEmail = match[0];
    if (validator.isEmail(potentialEmail)) {
      inputData.entities.push({
        type: "email",
        value: potentialEmail,
        start: match.index,
        end: match.index + potentialEmail.length,
      });
    }
  }
}

function extractPhones(inputData: { text: string; entities: Entity[] }): void {
  const text = inputData.text;
  const fallbackCountries: CountryCode[] = [
    "US",
    "GB",
    "DE",
    "FR",
    "ES",
    "IT",
    "AU",
    "NG",
    "CA",
  ];

  const candidates = new Map<string, { value: string; start: number; end: number }>();

  const collectMatches = (
    found: ReturnType<typeof findPhoneNumbersInText>,
  ): void => {
    for (const entry of found) {
      if (!entry.number.isValid()) {
        continue;
      }

      const rawValue = text.slice(entry.startsAt, entry.endsAt);
      const digitCount = rawValue.replace(/\D/g, "").length;
      // Prevent short reference numbers from being mislabeled as phone numbers.
      if (!rawValue.includes("+") && digitCount < 10) {
        continue;
      }

      const key = `${entry.startsAt}:${entry.endsAt}`;
      const existing = candidates.get(key);
      if (!existing || rawValue.length > existing.value.length) {
        candidates.set(key, {
          value: rawValue,
          start: entry.startsAt,
          end: entry.endsAt,
        });
      }
    }
  };

  collectMatches(findPhoneNumbersInText(text));
  for (const country of fallbackCountries) {
    collectMatches(findPhoneNumbersInText(text, { defaultCountry: country }));
  }

  const nonOverlapping = Array.from(candidates.values())
    .sort(
      (a, b) =>
        b.end - b.start - (a.end - a.start) || a.start - b.start,
    )
    .reduce<Array<{ value: string; start: number; end: number }>>(
      (accepted, candidate) => {
        const overlaps = accepted.some(
          (existing) =>
            candidate.start < existing.end && candidate.end > existing.start,
        );
        if (!overlaps) {
          accepted.push(candidate);
        }
        return accepted;
      },
      [],
    )
    .sort((a, b) => a.start - b.start);

  for (const phone of nonOverlapping) {
    const alreadyPresent = inputData.entities.some(
      (entity) =>
        entity.type === "phone" &&
        entity.start === phone.start &&
        entity.end === phone.end &&
        entity.value === phone.value,
    );
    if (!alreadyPresent) {
      inputData.entities.push({
        type: "phone",
        value: phone.value,
        start: phone.start,
        end: phone.end,
      });
    }
  }
}

function extractUrls(inputData: { text: string; entities: Entity[] }): void {
  const text = inputData.text;

  // Find potential URLs by looking for common protocol prefixes
  const urlPattern = /(https?:\/\/[^\s"'<>\]]+)/g;
  let match;

  while ((match = urlPattern.exec(text)) !== null) {
    const matchedUrl = match[0];
    const url = trimTrailingUrlPunctuation(matchedUrl);
    if (!url) {
      continue;
    }

    // Use validator to properly validate the URL
    if (validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
      inputData.entities.push({
        type: "url",
        value: url,
        start: match.index,
        end: match.index + url.length,
      });
    }
  }
}

function trimTrailingUrlPunctuation(value: string): string {
  let end = value.length;
  while (end > 0 && ".,!?;:)]}".includes(value[end - 1]!)) {
    end--;
  }
  return value.slice(0, end);
}

function extractNumbers(inputData: { text: string; entities: Entity[] }): void {
  const text = inputData.text;

  // Find potential numbers using a regex
  const numberPattern = /-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g;
  let match;

  while ((match = numberPattern.exec(text)) !== null) {
    const numStr = match[0];
    // Validate using both validator and built-in parsing
    if (validator.isNumeric(numStr) || (!isNaN(parseFloat(numStr)) && isFinite(parseFloat(numStr)))) {
      inputData.entities.push({
        type: "number",
        value: numStr,
        start: match.index,
        end: match.index + numStr.length,
      });
    }
  }
}

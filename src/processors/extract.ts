import type { PipelineComponent } from "../core/types";
import { QirrelContext, Entity } from "../types";
import validator from "validator";
import { parsePhoneNumber } from 'libphonenumber-js';

export const extract: PipelineComponent = (
  input: QirrelContext,
): QirrelContext => {
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

  return input;
};

export const extractEmailsOnly: PipelineComponent = (
  input: QirrelContext,
): QirrelContext => {
  try {
    if (input.data) {
      extractEmails(input.data);
    }
  } catch (e) {
    console.warn("Email extraction failed:", e);
  }
  return input;
};

export const extractPhonesOnly: PipelineComponent = (
  input: QirrelContext,
): QirrelContext => {
  try {
    if (input.data) {
      extractPhones(input.data);
    }
  } catch (e) {
    console.warn("Phone extraction failed:", e);
  }
  return input;
};

export const extractUrlsOnly: PipelineComponent = (
  input: QirrelContext,
): QirrelContext => {
  try {
    if (input.data) {
      extractUrls(input.data);
    }
  } catch (e) {
    console.warn("URL extraction failed:", e);
  }
  return input;
};

export const extractNumbersOnly: PipelineComponent = (
  input: QirrelContext,
): QirrelContext => {
  try {
    if (input.data) {
      extractNumbers(input.data);
    }
  } catch (e) {
    console.warn("Number extraction failed:", e);
  }
  return input;
};

function extractEmails(inputData: { text: string; entities: Entity[] }): void {
  const text = inputData.text;

  // Use validator to find and validate emails more reliably
  // First, find potential emails using a simple pattern, then validate with library
  const potentialEmails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];

  for (const potentialEmail of potentialEmails) {
    if (validator.isEmail(potentialEmail)) {
      const startIndex = text.indexOf(potentialEmail);
      if (startIndex !== -1) {
        inputData.entities.push({
          type: "email",
          value: potentialEmail,
          start: startIndex,
          end: startIndex + potentialEmail.length,
        });
      }
    }
  }
}

function extractPhones(inputData: { text: string; entities: Entity[] }): void {
  const text = inputData.text;

  // More comprehensive regex to capture various phone formats
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(\+?[1-9]\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
  let match;

  // Extract all potential phone numbers
  const potentialPhones = [];
  while ((match = phoneRegex.exec(text)) !== null) {
    // Get the full matched string
    const fullMatch = match[0];
    potentialPhones.push({
      number: fullMatch,
      start: match.index,
      end: match.index + fullMatch.length
    });
  }

  // Validate each potential phone number using libphonenumber-js
  for (const potential of potentialPhones) {
    try {
      // Try parsing with different country codes as fallback
      let isValid = false;
      const possibleCountries = ['US', 'GB', 'DE', 'FR', 'ES', 'IT', 'AU'] as const;

      for (const country of possibleCountries) {
        try {
          const phoneNumber = parsePhoneNumber(potential.number, country);
          if (phoneNumber.isValid()) {
            isValid = true;
            break;
          }
        } catch (e) {
          // Try next country
          continue;
        }
      }

      // If still not valid, try without specifying a country
      if (!isValid) {
        try {
          const phoneNumber = parsePhoneNumber(potential.number, { extract: false });
          if (phoneNumber.isValid()) {
            isValid = true;
          }
        } catch (e) {
          // Ignore - will remain invalid
        }
      }

      if (isValid) {
        inputData.entities.push({
          type: "phone",
          value: potential.number,
          start: potential.start,
          end: potential.end,
        });
      }
    } catch (e) {
      // If parsing fails, skip this number
      continue;
    }
  }
}

function extractUrls(inputData: { text: string; entities: Entity[] }): void {
  const text = inputData.text;

  // Find potential URLs by looking for common protocol prefixes
  const urlPattern = /(https?:\/\/[^\s"'<>\]]+)/g;
  let match;

  while ((match = urlPattern.exec(text)) !== null) {
    const url = match[0];
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

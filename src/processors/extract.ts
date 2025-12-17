import type { PipelineComponent } from "../core/types";
import { QirrelContext, Entity } from "../types";
import validator from "validator";
import { findPhoneNumbersInText, parsePhoneNumber } from "libphonenumber-js/max";

export const extract: PipelineComponent = {
  name: "extract",
  version: "1.0.0",
  cacheable: true,
  run: async (input: QirrelContext): Promise<QirrelContext> => {
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
  },
};

export const extractEmailsOnly: PipelineComponent = {
  name: "extractEmailsOnly",
  version: "1.0.0",
  cacheable: true,
  run: async (input: QirrelContext): Promise<QirrelContext> => {
    try {
      if (input.data) {
        extractEmails(input.data);
      }
    } catch (e) {
      console.warn("Email extraction failed:", e);
    }
    return Promise.resolve(input);
  },
};

export const extractPhonesOnly: PipelineComponent = {
  name: "extractPhonesOnly",
  version: "1.0.0",
  cacheable: true,
  run: async (input: QirrelContext): Promise<QirrelContext> => {
    try {
      if (input.data) {
        extractPhones(input.data);
      }
    } catch (e) {
      console.warn("Phone extraction failed:", e);
    }
    return Promise.resolve(input);
  },
};

export const extractUrlsOnly: PipelineComponent = {
  name: "extractUrlsOnly",
  version: "1.0.0",
  cacheable: true,
  run: async (input: QirrelContext): Promise<QirrelContext> => {
    try {
      if (input.data) {
        extractUrls(input.data);
      }
    } catch (e) {
      console.warn("URL extraction failed:", e);
    }
    return Promise.resolve(input);
  },
};

export const extractNumbersOnly: PipelineComponent = {
  name: "extractNumbersOnly",
  version: "1.0.0",
  cacheable: true,
  run: async (input: QirrelContext): Promise<QirrelContext> => {
    try {
      if (input.data) {
        extractNumbers(input.data);
      }
    } catch (e) {
      console.warn("Number extraction failed:", e);
    }
    return Promise.resolve(input);
  },
};

function extractEmails(inputData: { text: string; entities: Entity[] }): void {
  const text = inputData.text;

  // Use validator to find and validate emails more reliably
  // First, find potential emails using a simple pattern, then validate with library
  const potentialEmails =
    text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];

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
  const phonePatterns = [
    /\+?1[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
    /\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, 
    /\+?[1-9]\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g  
  ];

  for (const pattern of phonePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const fullMatch = match[0];
      const start = match.index;
      const end = start + fullMatch.length;

      try {
        // Try to parse and validate the matched number
        let phoneNumberObj;

        // Try parsing with US as default
        try {
          phoneNumberObj = parsePhoneNumber(fullMatch, 'US');
        } catch (e) {
          // If that fails, try without country (for international formats)
          try {
            phoneNumberObj = parsePhoneNumber(fullMatch);
          } catch (e2) {
            continue; 
          }
        }

        if (phoneNumberObj && phoneNumberObj.isPossible()) {
          // If possible length (which is less strict than isValid()), add as entity
          inputData.entities.push({
            type: "phone",
            value: phoneNumberObj.number,
            start: start,
            end: end,
          });
        }
      } catch (e) {
        continue;
      }
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
    if (
      validator.isURL(url, {
        protocols: ["http", "https"],
        require_protocol: true,
      })
    ) {
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
    if (
      validator.isNumeric(numStr) ||
      (!isNaN(parseFloat(numStr)) && isFinite(parseFloat(numStr)))
    ) {
      inputData.entities.push({
        type: "number",
        value: numStr,
        start: match.index,
        end: match.index + numStr.length,
      });
    }
  }
}

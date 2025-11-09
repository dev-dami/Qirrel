import type { PipelineComponent } from "../core/types";
import { IntentResult } from "../types";

export const extract: PipelineComponent = (
  input: IntentResult,
): IntentResult => {
  // Extract email addresses
  try {
    extractEmails(input);
  } catch (e) {
    console.warn('Email extraction failed:', e);
  }
  
  // Extract phone numbers
  try {
    extractPhones(input);
  } catch (e) {
    console.warn('Phone extraction failed:', e);
  }
  
  // Extract URLs
  try {
    extractUrls(input);
  } catch (e) {
    console.warn('URL extraction failed:', e);
  }
  
  // Extract numbers (already handled by tokenizer, but we'll double-check)
  try {
    extractNumbers(input);
  } catch (e) {
    console.warn('Number extraction failed:', e);
  }

  return input;
};

// Individual extraction functions that can be used separately
export const extractEmailsOnly: PipelineComponent = (input: IntentResult): IntentResult => {
  try {
    extractEmails(input);
  } catch (e) {
    console.warn('Email extraction failed:', e);
  }
  return input;
};

export const extractPhonesOnly: PipelineComponent = (input: IntentResult): IntentResult => {
  try {
    extractPhones(input);
  } catch (e) {
    console.warn('Phone extraction failed:', e);
  }
  return input;
};

export const extractUrlsOnly: PipelineComponent = (input: IntentResult): IntentResult => {
  try {
    extractUrls(input);
  } catch (e) {
    console.warn('URL extraction failed:', e);
  }
  return input;
};

export const extractNumbersOnly: PipelineComponent = (input: IntentResult): IntentResult => {
  try {
    extractNumbers(input);
  } catch (e) {
    console.warn('Number extraction failed:', e);
  }
  return input;
};

function extractEmails(input: IntentResult): void {
  const text = input.text;
  // Simple and safe email extraction without complex loops
  // Find @ symbols and check surrounding text for valid email format
  
  // Keep track of email positions to avoid duplicate processing
  const processedEmails = new Set<string>();
  
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '@') {
      // Define reasonable search boundaries
      const startSearch = Math.max(0, i - 30);  // Don't look more than 30 chars back
      const endSearch = Math.min(text.length, i + 30);  // Don't look more than 30 chars forward
      
      // Look backwards for the start of the email address
      let start = i;
      for (let j = i - 1; j >= startSearch; j--) {
        const char = text[j];
        if (char === undefined || !/[a-zA-Z0-9._%+-]/.test(char)) {
          start = j + 1;
          break;
        }
        if (j === startSearch) {
          start = j; // If we reached the search boundary, use it as start
        }
      }
      
      // Look forwards for the end of the email address
      let end = i;
      for (let j = i + 1; j < endSearch; j++) {
        const char = text[j];
        if (char === undefined || !/[a-zA-Z0-9.-]/.test(char)) {
          end = j;
          break;
        }
        if (j === endSearch - 1) {
          end = j + 1; // If we reached the search boundary, include the character
        }
      }
      
      // Extract the potential email
      if (start < i && i < end) {  // Ensure we have a valid range
        const potentialEmail = text.substring(start, end);
        
        // Check if it's a valid email format
        if (isValidEmail(potentialEmail) && !processedEmails.has(potentialEmail)) {
          input.entities.push({
            type: 'email',
            value: potentialEmail,
            start,
            end,
          });
          processedEmails.add(potentialEmail);
        }
      }
    }
  }
}

// Helper function for email validation without complex regex
function isValidEmail(str: string): boolean {
  if (!str.includes('@')) return false;
  const parts = str.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) return false;
  if (!domainPart.includes('.')) return false;
  
  // Basic character validation
  if (!/^[a-zA-Z0-9._%+-]+$/.test(localPart)) return false;
  if (!/^[a-zA-Z0-9.-]+$/.test(domainPart)) return false;
  
  return true;
}

function extractPhones(input: IntentResult): void {
  const text = input.text;
  const maxIterations = text.length; // Safety limit
  let iterations = 0;
  
  for (let i = 0; i < text.length && iterations < maxIterations; i++, iterations++) {
    // Check if we're at the start of a potential phone number
    const char = text[i];
    if (char && isDigit(char) || char === '+' || char === '(') {
      // Look ahead to find a potential phone number pattern
      let phoneEnd = i;
      let digitCount = 0;
      let validPhoneChars = 0;
      
      // Look ahead up to 20 characters to find a potential phone
      const lookAheadLimit = Math.min(text.length, i + 20);
      
      while (phoneEnd < lookAheadLimit) {
        const c = text[phoneEnd];
        if (c && isDigit(c)) {
          digitCount++;
          validPhoneChars++;
        } else if (c && ['-', '.', ' ', '(', ')', '+'].includes(c)) {
          validPhoneChars++;
        } else {
          break; // Invalid character for phone number
        }
        phoneEnd++;
      }
      
      // A valid phone number should have 10-15 digits
      if (digitCount >= 10 && digitCount <= 15 && validPhoneChars === (phoneEnd - i)) {
        const potentialPhone = text.substring(i, phoneEnd);
        
        // Safety: don't add if we've seen this exact phone already in this run
        const existing = input.entities.find(e => e.value === potentialPhone && e.type === 'phone');
        if (!existing && !input.entities.some(e => e.value === potentialPhone && e.type === 'phone')) {
          input.entities.push({
            type: 'phone',
            value: potentialPhone,
            start: i,
            end: phoneEnd,
          });
        }
        
        // Skip the processed phone number to avoid overlapping matches
        i = phoneEnd - 1;
      }
    }
  }
}

function extractUrls(input: IntentResult): void {
  const text = input.text;
  const protocols = ['http://', 'https://'];
  
  for (const protocol of protocols) {
    let searchStart = 0;
    while (searchStart < text.length) {
      const protocolIndex = text.indexOf(protocol, searchStart);
      if (protocolIndex === -1) break;
      
      // Find the end of the URL (space, newline, or end of text)
      let urlEnd = protocolIndex + protocol.length;
      while (urlEnd < text.length) {
        const char = text[urlEnd];
        if (char === undefined || [' ', '\n', '\r', '\t', '<', '>', '(', ')', '[', ']', '{', '}'].includes(char)) {
          break;
        }
        urlEnd++;
      }
      
      const url = text.substring(protocolIndex, urlEnd);
      if (url && isValidUrl(url)) {
        input.entities.push({
          type: 'url',
          value: url,
          start: protocolIndex,
          end: urlEnd,
        });
      }
      
      // Advance search position to avoid infinite loops
      searchStart = urlEnd > searchStart ? urlEnd : searchStart + 1;
    }
  }
}

function isValidUrl(url: string): boolean {
  // Basic validation for URL format
  const parts = url.split('://');
  if (parts.length !== 2) return false;
  
  const protocol = parts[0];
  const path = parts[1];
  
  if (!protocol || !path || !['http', 'https'].includes(protocol)) return false;
  
  // Check for domain-like structure
  const domainPath = path.split('/')[0];
  if (!domainPath) return false;
  
  const domainParts = domainPath.split('.');
  if (domainParts.length < 2) return false;
  
  // Check that domain parts are not empty and have valid characters
  for (const part of domainParts) {
    if (!part || !/^[a-zA-Z0-9-]+$/.test(part)) {
      return false;
    }
  }
  
  return true;
}

function extractNumbers(input: IntentResult): void {
  // Extract numbers using a non-regex approach
  // This finds sequences of digits that might include decimal points
  
  const text = input.text;
  let i = 0;
  
  while (i < text.length) {
    // Find start of a potential number
    while (i < text.length) {
      const currentChar = text[i];
      if (currentChar !== undefined && (isDigit(currentChar) || currentChar === '.')) {
        break;
      }
      i++;
    }
    
    if (i >= text.length) break;
    
    let start = i;
    let hasDecimal = false;
    
    // Extract the number
    let validNumber = false;
    while (i < text.length) {
      const char = text[i];
      if (char === undefined) {
        break;
      }
      
      if (isDigit(char)) {
        validNumber = true; // Mark that we found at least one digit
        i++;
      } else if (char === '.' && !hasDecimal) {
        // Check if this is actually a decimal point or just a separator
        // by looking at what comes before and after
        const prevChar = text[i - 1];
        const nextChar = text[i + 1];
        if (i > 0 && prevChar !== undefined && isDigit(prevChar) && 
            i < text.length - 1 && nextChar !== undefined && isDigit(nextChar)) {
          hasDecimal = true;
          validNumber = true; // Mark that we found a valid decimal
          i++;
        } else {
          break; // Not a decimal point in a number
        }
      } else {
        break; // End of number
      }
    }
    
    if (i > start && validNumber) {
      const numberValue = text.substring(start, i);
      
      // Validate that this is indeed a number (not just a digit in a larger string)
      if (isNumber(numberValue)) {
        input.entities.push({
          type: 'number',
          value: numberValue,
          start,
          end: i,
        });
      }
    } else if (i === start) {
      // If we didn't advance at all from start position, make sure to move forward by 1
      // This handles cases where we have a '.' by itself or other non-number characters
      i++;
    }
  }
}

function isDigit(char: string | undefined): boolean {
  if (char === undefined) return false;
  return char >= '0' && char <= '9';
}

function isNumber(str: string): boolean {
  return !isNaN(parseFloat(str)) && isFinite(parseFloat(str));
}

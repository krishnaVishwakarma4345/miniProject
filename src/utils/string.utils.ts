/**
 * String Utility Functions
 *
 * Common string operations: formatting, validation, transformation.
 */

/**
 * Capitalize first letter of string
 * @param str - Input string
 * @returns Capitalized string
 *
 * @example
 * capitalize('hello world')
 * // "Hello world"
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalize first letter of each word
 * @param str - Input string
 * @returns Title cased string
 *
 * @example
 * titleCase('hello world')
 * // "Hello World"
 */
export function titleCase(str: string): string {
  return str
    .split(/\s+/)
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Convert string to kebab-case
 * @param str - Input string
 * @returns Kebab-cased string
 *
 * @example
 * toKebabCase('Hello World')
 * // "hello-world"
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Convert string to snake_case
 * @param str - Input string
 * @returns Snake-cased string
 *
 * @example
 * toSnakeCase('Hello World')
 * // "hello_world"
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

/**
 * Convert string to camelCase
 * @param str - Input string
 * @returns camelCased string
 *
 * @example
 * toCamelCase('hello world')
 * // "helloWorld"
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
    .replace(/^(.)/, (match) => match.toLowerCase());
}

/**
 * Truncate string to max length with ellipsis
 * @param str - Input string
 * @param maxLength - Maximum length
 * @param suffix - Suffix for truncation (default: '...')
 * @returns Truncated string
 *
 * @example
 * truncate('Hello World', 8)
 * // "Hello..."
 */
export function truncate(str: string, maxLength: number, suffix: string = "..."): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Remove whitespace from string
 * @param str - Input string
 * @returns String without extra whitespace
 *
 * @example
 * normalizeWhitespace('Hello    World')
 * // "Hello World"
 */
export function normalizeWhitespace(str: string): string {
  return str.trim().replace(/\s+/g, " ");
}

/**
 * Remove special characters
 * @param str - Input string
 * @param allowed - Characters to keep (default: alphanumeric and space)
 * @returns Cleaned string
 *
 * @example
 * removeSpecialChars('Hello@World#123')
 * // "HelloWorld123"
 */
export function removeSpecialChars(str: string, allowed: string = ""): string {
  const pattern = new RegExp(`[^a-zA-Z0-9 ${allowed}]`, "g");
  return str.replace(pattern, "");
}

/**
 * Slug-ify string for URLs
 * @param str - Input string
 * @returns URL-safe slug
 *
 * @example
 * slugify('Hello World!')
 * // "hello-world"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Reverse string
 * @param str - Input string
 * @returns Reversed string
 *
 * @example
 * reverse('Hello')
 * // "olleH"
 */
export function reverse(str: string): string {
  return str.split("").reverse().join("");
}

/**
 * Check if string contains substring (case-insensitive)
 * @param str - Input string
 * @param search - Substring to search for
 * @returns true if found
 *
 * @example
 * containsIgnoreCase('Hello World', 'hello')
 * // true
 */
export function containsIgnoreCase(str: string, search: string): boolean {
  return str.toLowerCase().includes(search.toLowerCase());
}

/**
 * Escape special HTML characters
 * @param str - Input string
 * @returns Escaped string safe for HTML
 *
 * @example
 * escapeHTML('<script>alert("XSS")</script>')
 * // "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"
 */
export function escapeHTML(str: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return str.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char]);
}

/**
 * Unescape HTML entities
 * @param str - HTML string with entities
 * @returns Unescaped string
 *
 * @example
 * unescapeHTML('&lt;script&gt;')
 * // "<script>"
 */
export function unescapeHTML(str: string): string {
  const htmlEntity = document.createElement("textarea");
  htmlEntity.innerHTML = str;
  return htmlEntity.value;
}

/**
 * Pluralize word based on count
 * @param word - Singular word
 * @param count - Item count
 * @param plural - Plural form (auto-generated if not provided)
 * @returns Pluralized string
 *
 * @example
 * pluralize('item', 5)
 * // "items"
 */
export function pluralize(word: string, count: number, plural?: string): string {
  return count === 1 ? word : plural || word + "s";
}

/**
 * Repeat string multiple times
 * @param str - String to repeat
 * @param count - Number of repetitions
 * @param separator - Separator between repetitions (default: '')
 * @returns Repeated string
 *
 * @example
 * repeat('Ha', 3, ' ')
 * // "Ha Ha Ha"
 */
export function repeat(str: string, count: number, separator: string = ""): string {
  return Array(count).fill(str).join(separator);
}

/**
 * Pad string to specific length
 * @param str - Input string
 * @param length - Target length
 * @param padStr - Padding character (default: ' ')
 * @param side - Pad at 'start' or 'end' (default: 'end')
 * @returns Padded string
 *
 * @example
 * pad('5', 3, '0', 'start')
 * // "005"
 */
export function pad(
  str: string,
  length: number,
  padStr: string = " ",
  side: "start" | "end" = "end"
): string {
  const pad = padStr.repeat(Math.ceil((length - str.length) / padStr.length));
  if (side === "start") {
    return (pad + str).slice(-length);
  }
  return (str + pad).slice(0, length);
}

/**
 * Check if string is email
 * @param str - Input string
 * @returns true if valid email format
 */
export function isEmail(str: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

/**
 * Check if string is URL
 * @param str - Input string
 * @returns true if valid URL format
 */
export function isURL(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract numbers from string
 * @param str - Input string
 * @returns Array of numbers found
 *
 * @example
 * extractNumbers('Version 2.5.1')
 * // [2, 5, 1]
 */
export function extractNumbers(str: string): number[] {
  const matches = str.match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Get word count in string
 * @param str - Input string
 * @returns Number of words
 *
 * @example
 * wordCount('Hello world test')
 * // 3
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

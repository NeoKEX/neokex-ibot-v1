const fs = require('fs');
const tough = require('tough-cookie');
const logger = require('./logger');

class CookieParser {
  /**
   * Parse Netscape format cookie file
   * @param {string} filePath - Path to the cookie file
   * @returns {Object} Parsed cookies as key-value pairs
   */
  static parseNetscapeCookies(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Cookie file not found: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const cookies = {};
      const cookieJar = new tough.CookieJar();

      for (const line of lines) {
        // Skip comments and empty lines
        if (line.startsWith('#') || line.trim() === '') {
          continue;
        }

        const parts = line.split('\t');
        if (parts.length >= 7) {
          const [domain, flag, path, secure, expiration, name, value] = parts;
          
          // Store cookie in object
          cookies[name] = value.trim();

          // Also create Cookie object for jar
          try {
            const cookie = new tough.Cookie({
              key: name,
              value: value.trim(),
              domain: domain,
              path: path,
              secure: secure === 'TRUE',
              httpOnly: true,
              expires: expiration === '0' ? 'Infinity' : new Date(parseInt(expiration) * 1000)
            });
            cookieJar.setCookieSync(cookie, `https://${domain.replace(/^\./, '')}`);
          } catch (err) {
            logger.warn(`Failed to parse cookie: ${name}`, { error: err.message });
          }
        }
      }

      logger.info(`Parsed ${Object.keys(cookies).length} cookies from ${filePath}`);
      return { cookies, cookieJar };
    } catch (error) {
      logger.error('Failed to parse cookie file', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate Instagram cookies
   * @param {Object} cookies - Parsed cookies
   * @returns {boolean} True if cookies appear valid
   */
  static validateInstagramCookies(cookies) {
    const requiredCookies = ['sessionid', 'csrftoken'];
    const missing = requiredCookies.filter(name => !cookies[name]);

    if (missing.length > 0) {
      logger.error('Missing required Instagram cookies', { missing });
      return false;
    }

    logger.info('Instagram cookies validated successfully');
    return true;
  }

  /**
   * Get cookies as header string
   * @param {Object} cookies - Parsed cookies
   * @returns {string} Cookie header value
   */
  static getCookieHeader(cookies) {
    return Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }
}

module.exports = CookieParser;

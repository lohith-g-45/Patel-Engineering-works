import os
import re

BASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'templates')

# Mapping of common mojibake sequences -> replacements
REPLACEMENTS = {
    'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å"': '"',
    'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢': "'",
    'Ã¢â‚¬â€œ': ' - ',
    'Ã¢â€šÂ°': '•',
    'ÃƒÂ°Ã‚ÂÃ¢â‚¬Â¢Ã‚Â': 'X',
    'Ã¢â‚¬â„¢': "'",
    'Ã‚Â': '',
    'Ã¢â€šÂ¬Ã¢â‚¬â„¢': "'",
    'ÃƒÆ’Ã‚Â¨': 'è',
    'ÃƒÆ’Ã‚Â¤': 'ä',
    'ÃƒÂ¢Ã‹Å“Ã‚Â°': '°',
    'ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬': '',
    'Ã¢â‚¬Â ': ' ',
    'Ã‚Â ': ' ',
}

# Additional observed mojibake patterns (common smart quotes, dashes, ticks, emojis)
REPLACEMENTS.update({
    'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“': ' - ',
    'ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“': '✓',
    'ÃƒÂ°Ã…Â¸': '',
    'ÃƒÂ¢ - ¼': '–',
    'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬â„¢': "'",
    'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â': '"',
    'ÃƒÂ¢Ã‚Â€Ã‚Â“': ' - ',
})

# More common residues observed in the templates
REPLACEMENTS.update({
    'ÃƒÂ¢Ã‹Å“°': '☰',
    'Ã¢â‚¬Å“': '',
    "'¼": '',
    '¼': '',
    'ÃƒÆ’¨': 'è',
    'Ã‚Â©': '©',
})

# Final cleanup mappings observed
REPLACEMENTS.update({
    'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢': "'",
    'ÃƒÆ’¤': 'ä',
})

# catch any remaining isolated leading ÃƒÂ¢ sequences
REPLACEMENTS.update({
    'ÃƒÂ¢': '',
})

FOOTER_HTML = '''<!-- Shared footer -->
<footer class="footer footer-compact">
  <div class="footer-content container">
    <div class="footer-section">
      <h4>About PEW Vizag</h4>
      <p>Leading provider of innovative marine engineering and shipbuilding solutions for over 20 years.</p>
      <div class="social-links">
        <a href="#" title="LinkedIn">in</a>
        <a href="#" title="Facebook">f</a>
        <a href="#" title="X">X</a>
        <a href="#" title="YouTube">yt</a>
      </div>
    </div>

    <div class="footer-section">
      <h4>Services</h4>
      <a href="#">Ship Design</a>
      <a href="#">Vessel Construction</a>
      <a href="#">Ship Repair</a>
      <a href="#">Modernization</a>
      <a href="#">Offshore Solutions</a>
      <a href="#">Consulting</a>
    </div>
    <div class="footer-section footer-contact">
      <h4>Contact Info</h4>
      <p><strong>Tel:</strong> <span class="contact-values"><a href="tel:+918912705624">0891 - 2705 624</a><span class="contact-sep">/</span><a href="tel:+918912567346">2567 346</a></span></p>
      <p><strong>Fax:</strong> <span class="contact-values"><a href="tel:+918912705624">0891 - 2705 624</a></span></p>
      <p><strong>Mobile:</strong> <span class="contact-values"><a href="tel:+919393102438">93931 02438</a><span class="contact-sep">/</span><a href="tel:+919393104894">93931 04894</a><span class="contact-sep">/</span><a href="tel:+919820970059">9820970059</a></span></p>
      <p><strong>Email:</strong> <span class="contact-values"><a href="mailto:shipservice@yahoo.com">shipservice@yahoo.com</a></span></p>
    </div>
  </div>
  <div class="footer-bottom">
    <p>&copy; 2026 Patel Engineering Works. All rights reserved. | 
      <a href="/privacy-policy" style="color: var(--neutral-light-grey);">Privacy Policy</a> | 
      <a href="/terms" style="color: var(--neutral-light-grey);">Terms of Service</a>
    </p>
  </div>
</footer>
<!-- end shared footer -->'''


def normalize_text(text):
    # ensure str
    if isinstance(text, bytes):
        try:
            text = text.decode('utf-8')
        except Exception:
            text = text.decode('latin-1')
    # apply replacements
    for k, v in REPLACEMENTS.items():
        text = text.replace(k, v)
    # collapse repeated spaces
    text = re.sub(r'\s+',' ', text)
    return text


def replace_footer_with_include(text):
    # replace existing footer block with Jinja include
    if '<footer' not in text:
        return text, False
    new_text, count = re.subn(r'<footer[\s\S]*?</footer>', "{% include '_footer.html' %}", text, flags=re.IGNORECASE)
    return new_text, count>0


if __name__ == '__main__':
    updated_files = []
    for root, dirs, files in os.walk(BASE):
        for fn in files:
            if not fn.endswith('.html'):
                continue
            path = os.path.join(root, fn)
            with open(path, 'rb') as f:
                raw = f.read()
            # try decode
            try:
                text = raw.decode('utf-8')
            except Exception:
                try:
                    text = raw.decode('latin-1')
                except Exception:
                    text = raw.decode('utf-8', errors='ignore')
            new = normalize_text(text)
            new2, footer_replaced = replace_footer_with_include(new)
            if footer_replaced:
                new = new2
            if new != text:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new)
                updated_files.append(path)

    # write shared footer
    footer_path = os.path.join(BASE, '_footer.html')
    with open(footer_path, 'w', encoding='utf-8') as f:
        f.write(FOOTER_HTML)

    print('Updated files:')
    for u in updated_files:
        print(u)
    print('Shared footer written to', footer_path)

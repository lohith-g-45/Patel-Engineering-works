import re
import glob

stop_words = {'and', 'in', 'of', 'to', 'for', 'with', 'the', 'a', 'an', 'on', 'at', 'is', 'are', 'by', 'from', 'or', 'as'}

def title_case_text(text):
    words = re.split(r'([ \t\n]+)', text)
    result = []
    first_word = True
    new_sentence = True
    
    for word in words:
        if not word.strip():
            result.append(word)
            continue
            
        if word.isupper() and len(word) > 1:
            result.append(word)
            first_word = False
            new_sentence = word.endswith('.') or word.endswith('!') or word.endswith('?')
            continue
            
        check_word = re.sub(r'[^\w\s]', '', word.lower())
        
        if check_word in stop_words and not first_word and not new_sentence:
            result.append(word.lower())
        else:
            if len(word) > 0:
                result.append(word[0].upper() + word[1:].lower())
            else:
                result.append(word)
                
        first_word = False
        new_sentence = word.endswith('.') or word.endswith('!') or word.endswith('?')
            
    return ''.join(result)

def process_html_string(html):
    def replacer(match):
        text = match.group(1)
        if '{%' in text or '{{' in text or 'url_for' in text:
            return '>' + text + '<'
        if not text.strip():
            return '>' + text + '<'
            
        text = text.replace(' - ', ' ')
        text = text.replace('- ', ' ')
        text = re.sub(r'(\w)-(\w)', r'\1 \2', text)
        
        return '>' + title_case_text(text) + '<'
        
    def tag_replacer(tag_match):
        inner_html = tag_match.group(2)
        new_inner = re.sub(r'>([^<]+)<', replacer, '>' + inner_html + '<')[1:-1]
        
        if '<' not in inner_html:
            match = re.match(r'>(.*)<', '>' + inner_html + '<')
            if match:
                new_inner = replacer(match).strip('<>')
            
        return tag_match.group(1) + new_inner + tag_match.group(3)

    styles = []
    def style_mask(match):
        styles.append(match.group(0))
        return f'___STYLE_BLOCK_{len(styles)-1}___'
    html = re.sub(r'(?i)<style[^>]*>.*?</style>', style_mask, html, flags=re.DOTALL)
    
    scripts = []
    def script_mask(match):
        scripts.append(match.group(0))
        return f'___SCRIPT_BLOCK_{len(scripts)-1}___'
    html = re.sub(r'(?i)<script[^>]*>.*?</script>', script_mask, html, flags=re.DOTALL)

    html = re.sub(r'(?i)(<p\b[^>]*>)(.*?)(</p>)', tag_replacer, html, flags=re.DOTALL)
    html = re.sub(r'(?i)(<li\b[^>]*>)(.*?)(</li>)', tag_replacer, html, flags=re.DOTALL)
    
    for i, script in enumerate(scripts):
        html = html.replace(f'___SCRIPT_BLOCK_{i}___', script)
    for i, style in enumerate(styles):
        html = html.replace(f'___STYLE_BLOCK_{i}___', style)

    return html

for filepath in glob.glob('templates/*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = process_html_string(content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Processed {filepath}")

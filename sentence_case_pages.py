import re
import glob

# Words that should always be capitalized (Proper Nouns)
# Using lowercase keys to match against cleaned words
proper_nouns = {
    'patel', 'engineering', 'works', 'pew', 'vizag', 'india', "india's",
    'mr', 'rashesh', 'sanghvi', 'chirag', 'kiran', 'ceo',
    'visakhapatnam', 'kolkata', 'goa', 'karwar', 'mumbai', 'port', 'blair', 'colombo',
    'indian', 'navy', 'coast', 'guard', 'hindustan', 'shipyard', 'cochin',
    'garden', 'reach', 'shipbuilders', 'mazagon', 'dock', 'lt', 'chennai', 'nstl',
    'sri', 'lanka', 'iso', 'oems', 'gts', 'i', 'marine', 'defense', 'defence',
    'hr', 'pdf', 'id', 'hq', 'md'
}

acronyms = {'CEO', 'PEW', 'ISO', 'OEM', 'OEMS', 'GTS', 'HR', 'PDF', 'ID', 'HQ', 'MD', 'NSTL', 'L&T', 'L&T'}

def sentence_case_text(text):
    words = re.split(r'([ \t\n]+)', text)
    result = []
    
    new_sentence = True
    
    for word in words:
        if not word.strip():
            result.append(word)
            continue
            
        clean_word = re.sub(r'[^\w\s]', '', word.lower())
        
        # Check acronyms (exact match with non-word chars stripped)
        clean_upper = re.sub(r'[^\w\s&]', '', word.upper())
        if clean_upper in acronyms or clean_word.upper() in acronyms:
            result.append(word.upper())
            new_sentence = word.endswith('.') or word.endswith('!') or word.endswith('?')
            continue

        if clean_word in proper_nouns:
            if word.isupper() and len(word) > 1:
                result.append(word)
            else:
                result.append(word.capitalize())
            new_sentence = word.endswith('.') or word.endswith('!') or word.endswith('?')
            continue
            
        # Normal word
        if new_sentence:
            if word.isupper() and len(word) > 1:
                result.append(word)
            else:
                result.append(word.capitalize())
        else:
            if word.isupper() and len(word) > 1:
                result.append(word)
            else:
                result.append(word.lower())
                
        new_sentence = word.endswith('.') or word.endswith('!') or word.endswith('?')
            
    return ''.join(result)

def process_html_string(html):
    def replacer(match):
        text = match.group(1)
        if '{%' in text or '{{' in text or 'url_for' in text:
            return '>' + text + '<'
        if not text.strip():
            return '>' + text + '<'
            
        return '>' + sentence_case_text(text) + '<'
        
    def tag_replacer(tag_match):
        inner_html = tag_match.group(2)
        # Add dummy tags to match the whole string if it doesn't start with >
        temp_inner = '>' + inner_html + '<'
        new_inner = re.sub(r'>([^<]+)<', replacer, temp_inner)[1:-1]
        
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

for filepath in glob.glob('templates/*.html') + glob.glob('templates/**/*.html', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = process_html_string(content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Processed {filepath}")

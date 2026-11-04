"""Build static English equivalents with explicit, reviewed translations.

Edit translations.en.json when visible Portuguese copy changes. Missing translations
fail the build, so new content cannot silently ship in the wrong language.
"""
from html.parser import HTMLParser
from html import escape
from pathlib import Path
import json
import re

ROOT = Path(__file__).parent
TRANSLATIONS = json.loads((ROOT / 'translations.en.json').read_text())
ORIGIN = 'https://jorge-borloni-portfolio.jborloni.chatgpt.site'


def translate(value):
    key = value.strip()
    if not key:
        return value
    if key not in TRANSLATIONS:
        raise ValueError('Missing English translation: ' + key)
    return value[:len(value)-len(value.lstrip())] + TRANSLATIONS[key] + value[len(value.rstrip()):]


def english_route(value):
    if value.startswith('/#') or value == '/' or value.startswith(('/projetos/', '/creditos/')):
        return '/en' + value
    return value


class EnglishHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.output = []
    def handle_decl(self, decl):
        self.output.append('<!' + decl + '>')
    def handle_starttag(self, tag, attrs):
        updated = []
        original = dict(attrs)
        for key, value in attrs:
            if value is not None:
                if key in ('alt', 'aria-label', 'title', 'data-caption') and value:
                    value = translate(value)
                elif key == 'content' and (original.get('name') == 'description' or original.get('property') in ('og:title', 'og:description')):
                    value = translate(value)
                elif tag == 'html' and key == 'lang':
                    value = 'en-US'
                elif key == 'href':
                    value = english_route(value)
                    if original.get('rel') == 'canonical':
                        value = value.replace(ORIGIN + '/', ORIGIN + '/en/', 1)
            updated.append(key if value is None else key + '="' + escape(value, quote=True) + '"')
        self.output.append('<' + tag + (' ' + ' '.join(updated) if updated else '') + '>')
    def handle_endtag(self, tag):
        self.output.append('</' + tag + '>')
    def handle_data(self, data):
        self.output.append(escape(translate(data), quote=False))
    def handle_comment(self, data):
        self.output.append('<!--' + data + '-->')


def add_selector(document, route, lang):
    br = route
    en = '/en' + route
    label = 'Idioma' if lang == 'br' else 'Language'
    options = []
    for code, href, title in [('br', br, 'Português brasileiro'), ('en', en, 'English')]:
        options.append('<a data-language="' + code + '" href="' + href + '" lang="' + ('pt-BR' if code == 'br' else 'en') + '" hreflang="' + ('pt-BR' if code == 'br' else 'en') + '" aria-label="' + title + '"' + (' aria-current="true"' if code == lang else '') + '>' + code.upper() + '</a>')
    selector = '<nav class="language-switch" aria-label="' + label + '">' + ''.join(options) + '</nav>'
    document = document.replace('<div class="header-actions">', '<div class="header-actions">' + selector, 1)
    alternate = ''.join('<link rel="alternate" hreflang="' + locale + '" href="' + ORIGIN + path + '">' for locale, path in [('pt-BR', br), ('en', en), ('x-default', br)])
    # Language routes are local paths, so the same build supports Sites and Pages.
    alternate += '<meta name="jb-br-path" content="' + br + '"><meta name="jb-en-path" content="' + en + '"><script src="/language.js?v=1"></script><link rel="stylesheet" href="/language.css?v=1">'
    return document.replace('</head>', alternate + '</head>', 1)


def localize(public):
    for path in sorted(public.rglob('*.html')):
        if 'en' in path.relative_to(public).parts:
            continue
        relative = path.relative_to(public)
        route = '/' + relative.as_posix()
        if route.endswith('index.html'):
            route = route[:-len('index.html')]
        original = path.read_text(encoding='utf-8')
        parser = EnglishHTML()
        parser.feed(original)
        english = ''.join(parser.output)
        target = public / 'en' / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(add_selector(english, route, 'en'), encoding='utf-8')
        path.write_text(add_selector(original, route, 'br'), encoding='utf-8')

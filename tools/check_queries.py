"""Checks every Supabase query in the pages against the live database.

Run after any schema change (and before pushing):  python tools/check_queries.py
Uses only the public key: logged out, RLS returns no rows, but PostgREST still
validates tables, columns and joins, so broken queries fail here with a message.
Tables closed to logged-out users (profiles) answer "permission denied" (42501);
the database only says that after the query parsed, so it counts as valid.
"""
import glob
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

KEY = 'sb_publishable_ksoiCHmFZ3Mfnf0BNqO_XQ_LlkYj8DF'  # public key, same as src/lib/supabase.js
API = 'https://icphsbadppjnztfxxuui.supabase.co/rest/v1/'

queries = set()
for path in glob.glob('*.html') + glob.glob('src/lib/*.js'):
    src = open(path, encoding='utf-8').read()
    consts = dict(re.findall(r"const (\w+) = '([^']+)'", src))
    for m in re.finditer(r"from\('(\w+)'\)\s*\.select\((?:'([^']*)'|`([^`]*)`|(\w+))", src):
        select = m.group(2) or m.group(3) or consts.get(m.group(4) or '', '')
        select = re.sub(r'\s+', '', select)
        if select:
            queries.add((path, m.group(1), select))

failures = 0
for path, table, select in sorted(queries):
    # Phone numbers are private: pages must use whatsappNumbers() (RPC), never select them.
    if re.search(r'(^|[,(])phone([,)]|$)', select):
        failures += 1
        print(f'FAIL {path} {table}: selects phone; use whatsappNumbers() instead')
        continue
    url = f"{API}{table}?select={urllib.parse.quote(select, safe='*,()!:')}&limit=1"
    try:
        urllib.request.urlopen(urllib.request.Request(url, headers={'apikey': KEY})).read()
    except urllib.error.HTTPError as e:
        body = json.loads(e.read())
        if body.get('code') == '42501':
            continue  # valid query, just not visible when logged out
        failures += 1
        print(f'FAIL {path} {table}: {body.get("message")}\n     select={select}')

print(f'{len(queries)} queries checked, {failures} failed')
sys.exit(1 if failures else 0)

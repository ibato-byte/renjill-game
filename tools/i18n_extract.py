import re,glob,ast,json,sys
os_src='/home/claude/repo-game/src/'
lit=r"('(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\")"
pairs={}
def add(ja,en,src):
    try: ja=ast.literal_eval(ja) if ja[0] in "'\"" else ja; en=ast.literal_eval(en) if en and en[0] in "'\"" else en
    except Exception as e: return
    if not isinstance(ja,str) or not ja.strip(): return
    if not re.search(r'[぀-ヿ㐀-鿿＀-￯]', ja): return
    if ja not in pairs: pairs[ja]={'ja':ja,'en':en or '','src':src}
for f in sorted(glob.glob(os_src+'*.js')):
    s=open(f).read(); fn=f.split('/')[-1]
    for m in re.finditer(r"\[\s*"+lit+r"\s*,\s*"+lit+r"\s*\]", s): add(m.group(1),m.group(2),fn+':arr')       # STR ['ja','en'] and RANKS-like pairs
    for m in re.finditer(r"\bja:\s*"+lit+r"\s*,\s*en:\s*"+lit, s): add(m.group(1),m.group(2),fn+':obj')
    for m in re.finditer(r"\ben:\s*"+lit+r"\s*,\s*ja:\s*"+lit, s): add(m.group(2),m.group(1),fn+':obj2')
    for m in re.finditer(r"LANG === 'ja' \? "+lit+r" : "+lit, s): add(m.group(1),m.group(2),fn+':tern')
    for m in re.finditer(r"\bja:\s*"+lit, s): add(m.group(1),'',fn+':jaonly')
    # ja: [ '..', '..' ] arrays paired with en: [..]
    for m in re.finditer(r"\bja:\s*\[([^\]]*)\]\s*,\s*en:\s*\[([^\]]*)\]", s):
        jl=re.findall(lit,m.group(1)); el=re.findall(lit,m.group(2))
        for i,j in enumerate(jl): add(j, el[i] if i<len(el) else '', fn+':arrs')
# JA_LBL: en -> ja
s=open(os_src+'1_data.js').read(); i=s.index('const JA_LBL'); j=s.index('};',i)
for m in re.finditer(lit+r"\s*:\s*"+lit, s[i:j]): add(m.group(2),m.group(1),'JA_LBL')
out=list(pairs.values())
json.dump(out,open(sys.argv[1],'w'),ensure_ascii=False,indent=0)
print(len(out))

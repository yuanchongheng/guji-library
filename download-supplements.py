import hashlib,json,subprocess,time,random
from pathlib import Path
from urllib.parse import urlencode
root=Path(__file__).resolve().parent
cache=root/'data/reference-cache'
entries=json.loads((root/'data/reference-map.json').read_text())['segments']
progress=root/'download-progress.json'
remaining=list(entries.values());cooldown=900
count=0
while remaining:
    failed=[]
    for entry in remaining:
        query=urlencode({'reign_tongjian_id':entry['id']})
        target=cache/(hashlib.sha256(('reign?'+query).encode()).hexdigest()+'.json')
        if target.exists():continue
        if count>=60:raise SystemExit(0)
        while True:
            h=root/'download-response-headers.tmp'
            r=subprocess.run(['curl','--silent','--show-error','--max-time','40','-D',str(h),'--write-out','\n%{http_code}','https://www.dutongjian.com/api/reign?'+query],capture_output=True)
            body,_,status=r.stdout.rpartition(b'\n')
            if status==b'429':
                print('Rate limited; resume next scheduled run',flush=True);raise SystemExit(0)
            try:
                d=json.loads(body)
                if r.returncode or status!=b'200' or d.get('success') is False or 'data' not in d:raise ValueError()
                tmp=target.with_suffix('.tmp');tmp.write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')));tmp.replace(target)
                count+=1
                print('Saved items this run:',count,flush=True)
            except Exception:failed.append(entry);print('An item will be retried later',flush=True)
            break
        downloaded=sum((cache/(hashlib.sha256(('reign?'+urlencode({'reign_tongjian_id':x['id']})).encode()).hexdigest()+'.json')).exists() for x in entries.values())
        progress.write_text(json.dumps({'state':'downloading','downloaded':downloaded,'total':len(entries),'time':time.time()}))
        time.sleep(10+random.random()*5)
    if failed:print(len(failed),'retry next run',flush=True)
    break
progress.write_text(json.dumps({'state':'complete','downloaded':len(entries),'total':len(entries),'time':time.time()}))
print('All downloaded',flush=True)

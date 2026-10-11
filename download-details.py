"""Download person/place details and every occurrence page on the cloud runner."""
import hashlib,json,random,subprocess,time
from pathlib import Path
from urllib.parse import urlencode
cache=Path('data/reference-cache')
def key(endpoint,params):
    return hashlib.sha256((endpoint+'?'+urlencode(sorted(params.items()))).encode()).hexdigest()
def read(endpoint,params):
    try:
        d=json.loads((cache/(key(endpoint,params)+'.json')).read_text())
        if d.get('success') is not False and 'data' in d:return d
    except (OSError,ValueError):pass
    return None
requests={}
def visit(x):
    if isinstance(x,list):
        for v in x:visit(v)
    elif isinstance(x,dict):
        for p in x.get('ExtRef_Children_people',[]) or []:
            if p.get('tongjian_id') and p.get('link_td_id'):
                params={'mention_tongjian_id':p['tongjian_id'],'link_td_id':p['link_td_id'],'page':1,'page_size':7}
                requests[key('resolved_people_info',params)]=('resolved_people_info',params)
        for p in x.get('ExtRef_Children_places',[]) or []:
            if p.get('tongjian_id'):
                params={'place_tongjian_id':p['tongjian_id'],'page':1,'page_size':10}
                requests[key('resolved_place_info',params)]=('resolved_place_info',params)
        for v in x.values():
            if isinstance(v,(dict,list)):visit(v)
entries=json.loads(Path('data/reference-map.json').read_text())['segments']
for e in entries.values():
    d=read('reign',{'reign_tongjian_id':e['id']})
    if not d:raise SystemExit('Reign files incomplete; no details requested')
    visit(d['data'])
queue=list(requests.values());saved=0;valid=0;limited=False
for endpoint,params in queue:
    d=read(endpoint,params)
    if d is None and saved<30 and not limited:
        url='https://www.dutongjian.com/api/'+endpoint+'?'+urlencode(sorted(params.items()))
        r=subprocess.run(['curl','--silent','--show-error','--max-time','40','--write-out','\n%{http_code}',url],capture_output=True)
        body,_,status=r.stdout.rpartition(b'\n')
        if status==b'429':limited=True
        elif status==b'200' and not r.returncode:
            try:
                candidate=json.loads(body)
                if candidate.get('success') is not False and 'data' in candidate:
                    target=cache/(key(endpoint,params)+'.json');tmp=target.with_suffix('.tmp')
                    tmp.write_text(json.dumps(candidate,ensure_ascii=False,separators=(',',':')));tmp.replace(target)
                    d=candidate;saved+=1
            except ValueError:pass
        time.sleep(12+random.random()*3)
    if d is not None:
        valid+=1
        if params['page']==1:
            pages=int((d['data'].get('occurrence_page') or {}).get('total_pages') or 1)
            for page in range(2,pages+1):queue.append((endpoint,{**params,'page':page}))
progress={'valid':valid,'discovered':len(queue),'complete':valid==len(queue),'newly_saved':saved,'rate_limited':limited}
Path('data/details-progress.json').write_text(json.dumps(progress))
print(json.dumps(progress))

import json,subprocess,time,hashlib,os
from pathlib import Path
from urllib.parse import quote,urlencode
root=Path(__file__).resolve().parent
dest=root/'assets/history-maps';dest.mkdir(exist_ok=True)
cache=root/'data/reference-cache'
items={i['oss_filename']:i for g in json.loads((root/'data/atlas.json').read_text()) for i in g['items']}
manifest=root/'data/local-maps.json'
saved=json.loads(manifest.read_text()) if manifest.exists() else {}
def get(url,body=None):
    delay=900
    while True:
        args=['curl','--silent','--show-error','--max-time','90','--write-out','\n%{http_code}',url]
        if body:args+=['-H','Content-Type: application/json','--data',json.dumps(body)]
        r=subprocess.run(args,capture_output=True);data,_,status=r.stdout.rpartition(b'\n')
        if status==b'429':raise RuntimeError('Rate limited; resume next scheduled run')
        if r.returncode or status!=b'200':raise RuntimeError('Map request failed '+status.decode())
        time.sleep(12)
        return data
count=0
for filename,item in items.items():
    if count>=10:break
    key=item['path'].removeprefix('/map_images/').rsplit('.',1)[0]
    label=cache/(hashlib.sha256(('map/labels?'+urlencode({'key':key})).encode()).hexdigest()+'.json')
    target=dest/filename
    while not target.exists() or not label.exists():
        try:
            if not label.exists():
                data=json.loads(get('https://www.dutongjian.com/map_images/data/'+quote(key,safe='/')+'_phrases.json'))
                label.write_text(json.dumps({'success':True,'data':data},ensure_ascii=False))
            if not target.exists():
                result=json.loads(get('https://www.dutongjian.com/api/map/image-url',{'oss_filename':filename}))
                data=get(result['data']['image_url'])
                if not (data.startswith(b'\xff\xd8') or data.startswith(b'\x89PNG')):raise ValueError('Not a map image')
                temp=target.with_suffix('.tmp');temp.write_bytes(data);temp.replace(target)
            saved[filename]='assets/history-maps/'+filename
            manifest.write_text(json.dumps(saved,ensure_ascii=False))
            count+=1
            print('Map saved',len(saved),'/',len(items),filename,flush=True)
        except Exception as error:print(str(error),'retry next scheduled run',flush=True);raise SystemExit(0)
print('Downloaded maps:',len(saved),'/',len(items),flush=True)

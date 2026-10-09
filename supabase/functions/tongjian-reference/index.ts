const endpoints:Record<string,string[]>={"reign":["reign_tongjian_id"],"resolved_people_info":["mention_tongjian_id","link_td_id","page","page_size"],"resolved_place_info":["place_tongjian_id","page","page_size"],"topic_info":["topic_tongjian_id","current_paragraph_tongjian_id","page","page_size"],"paragraph_locator":["ref"],"zhang_tjzj_detail":["zhang_tjzj_id"],"reading_annotations":["target_id","source_key"],"background-materials/passage":["tongjian_id","name","page"],"background-materials/books":[],"background-materials/search":["query","name","page","page_size"],"background-materials/toc":["name"],"lexicon/lookup":["query"],"brief":["tongjian_id","type"],"decisions":["origin_tongjian_id","decision_tongjian_id","limit","page","page_size"],"class_tag_info":["tag_value","current_paragraph_tongjian_id","page","page_size"],"map/image-url":["oss_filename"],"map/search":["keyword"],"map/labels":["key"]};
const headers={"Access-Control-Allow-Origin":"https://yuanchongheng.github.io","Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"GET,OPTIONS","Content-Type":"application/json"};
const responseCache=new Map<string,{until:number,data:unknown}>();
Deno.serve(async(req)=>{
if(req.method==="OPTIONS")return new Response(null,{headers});
const fail=(message:string,status=502)=>Response.json({success:false,message},{status,headers});
if(req.method!=="GET")return fail("不支持的请求",405);
try{
const u=new URL(req.url);const endpoint=u.searchParams.get("endpoint")||"";if(!Object.hasOwn(endpoints,endpoint))return fail("不支持的资料查询",400);
u.searchParams.delete("endpoint");for(const [k,v]of u.searchParams){if(!endpoints[endpoint].includes(k)||v.length>500)return fail("查询参数无效",400)}
let target="https://www.dutongjian.com/api/"+(endpoint==="map/search"?"search_map":endpoint);
let options:RequestInit={signal:AbortSignal.timeout(25000)};
if(endpoint==="map/labels"){const key=u.searchParams.get("key")||"";if(!key||key.length>300||key.includes("..")||key.startsWith("/")||key.includes("\\"))return fail("地图编号无效",400);target="https://www.dutongjian.com/map_images/data/"+key.split("/").map(encodeURIComponent).join("/")+"_phrases.json"}
else if(["map/image-url","map/search"].includes(endpoint)){options={...options,method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(u.searchParams))}}
else target+="?"+u.searchParams;
const cacheKey=target+(options.body||'');const cached=responseCache.get(cacheKey);if(cached&&cached.until>Date.now())return Response.json(cached.data,{headers});
const response=await fetch(target,options);if(!response.ok)return fail("补充资料来源暂不可用，请稍后重试");
const data=await response.json();const result=endpoint==="map/labels"?{success:true,data}:data;if(data.success!==false){if(responseCache.size>=500)responseCache.delete(responseCache.keys().next().value!);responseCache.set(cacheKey,{data:result,until:Date.now()+(endpoint==="map/image-url"?40000:3600000)})}return Response.json(result,{headers});
}catch{return fail("补充资料暂时无法连接，请稍后重试")}
});

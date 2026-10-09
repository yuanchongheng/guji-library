/* Render captured scenes without inventing missing subject coordinates. */
function importedScenePositions(marker){
 return (marker.positions||[]).filter(p=>Array.isArray(p.coord)&&p.coord.length===2&&p.coord.every(Number.isFinite))
  .sort((a,b)=>(a.order||0)-(b.order||0)).map(p=>[p.coord[1],p.coord[0]]);
}
function drawImportedScene(scene,map,markerGroup,routeGroup,allPoints){
 const markers=scene.markers||[],byKey=new Map(markers.map(m=>[m.marker_key,m])),byId=new Map(markers.map(m=>[m.id,m]));
 const list=$('#sit-places'),evidence=$('#sit-evidence');list.innerHTML='';evidence.innerHTML='';
 const note=$('.situation-note');note.textContent='本段使用原站导出的沙盘坐标与关系。未提供坐标的人物和行动在左侧列出，未推测其位置；连线表示原站关系，不代表真实道路。';
 const badge=document.createElement('p');badge.className='sit-imported-source';badge.textContent='原站沙盘 · 场景 '+scene.scene_id;list.before(badge);
 for(const m of markers.filter(m=>m.element_type==='place'||m.marker_type.startsWith('place_'))){
  const points=importedScenePositions(m);if(!points.length)continue;
  const ll=points[0];allPoints.push(...points);
  const pin=L.circleMarker(ll,{radius:9,color:'#295dec',weight:2,fillColor:'#171d25',fillOpacity:1}).addTo(markerGroup);
  pin.bindTooltip(E(m.label),{permanent:true,direction:'right',className:'sit-place-label'});
  pin.bindPopup(`<b>${E(m.label)}</b><p>${E(m.meta?.standard_name||'')}</p><small>原站沙盘坐标：${ll[1]}，${ll[0]}</small>`);
  const button=document.createElement('button');button.textContent=m.label;button.onclick=()=>{map.setView(ll,9);pin.openPopup()};list.append(button);
 }
 const heading=document.createElement('h4');heading.textContent='人物与军队';list.append(heading);
 for(const m of markers.filter(m=>m.element_type==='subject')){
  const button=document.createElement('button');button.textContent=m.label;
  button.title=m.body_text||m.label;button.onclick=()=>{
   evidence.querySelectorAll('[data-scene-links]').forEach(el=>el.classList.toggle('sit-relation-selected',JSON.parse(el.dataset.sceneLinks).includes(m.marker_key)));
  };list.append(button);
 }
 const relations=markers.filter(m=>m.marker_type==='relation').sort((a,b)=>(a.order_no||0)-(b.order_no||0));
 const keyLabel=key=>byKey.get(key)?.label||key||'';
 const resolve=key=>{const m=byKey.get(key);return m?importedScenePositions(m)[0]:null};
 for(const m of relations){
  const meta=m.meta||{},source=meta.source_text||meta.relation?.source_text||'',positions=importedScenePositions(m);
  let from=positions[0],to=positions.at(-1);
  if(positions.length<2){from=resolve(m.from_marker_key);to=resolve(m.to_marker_key)||positions[0]}
  const paragraph=document.createElement('p');paragraph.dataset.sceneLinks=JSON.stringify([m.from_marker_key,m.to_marker_key]);
  paragraph.innerHTML=`<strong>${E(m.label)}</strong><br>${E(keyLabel(m.from_marker_key))} → ${E(keyLabel(m.to_marker_key))}<br><span>${E(source)}</span>`;evidence.append(paragraph);
  const tooltip=`<b>${E(m.label)}</b><p>${E(source)}</p>`;
  if(from&&to){
   allPoints.push(from,to);const line=L.polyline([from,to],{color:'#2961e8',weight:3,opacity:.95}).addTo(routeGroup).bindPopup(tooltip);
   line.on('mouseover',()=>{line.setStyle({weight:5});paragraph.classList.add('sit-relation-selected')});line.on('mouseout',()=>{line.setStyle({weight:3});paragraph.classList.remove('sit-relation-selected')});
   const mid=[(from[0]+to[0])/2,(from[1]+to[1])/2];
   const icon=()=>{const a=map.latLngToLayerPoint(from),b=map.latLngToLayerPoint(to),angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;return L.divIcon({className:'sit-route-arrow',html:`<span style="transform:rotate(${angle}deg)">➤</span>`,iconSize:[24,24],iconAnchor:[12,12]})};
   if(m.directed||meta.directed){const arrow=L.marker(mid,{icon:icon(),interactive:false}).addTo(routeGroup);map.on('zoomend',()=>arrow.setIcon(icon()))}
   paragraph.onclick=()=>{map.fitBounds(L.latLngBounds([from,to]).pad(.4),{maxZoom:10});line.openPopup()};
  }
  if(to||from){
   const ll=to||from,number=meta.sequence_no||m.order_no;
   const node=L.marker(ll,{icon:L.divIcon({className:'sit-route-node',html:`<span>${E(number)}</span><b>${E(keyLabel(m.owner_marker_key)||keyLabel(m.from_marker_key))}</b>`,iconSize:[26,26],iconAnchor:[13,13]})}).addTo(routeGroup).bindPopup(tooltip);
   if(!from||!to)paragraph.onclick=()=>{map.setView(ll,9);node.openPopup()};
  }
 }
 if(!relations.length)evidence.textContent='原站本段未提供行动关系。';
 return `${markers.filter(m=>m.element_type==='place').length} 个原站地点 · ${relations.length} 条原站关系`;
}

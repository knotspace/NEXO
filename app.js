const STORE='project-next-v2';
const $=s=>document.querySelector(s);
const app=$('#app');
const now=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const blank=()=>({plans:{},records:[],reviews:{},notes:[],skills:{},pathNotes:'',theme:'dark'});
let db;try{db={...blank(),...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch(e){db=blank()}
if(!localStorage.getItem(STORE)){try{const old=JSON.parse(localStorage.getItem('project-next-data')||'null');if(old){db.plans=old.plans||{};db.records=(old.records||[]).map((x,i)=>({...x,id:x.id||Date.now()+i,memo:x.memo||''}));db.reviews=old.reviews||{};db.pathNotes=localStorage.getItem('pn-memo')||'';save()}}catch(e){}}
function save(){localStorage.setItem(STORE,JSON.stringify(db))}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dateText(s){return new Date(s+'T12:00:00').toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric',weekday:'short'})}
function toast(s){const el=$('#toast');el.textContent=s;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
function minutesToday(){return db.records.filter(x=>x.date===now()).reduce((n,x)=>n+Number(x.minutes||0),0)}
function totalMinutes(){return db.records.reduce((n,x)=>n+Number(x.minutes||0),0)}
function planFor(day=now()){return db.plans[day]||(db.plans[day]=[])}
function pageHead(kicker,title,desc,extra){return '<div class="page-heading"><div><div class="eyebrow">'+kicker+'</div><h1>'+title+'</h1><p>'+desc+'</p></div>'+(extra||'')+'</div>'}
function card(title,body,cls,kicker){return '<section class="card '+(cls||'')+'"><div class="card-head"><h2 class="card-title">'+title+'</h2>'+(kicker?'<span class="card-kicker">'+kicker+'</span>':'')+'</div>'+body+'</section>'}
function progress(p){return '<div class="progress-track"><div class="progress-fill" style="width:'+Math.max(0,Math.min(100,p))+'%"></div></div>'}
function empty(title,desc){return '<div class="empty"><strong>'+title+'</strong>'+desc+'</div>'}
let current='home',selectedDate=now();
const names={home:['OVERVIEW','Overview'],plan:['STUDY PLAN','学習計画'],records:['STUDY LOG','学習記録'],review:['DAILY REVIEW','振り返り'],path:['FUTURE DESIGN','進路研究室'],skills:['SKILL DEVELOPMENT','スキルマップ'],library:['PERSONAL LIBRARY','マイノート'],data:['DATA & BACKUP','データ管理']};
function go(p){current=p;$('#sidebar').classList.remove('open');render();window.scrollTo({top:0,behavior:'smooth'})}
document.querySelector('.nav').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)go(b.dataset.page)});
$('#menuToggle').onclick=()=>$('#sidebar').classList.toggle('open');
$('#themeToggle').onclick=()=>{db.theme=db.theme==='light'?'dark':'light';document.body.classList.toggle('light',db.theme==='light');save()};
document.body.classList.toggle('light',db.theme==='light');
$('#todayLabel').textContent=dateText(now());
function render(){const meta=names[current];$('#crumb').textContent=meta[0];document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===current));({home,plan,records,review,path,skills,library,data}[current])()}
function home(){
 const t=planFor(),done=t.filter(x=>x.done).length,pct=t.length?Math.round(done/t.length*100):0,mins=minutesToday(),all=totalMinutes();
 const recent=[...db.records].sort((a,b)=>(b.date+b.id).localeCompare(a.date+a.id)).slice(0,5);
 const week=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const key=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');const n=db.records.filter(x=>x.date===key).reduce((s,x)=>s+Number(x.minutes),0);return '<div class="day-chip '+(key===now()?'today':'')+'"><small>'+d.toLocaleDateString('ja-JP',{weekday:'short'})+'</small><b>'+d.getDate()+'</b><small>'+n+'分</small>'+(n?'<i class="dot"></i>':'')+'</div>'}).join('');
 const subjectTotals=['数学','英語','理科','社会','国語','情報・プログラミング','進路研究'].map(s=>({s,n:db.records.filter(x=>x.subject===s).reduce((a,x)=>a+Number(x.minutes),0)}));
 const max=Math.max(1,...subjectTotals.map(x=>x.n));
 app.innerHTML=pageHead('YOUR PERSONAL COMMAND CENTER','今日の積み重ねが、次の自分をつくる。','目標を細かく分けて、今日できることから進めよう。','<span class="heading-date">'+dateText(now())+'</span>')+
 '<div class="welcome-panel"><div class="eyebrow">MAKE TODAY COUNT</div><h2>急がなくていい。止まらずに進もう。</h2><p>完璧な一日より、昨日より一歩進めた一日を。</p></div>'+
 '<div class="grid">'+
 card('TODAY STUDY','<div class="stat-number">'+mins+'<small> min</small></div><div class="stat-note">今日の学習時間</div>','span-3','TODAY')+
 card('TASK PROGRESS','<div class="stat-number">'+pct+'<small> %</small></div><div class="stat-note">'+done+' / '+t.length+' タスク完了</div>'+progress(pct),'span-3','CHECKLIST')+
 card('TOTAL HOURS','<div class="stat-number">'+(all/60).toFixed(1)+'<small> h</small></div><div class="stat-note">これまでの累計学習時間</div>','span-3','ALL TIME')+
 card('STUDY DAYS','<div class="stat-number">'+new Set(db.records.map(x=>x.date)).size+'<small> days</small></div><div class="stat-note">記録をつけた日数</div>','span-3','CONSISTENCY')+
 card('今日のタスク','<div class="list">'+(t.length?t.map((x,i)=>'<label class="list-row"><input class="check" type="checkbox" data-check="'+i+'" '+(x.done?'checked':'')+'><span class="row-main"><span class="row-title">'+esc(x.subject)+' · '+esc(x.name)+'</span><span class="row-sub">'+esc(x.detail||'今日の学習タスク')+'</span></span><span class="row-time">'+Number(x.minutes)+'分</span></label>').join(''):empty('今日の計画はまだ空です','学習計画から、最初のタスクを追加しよう。'))+'</div><div class="btn-row"><button class="btn" data-go="plan">学習計画を開く →</button></div>','span-7','YOUR PLAN')+
 card('直近7日間','<div class="week-strip">'+week+'</div><p class="stat-note" style="margin-top:13px">毎日の学習時間を記録して、積み重ねを可視化。</p>','span-5','WEEKLY ACTIVITY')+
 card('科目別の学習時間','<div class="bar-list">'+subjectTotals.map(x=>'<div class="bar-line"><span>'+x.s+'</span>'+progress(Math.round(x.n/max*100))+'<span>'+x.n+'分</span></div>').join('')+'</div>','span-6','SUBJECT BREAKDOWN')+
 card('最近の学習記録','<div class="list">'+(recent.length?recent.map(x=>'<div class="list-row"><span class="row-main"><span class="row-title">'+esc(x.subject)+' · '+esc(x.name)+'</span><span class="row-sub">'+x.date+'</span></span><span class="row-time">'+x.minutes+'分</span></div>').join(''):empty('記録はまだありません','学習記録から取り組んだ内容を残そう。'))+'</div><div class="btn-row"><button class="btn secondary" data-go="records">すべての記録を見る</button></div>','span-6','RECENT LOGS')+'</div>';
 app.querySelectorAll('[data-check]').forEach(el=>el.onchange=()=>{t[+el.dataset.check].done=el.checked;save();home()});app.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>go(el.dataset.go))
}
function plan(){
 const t=planFor(selectedDate),done=t.filter(x=>x.done).length,pct=t.length?Math.round(done/t.length*100):0;
 const d=new Date(selectedDate+'T12:00:00');const week=Array.from({length:7},(_,i)=>{const x=new Date(d);x.setDate(d.getDate()-d.getDay()+i);const key=[x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-');return '<button class="day-chip '+(key===selectedDate?'today':'')+'" data-day="'+key+'"><small>'+x.toLocaleDateString('ja-JP',{weekday:'short'})+'</small><b>'+x.getDate()+'</b><small>'+((db.plans[key]||[]).length)+'件</small></button>'}).join('');
 app.innerHTML=pageHead('PLAN YOUR DAY','学習計画','やることを具体化して、実行できる一日にする。','<span class="heading-date">'+dateText(selectedDate)+'</span>')+
 '<div class="grid">'+card('日付を選択','<div class="week-strip">'+week+'</div><div class="field"><label>別の日付を表示</label><input id="planDate" type="date" value="'+selectedDate+'"></div>','span-12','WEEK VIEW')+
 card('タスクを追加','<form id="taskForm"><div class="form-grid"><div class="field"><label>科目・カテゴリ</label><select name="subject"><option>数学</option><option>英語</option><option>理科</option><option>社会</option><option>国語</option><option>情報・プログラミング</option><option>進路研究</option><option>その他</option></select></div><div class="field"><label>予定時間（分）</label><input name="minutes" type="number" min="1" max="1440" value="30" required></div></div><div class="field"><label>学習内容</label><input name="name" maxlength="100" placeholder="例：二次関数の最大・最小" required></div><div class="field"><label>補足・教材・範囲（任意）</label><input name="detail" maxlength="160" placeholder="例：問題集 p.40〜45"></div><button class="btn">＋ タスクを追加</button></form>','span-5','ADD TASK')+
 card('今日のチェックリスト','<div class="progress-meta"><span>'+done+' / '+t.length+' 完了</span><b>'+pct+'%</b></div>'+progress(pct)+'<div class="list">'+(t.length?t.map((x,i)=>'<div class="list-row"><input class="check" type="checkbox" data-task-check="'+i+'" '+(x.done?'checked':'')+'><span class="row-main"><span class="row-title">'+esc(x.subject)+' · '+esc(x.name)+'</span><span class="row-sub">'+esc(x.detail||'未設定')+'</span></span><span class="row-time">'+x.minutes+'分</span><button class="btn danger small" data-task-del="'+i+'">削除</button></div>').join(''):empty('タスクを追加しよう','科目・内容・時間を入力すると、ここに表示される。'))+'</div>','span-7','DAILY CHECKLIST')+'</div>';
 app.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{selectedDate=b.dataset.day;plan()});$('#planDate').onchange=e=>{selectedDate=e.target.value||now();plan()};
 $('#taskForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);t.push({subject:f.get('subject'),minutes:Number(f.get('minutes')),name:f.get('name').trim(),detail:f.get('detail').trim(),done:false});save();plan();toast('タスクを追加しました')};
 app.querySelectorAll('[data-task-check]').forEach(el=>el.onchange=()=>{t[+el.dataset.taskCheck].done=el.checked;save();plan()});app.querySelectorAll('[data-task-del]').forEach(el=>el.onclick=()=>{t.splice(+el.dataset.taskDel,1);save();plan();toast('タスクを削除しました')})
}
function records(){
 const subjects=['すべて','数学','英語','理科','社会','国語','情報・プログラミング','進路研究','その他'];
 app.innerHTML=pageHead('KEEP YOUR PROGRESS','学習記録','勉強した内容と時間を残して、成長を見える形に。')+
 '<div class="grid">'+card('学習を記録','<form id="recordForm"><div class="form-grid"><div class="field"><label>日付</label><input type="date" name="date" value="'+now()+'" required></div><div class="field"><label>科目</label><select name="subject">'+subjects.slice(1).map(s=>'<option>'+s+'</option>').join('')+'</select></div></div><div class="field"><label>学習内容</label><input name="name" maxlength="120" placeholder="例：英文法 関係代名詞" required></div><div class="field"><label>学習時間（分）</label><input type="number" name="minutes" min="1" max="1440" value="30" required></div><div class="field"><label>メモ（任意）</label><textarea name="memo" placeholder="理解度・間違えた問題・次にやること"></textarea></div><button class="btn">記録を保存</button></form>','span-5','NEW ENTRY')+
 card('学習履歴','<div class="field"><label>科目で絞り込む</label><select id="recordFilter">'+subjects.map(s=>'<option>'+s+'</option>').join('')+'</select></div><div id="recordList"></div>','span-7','ALL RECORDS')+'</div>';
 const draw=()=>{const f=$('#recordFilter').value,arr=[...db.records].filter(x=>f==='すべて'||x.subject===f).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);$('#recordList').innerHTML=arr.length?'<div class="table-wrap"><table class="data-table"><thead><tr><th>日付</th><th>科目・内容</th><th>時間</th><th></th></tr></thead><tbody>'+arr.map(x=>'<tr><td>'+x.date+'</td><td>'+esc(x.subject)+'<br><span class="muted">'+esc(x.name)+'</span>'+(x.memo?'<br><span class="muted">'+esc(x.memo)+'</span>':'')+'</td><td>'+x.minutes+'分</td><td><button class="btn danger small" data-record-del="'+x.id+'">削除</button></td></tr>').join('')+'</tbody></table></div>':empty('該当する記録がありません','条件を変えるか、新しい学習記録を追加しよう。');$('#recordList').querySelectorAll('[data-record-del]').forEach(b=>b.onclick=()=>{if(confirm('この記録を削除しますか？')){db.records=db.records.filter(x=>x.id!==Number(b.dataset.recordDel));save();draw();toast('記録を削除しました')}})};
 $('#recordFilter').onchange=draw;draw();
 $('#recordForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);db.records.push({id:Date.now(),date:f.get('date'),subject:f.get('subject'),name:f.get('name').trim(),minutes:Number(f.get('minutes')),memo:f.get('memo').trim()});save();e.target.reset();e.target.date.value=now();draw();toast('学習記録を保存しました')}
}
function review(){
 const r=db.reviews[now()]||{};
 app.innerHTML=pageHead('REFLECT & IMPROVE','一日の振り返り','今日の自分を整理して、明日の行動につなげよう。','<span class="heading-date">'+dateText(now())+'</span>')+
 '<div class="grid">'+card('今日の振り返り','<form id="reviewForm"><div class="field"><label>01 — 今日できたこと</label><textarea name="good" placeholder="小さなことでもOK。できたことを書こう。">'+esc(r.good)+'</textarea></div><div class="field"><label>02 — 課題・改善したいこと</label><textarea name="issue" placeholder="うまくいかなかった原因や、改善したいこと。">'+esc(r.issue)+'</textarea></div><div class="field"><label>03 — 明日の最優先アクション</label><textarea name="next" placeholder="明日、最初に取り組むことを具体的に。">'+esc(r.next)+'</textarea></div><button class="btn">振り返りを保存</button></form>','span-7','DAILY REFLECTION')+
 card('今日のデータ','<div class="stat-number">'+minutesToday()+'<small> min</small></div><div class="stat-note">今日の学習時間</div><div class="section-gap"></div><div class="stat-number">'+planFor().filter(x=>x.done).length+' / '+planFor().length+'</div><div class="stat-note">計画タスク完了数</div><div class="section-gap"></div><span class="tag green">明日につなげる</span>','span-5','TODAY IN NUMBERS')+
 card('過去の振り返り','<div id="pastReviews"></div>','span-12','REFLECTION ARCHIVE')+'</div>';
 $('#reviewForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);db.reviews[now()]={good:f.get('good').trim(),issue:f.get('issue').trim(),next:f.get('next').trim()};save();toast('振り返りを保存しました')};
 const past=Object.entries(db.reviews).filter(([d])=>d!==now()).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,5);$('#pastReviews').innerHTML=past.length?past.map(([d,x])=>'<div class="list-row"><span class="row-main"><span class="row-title">'+d+'</span><span class="row-sub">できたこと：'+esc(x.good||'未記入')+' ／ 明日：'+esc(x.next||'未記入')+'</span></span></div>').join(''):empty('過去の振り返りはありません','毎日の記録がここに蓄積される。')
}
function path(){
 app.innerHTML=pageHead('DESIGN YOUR FUTURE','進路研究室','進学制度・学びたい分野・将来の選択肢を自分の言葉で整理する。')+
 '<div class="grid">'+card('調査ロードマップ','<div class="timeline"><div class="timeline-item"><h4>01 — 学びの内容を比較する</h4><p>学科のカリキュラム、専門科目、研究室、卒業後の進路を公式資料で確認。</p></div><div class="timeline-item"><h4>02 — 入試・編入制度を確認する</h4><p>出願資格、対象学年、必要単位、試験科目、英語資格、募集人数を年度ごとに記録。</p></div><div class="timeline-item"><h4>03 — 大学・学部の学びを調べる</h4><p>経済学、計量経済学、データサイエンスなど、学びたい内容と入試制度を分けて調査。</p></div><div class="timeline-item"><h4>04 — 数学・情報の専門性を伸ばす</h4><p>微積分、線形代数、確率統計、プログラミングを土台に、AI・金融・経済データ分析へ接続。</p></div></div>','span-6','RESEARCH FLOW')+
 card('調査メモ','<p class="muted">公式ページのURL、対象年度、確認日、わかったことを記録。未確認の情報は事実として扱わない。</p><div class="field"><label>調べた内容・公式URL・確認日</label><textarea id="pathMemo" style="min-height:210px" placeholder="例：\n制度名：\n対象年度：\n公式URL：\n確認日：\n出願資格：\n試験科目：\n不明点：">'+esc(db.pathNotes)+'</textarea></div><button class="btn" id="savePath">調査メモを保存</button>','span-6','PRIVATE NOTES')+
 card('調査するときのチェックポイント','<div class="skill-group"><h3>入試制度</h3><p class="muted">募集要項の年度／出願資格／必要書類／試験科目・配点／募集人数／出願期間</p></div><div class="skill-group"><h3>編入制度</h3><p class="muted">編入年次／対象者／修得単位／専門科目／英語要件／過去の実施状況</p></div><div class="skill-group"><h3>学び・進路</h3><p class="muted">授業内容／研究室／卒業研究／大学院進学／卒業後の職種</p></div><div class="tag orange">制度は年度によって変更される可能性あり</div>','span-12','RESEARCH CHECKLIST')+'</div>';
 $('#savePath').onclick=()=>{db.pathNotes=$('#pathMemo').value;save();toast('調査メモを保存しました')}
}
const skillGroups={'数学':['中学数学の総復習','高校数学Ⅰ・A','高校数学Ⅱ・B・C','微分積分','線形代数','確率・統計','最適化・数値計算'],'情報・AI':['Python基礎','データ構造・アルゴリズム','C / C++','データベース・SQL','機械学習','深層学習','データ分析プロジェクト'],'経済・金融':['ミクロ経済学','マクロ経済学','統計学・計量経済学','ファイナンス理論','時系列分析','金融工学・リスク管理'],'英語・発信':['英文読解','英語資格・リスニング','技術文書を読む','分析結果を文章にする','プレゼンテーション']};
function skills(){
 const all=Object.values(skillGroups).flat(),done=all.filter(x=>db.skills[x]).length,pct=Math.round(done/all.length*100);
 app.innerHTML=pageHead('BUILD YOUR TOOLKIT','スキルマップ','数学を軸に情報・AIと経済・金融をつなぐ。習得状況を記録しよう。')+
 '<div class="grid">'+card('全体の進捗','<div class="stat-number">'+pct+'<small> %</small></div><div class="stat-note">'+done+' / '+all.length+' 項目にチェック</div>'+progress(pct),'span-12','YOUR PROGRESS')+
 Object.entries(skillGroups).map(([g,items])=>card(g,'<div class="skill-group">'+items.map(x=>'<label class="skill-item"><input class="check" type="checkbox" data-skill="'+esc(x)+'" '+(db.skills[x]?'checked':'')+'><span>'+x+'</span>'+(db.skills[x]?'<span class="tag green">CHECKED</span>':'')+'</label>').join('')+'</div>','span-6','SKILL TRACKER')).join('')+
 card('学習のつなげ方','<p class="muted">数学の基礎を固めながらPythonで小さな分析を作る。次に微積分・線形代数・確率統計を学び、経済データや金融データの分析へ進む。金融工学や機械学習の応用は、数学と統計の理解を確認しながら段階的に深める。</p>','span-12','SUGGESTED ORDER')+'</div>';
 app.querySelectorAll('[data-skill]').forEach(el=>el.onchange=()=>{db.skills[el.dataset.skill]=el.checked;save();skills()})
}
function library(){
 app.innerHTML=pageHead('YOUR KNOWLEDGE BASE','マイノート','勉強・調査で気づいたことを、あとから使える知識にする。','<button class="btn" id="newNote">＋ ノートを作成</button>')+
 '<div class="grid">'+(db.notes.length?[...db.notes].sort((a,b)=>b.updated-a.updated).map(n=>'<article class="card span-4 note-card" data-note="'+n.id+'"><div class="card-head"><span class="tag">'+esc(n.category)+'</span><span class="card-kicker">'+new Date(n.updated).toLocaleDateString('ja-JP')+'</span></div><div class="note-title">'+esc(n.title)+'</div><div class="note-preview">'+esc(n.body)+'</div></article>').join(''): '<div class="span-12">'+empty('ノートはまだありません','右上の「ノートを作成」から、学びや調査内容を残そう。')+'</div>')+'</div>';
 $('#newNote').onclick=()=>noteModal();
 app.querySelectorAll('[data-note]').forEach(el=>el.onclick=()=>noteModal(Number(el.dataset.note)))
}
function noteModal(id){
 const n=db.notes.find(x=>x.id===id)||{title:'',category:'学習メモ',body:''};
 const backdrop=document.createElement('div');backdrop.className='modal-backdrop';backdrop.innerHTML='<div class="modal"><h2>'+(id?'ノートを編集':'新しいノート')+'</h2><form id="noteForm"><div class="field"><label>タイトル</label><input name="title" maxlength="100" required value="'+esc(n.title)+'"></div><div class="field"><label>カテゴリ</label><select name="category">'+['学習メモ','数学','英語','情報・AI','経済・金融','進路研究','アイデア','その他'].map(x=>'<option '+(n.category===x?'selected':'')+'>'+x+'</option>').join('')+'</select></div><div class="field"><label>内容</label><textarea name="body" style="min-height:230px" required>'+esc(n.body)+'</textarea></div><div class="modal-actions">'+(id?'<button type="button" class="btn danger" id="deleteNote">削除</button>':'')+'<button type="button" class="btn secondary" id="cancelNote">キャンセル</button><button class="btn">保存する</button></div></form></div>';
 document.body.appendChild(backdrop);$('#cancelNote').onclick=()=>backdrop.remove();backdrop.onclick=e=>{if(e.target===backdrop)backdrop.remove()};
 if(id)$('#deleteNote').onclick=()=>{if(confirm('このノートを削除しますか？')){db.notes=db.notes.filter(x=>x.id!==id);save();backdrop.remove();library();toast('ノートを削除しました')}};
 $('#noteForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),item={id:id||Date.now(),title:f.get('title').trim(),category:f.get('category'),body:f.get('body').trim(),updated:Date.now()};if(id)db.notes=db.notes.map(x=>x.id===id?item:x);else db.notes.push(item);save();backdrop.remove();library();toast('ノートを保存しました')}
}
render();

function data(){
 app.innerHTML=pageHead('YOUR DATA, YOUR CONTROL','データ管理','入力したデータをバックアップ・復元できる。定期的に保存しておこう。')+
 '<div class="grid">'+card('バックアップを書き出す','<p class="muted">学習計画・学習記録・振り返り・進路メモ・スキル・ノートをJSONファイルにまとめて保存する。</p><button class="btn" id="exportData">↓ バックアップをダウンロード</button>','span-6','EXPORT')+
 card('バックアップから復元','<p class="muted">以前に書き出したPROJECT NEXTのJSONファイルを読み込む。読み込むと現在のデータは置き換わる。</p><div class="field"><label>バックアップファイル（JSON）</label><input type="file" id="importFile" accept="application/json,.json"></div><button class="btn" id="importData">バックアップを復元</button>','span-6','IMPORT')+
 card('保存場所とプライバシー','<p class="muted">現在のデータは、このブラウザのlocalStorageに保存されている。別の端末とは自動同期されず、ブラウザのデータ削除で消える場合がある。GitHubのprivate設定だけで、公開サイト側にログイン制限が付くわけではない。パスワードや機密情報は入力しないこと。</p><div class="tag orange">定期的なバックアップを推奨</div>','span-12','IMPORTANT')+'</div>';
 $('#exportData').onclick=()=>{const payload={app:'PROJECT NEXT',version:2,exportedAt:new Date().toISOString(),data:db};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='project-next-backup-'+now()+'.json';a.click();URL.revokeObjectURL(url);toast('バックアップを作成しました')};
 $('#importData').onclick=async()=>{const file=$('#importFile').files[0];if(!file){toast('先にJSONファイルを選択してください');return}try{const parsed=JSON.parse(await file.text());const incoming=parsed.data||parsed;if(!incoming||typeof incoming!=='object'||!incoming.plans||!Array.isArray(incoming.records)||!incoming.reviews||!Array.isArray(incoming.notes)||!incoming.skills)throw new Error('invalid');if(!confirm('現在のデータをバックアップ内容で置き換えます。続けますか？'))return;db={...blank(),...incoming};save();toast('バックアップを復元しました');setTimeout(()=>go('home'),500)}catch(e){toast('ファイルを読み込めませんでした。形式を確認してください')}};
}

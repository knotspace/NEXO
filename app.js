const STORE='project-next-v2';
const $=s=>document.querySelector(s);
const app=$('#app');
const now=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const blank=()=>({plans:{},records:[],reviews:{},notes:[],skills:{},pathNotes:'',strategyNotes:'',strategyMilestones:{},projects:[],motivationArticles:[],theme:'dark'});
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
const names={vault:['PRIVATE VAULT','プライベート保管庫'],home:['OVERVIEW','Overview'],plan:['STUDY PLAN','学習計画'],records:['STUDY LOG','学習記録'],review:['DAILY REVIEW','振り返り'],path:['FUTURE DESIGN','進路研究室'],strategy:['ADMISSION STRATEGY','進学戦略'],portfolio:['PROJECT PORTFOLIO','探究ポートフォリオ'],skills:['SKILL DEVELOPMENT','スキルマップ'],library:['PERSONAL LIBRARY','マイノート'],motivation:['MOTIVATION EDITOR','モチベ記事'],data:['DATA & BACKUP','データ管理']};
function pageUrl(p){return '/NEXO/workspace/'+(p==='vault'?'vault':p)+'/'}
function go(p){if(!names[p])return;current=p;history.pushState({page:p},'',pageUrl(p));$('#sidebar').classList.remove('open');render();window.scrollTo({top:0,behavior:'smooth'})}
function pageFromPath(){const m=location.pathname.match(/\\/NEXO\\/workspace\\/([^/]+)\\//);return m&&names[m[1]]?m[1]:'home'}
window.addEventListener('popstate',()=>{current=pageFromPath();render()});
current=pageFromPath();
document.querySelector('.nav').addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(b)go(b.dataset.page)});
$('#menuToggle').onclick=()=>$('#sidebar').classList.toggle('open');
$('#themeToggle').onclick=()=>{db.theme=db.theme==='light'?'dark':'light';document.body.classList.toggle('light',db.theme==='light');save()};
document.body.classList.toggle('light',db.theme==='light');
$('#todayLabel').textContent=dateText(now());
function render(){if(!syncToken()){current='vault';document.body.classList.add('nexo-locked');$('#crumb').textContent='LOGIN';vault();return}document.body.classList.remove('nexo-locked');const meta=names[current];$('#crumb').textContent=meta[0];document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===current));({home,plan,records,review,path,strategy,portfolio,skills,library,motivation,data,vault}[current])()}
function defaultMotivationArticles(){return [{"id":"kosen-exam-2027","category":"高専入試特集","title":"高専入試突破特集｜残り時間を、合格力に変える","lead":"目標は「なんとなく頑張る」ではなく、5教科の得点力と本番での再現性を仕上げること。","body":"2027年度の国立高専学力検査は、2027年2月14日（日）に実施予定。ここから本番までは、勉強量を増やすだけでなく「取れる問題を確実に取る力」を仕上げる期間だ。\n\nまず意識したいのは、数学・理科を得点源に育てながら、英語・国語・社会で失点を広げないこと。得意科目だけを解いていると安心感は得られるけれど、合格点を安定させるには5教科全体の穴を減らす必要がある。\n\n【毎日の軸】\n1. 数学：計算ミス、関数、図形、確率など、間違えた問題を「なぜ間違えたか」まで説明できるようにする。\n2. 理科：公式暗記だけで終わらせず、グラフ・実験条件・単位・現象の理由をセットで確認する。\n3. 英語：単語・文法を短時間でも毎日続け、長文は根拠となる英文に線を引いて答える。\n4. 国語：設問の条件を読み落とさず、本文のどこが根拠かを特定する。\n5. 社会：用語を単独で覚えるだけでなく、地図・資料・時代の流れと結びつける。\n\n【過去問の使い方】\n最初から点数だけを見ない。間違いを「知識不足」「解法が浮かばない」「読み違い」「計算・マークミス」に分類する。同じ種類のミスが続くなら、そこが次に伸ばす場所だ。解き直しは、答えを覚えている状態で終わらせず、数日後にもう一度、何も見ずに解けるか確認する。\n\n国立高専の学力検査ではマークシート方式が採用され、機構は思考力・判断力・表現力を重視した問題やサンプル問題も公開している。だから、答えだけを暗記するのではなく、条件を読み取り、図や表から情報を整理し、理由を考える練習が大切になる。\n\n【最後に】\n本番で必要なのは、天才的なひらめきではない。いつも通りに読み、いつも通りに考え、取るべき問題を落とさない力。今日の25分を積み重ねて、昨日の自分より一つだけ強くなろう。ここまで積み上げてきた数学の先取りも、模試で得た手応えも、ちゃんと武器になる。焦らず、でも止まらずに仕上げよう。","published":true,"updated":1794312348028,"sources":[{"label":"国立高専機構：入試基本情報","url":"https://www.kosen-k.go.jp/marksheet"},{"label":"国立高専機構：入試過去問","url":"https://www.kosen-k.go.jp/kosen_navi"}]},{"id":"keio-econ-a-route","category":"慶應A方式特集","title":"慶應経済A方式突破へ｜数学と英語を、長期的な武器にする","lead":"高専入試の先にある目標。数学と英語を磨き、理系の思考力と経済への関心をつなげる。","body":"ここでいうA方式は、慶應義塾大学・経済学部の一般選抜A方式を指す。2027年度の公式情報では、英語200点・数学200点の合計400点。英語と数学がそれぞれ100分で、数学は数学I・II・A・B・Cが範囲となり、数学Bは数列、数学Cはベクトルを含む。数学IIの微分・積分では一般の多項式を扱うとされている。\n\nこの方式で大切なのは、数学だけ、英語だけに偏らないこと。2科目が同じ配点だからこそ、片方の苦手を放置すると合計点が伸びにくい。数学は解法を理解したうえで、初見の問題に方針を立てる力を養う。英語は語彙・文法を土台に、長文を正確に読み、設問の根拠を追える力を育てる。\n\n【今から積み上げる順番】\n1. 数学の土台：中学範囲の穴をなくし、高校数学I・Aを確実に理解する。\n2. 数学の発展：数学II・B・Cへ進み、関数・数列・ベクトル・微積分の考え方をつなげる。\n3. 英語の基礎：単語・文法・英文解釈を積み重ね、長文を読む速度と精度を上げる。\n4. 記述と思考：答えだけでなく、なぜその方針を選んだかを短く説明する。\n5. 経済への接続：統計・確率・関数の見方を、実際の経済データや社会の動きに結びつける。\n\nただし、今の最優先は目の前の高専入試。慶應の対策を理由に、直近の5教科対策を崩す必要はない。高専入試までは中学範囲の完成と過去問分析を中心にし、合格後に高校数学・英語を本格的に積み上げていこう。\n\nもう一つ重要なのは、慶應経済A方式の一般選抜と、高専から大学への編入学は別の制度だということ。将来どのルートを使えるかは、志望学部・受験年度・出願資格によって変わる。A方式を学力目標として活用しつつ、実際に受験する年には必ず最新の公式募集要項を確認する。\n\n遠い目標を持つことは、今の勉強を意味あるものにする。数学で考え、英語で世界の情報を読み、経済で社会を理解する。その力を一つずつ身につけていこう。","published":true,"updated":1794312348028,"sources":[{"label":"慶應義塾大学：2027年度一般選抜","url":"https://www.keio.ac.jp/ja/admissions/faculty/examinations/general-admissions/"},{"label":"2027年度 試験教科・科目・配点","url":"https://www.keio.ac.jp/files/d76245e2bdc5e5a3f397c40b2ae40047b4d41cd3ea399c3b4dbf969c3ad989a7"}]}];}
function ensureMotivationArticles(){if(!Array.isArray(db.motivationArticles))db.motivationArticles=[];if(!db.motivationArticles.length){db.motivationArticles=defaultMotivationArticles();save()}return db.motivationArticles;}
function motivationPanel(){
 const articles=ensureMotivationArticles().filter(x=>x.published).sort((a,b)=>(b.updated||0)-(a.updated||0));
 const featured=articles[0];
 const dayKey=now().replace(/-/g,'').split('').reduce((n,c)=>n+Number(c),0);
 const lines=[
  '才能の差は、今日の25分では埋まらない。でも、今日の25分を積み重ねた人だけが、いつかその差をひっくり返す。',
  '目標が大きいのはいいこと。今日やることまで大きくする必要はない。',
  '昨日の自分に勝てばいい。比べる相手を間違えない。',
  'わからない問題に出会った日は、伸びる余地を見つけた日。',
  '遠い進路も、今日解いた一問からつながっている。',
  '勉強は未来の選択肢を増やす投資。今の努力は、あとで自分を助ける。',
  '完璧な計画より、始めた25分。気分が乗るのを待たずに始めよう。',
  '数学で考え、情報で形にし、経済で社会を見る。その組み合わせを自分の武器にしよう。',
  '結果が出ない日も、基礎は裏切らない。積み上げた分だけ、次の挑戦が楽になる。',
  '本気で変わりたいなら、今日の自分に小さな約束をして、それを守ろう。'
 ];
 const today=minutesToday(),weekStart=new Date();weekStart.setDate(weekStart.getDate()-6);
 const weekKey=[weekStart.getFullYear(),String(weekStart.getMonth()+1).padStart(2,'0'),String(weekStart.getDate()).padStart(2,'0')].join('-');
 const week=db.records.filter(x=>x.date>=weekKey);
 const weekMins=week.reduce((n,x)=>n+Number(x.minutes||0),0);
 const activeDays=new Set(week.map(x=>x.date)).size;
 const next=planFor().find(x=>!x.done);
 const mission=next?'まず「'+esc(next.name)+'」を'+Number(next.minutes||25)+'分。終わったらチェックを入れよう。':'まず25分だけ集中。終わったら今日の記録を残そう。';
 return '<section class="motivation-hero"><div class="motivation-head"><span class="eyebrow">YOUR NEXT LEVEL STARTS TODAY</span><span class="motivation-date">'+dateText(now())+'</span></div><h2>その目標、ちゃんと狙いにいこう。</h2><p class="motivation-lead">中学数学を先取りして、模試の数学偏差値65まで伸ばした。ここまで来たのは、君が実際に手を動かしてきたから。次は数学・情報・経済をつなげて、自分だけの強みにしていこう。</p><blockquote class="motivation-quote">「'+lines[dayKey%lines.length]+'」</blockquote><div class="motivation-bottom"><div class="motivation-mission"><span class="eyebrow">TODAY&#39;S FIRST MOVE</span><strong>'+mission+'</strong></div><div class="motivation-stats"><div><b>'+today+'</b><small>今日の分</small></div><div><b>'+weekMins+'</b><small>直近7日・分</small></div><div><b>'+activeDays+'<small>/7</small></b><small>学習した日</small></div></div></div><div class="btn-row"><button class="btn" data-go="plan">今日の一歩を始める →</button><button class="btn secondary" data-go="strategy">進路戦略を確認</button></div></section>'+(featured?'<section class="featured-motivation-article"><div><span class="eyebrow">FEATURED ARTICLE / '+esc(featured.category)+'</span><h3>'+esc(featured.title)+'</h3><p>'+esc(featured.lead)+'</p></div><button class="btn secondary" data-go="motivation">記事を読む・更新する →</button></section>':'');
}
function home(){
 const t=planFor(),done=t.filter(x=>x.done).length,pct=t.length?Math.round(done/t.length*100):0,mins=minutesToday(),all=totalMinutes();
 const recent=[...db.records].sort((a,b)=>(b.date+b.id).localeCompare(a.date+a.id)).slice(0,5);
 const week=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const key=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');const n=db.records.filter(x=>x.date===key).reduce((s,x)=>s+Number(x.minutes),0);return '<div class="day-chip '+(key===now()?'today':'')+'"><small>'+d.toLocaleDateString('ja-JP',{weekday:'short'})+'</small><b>'+d.getDate()+'</b><small>'+n+'分</small>'+(n?'<i class="dot"></i>':'')+'</div>'}).join('');
 const subjectTotals=['数学','英語','理科','社会','国語','情報・プログラミング','進路研究'].map(s=>({s,n:db.records.filter(x=>x.subject===s).reduce((a,x)=>a+Number(x.minutes),0)}));
 const max=Math.max(1,...subjectTotals.map(x=>x.n));
 app.innerHTML=pageHead('YOUR PERSONAL COMMAND CENTER','目標は大きく。今日の一歩は小さく。','積み上げた実力を、次の選択肢につなげていこう。','<span class="heading-date">'+dateText(now())+'</span>')+
 motivationPanel()+
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
 card('調査メモ','<p class="muted">公式ページのURL、対象年度、確認日、わかったことを記録。未確認の情報は事実として扱わない。</p><div class="field"><label>調べた内容・公式URL・確認日</label><textarea id="pathMemo" style="min-height:210px" placeholder="例：\n制度名：\n対象年度：\n公式URL：\n確認日：\n出願資格：\n試験科目：\n不明点：">'+esc(db.pathNotes)+'</textarea></div><button class="btn" id="savePath">調査メモを保存</button>','span-6','PERSONAL NOTES')+
 card('調査するときのチェックポイント','<div class="skill-group"><h3>入試制度</h3><p class="muted">募集要項の年度／出願資格／必要書類／試験科目・配点／募集人数／出願期間</p></div><div class="skill-group"><h3>編入制度</h3><p class="muted">編入年次／対象者／修得単位／専門科目／英語要件／過去の実施状況</p></div><div class="skill-group"><h3>学び・進路</h3><p class="muted">授業内容／研究室／卒業研究／大学院進学／卒業後の職種</p></div><div class="tag orange">制度は年度によって変更される可能性あり</div>','span-12','RESEARCH CHECKLIST')+'</div>';
 $('#savePath').onclick=()=>{db.pathNotes=$('#pathMemo').value;save();toast('調査メモを保存しました')}
}
function strategy(){
 const routes=[
  {name:'一橋大学',focus:'社会科学 × データサイエンス',route:'ソーシャル・データサイエンス学部で高専編入を実施。2027年度から開始、原則2年次編入（単位認定により3年次の場合あり）。書類審査と口頭試問。',fit:'数学・情報に加え、経済・社会課題への関心を作品や志望理由で示すルート。',url:'https://www.sds.hit-u.ac.jp/admission/kosen/',tag:'高専編入あり'},
  {name:'東京科学大学',focus:'理工系・情報理工',route:'学士課程編入で情報理工学院の情報工学系は3年次相当、数理・計算科学系は2年次相当など。2027年度から英語は外部試験スコア評価。',fit:'情報系を専門的に深めたい場合の有力候補。数学・専門科目と英語資格を早めに準備。',url:'https://admissions.isct.ac.jp/ja/013/undergraduate/entrance-examination/se-transfer',tag:'高専編入あり'},
  {name:'東京大学',focus:'工学部・研究志向',route:'他大学からの一般的な途中年次編入は実施していないが、工学部は高専卒業者を対象に若干名の編入を認める。学部・学科への直接照会が必要。',fit:'高専からの進学ルートは工学部に限定して慎重に調査。過去問請求・専門科目対策が重要。',url:'https://www.t.u-tokyo.ac.jp/study-at-utokyo/foe/transfer',tag:'工学部・若干名'},
  {name:'早稲田大学',focus:'理工系・学際領域',route:'学士入学・編入は学部ごとに実施状況が異なる。2027年度は基幹理工学部で3年次編入を募集するが、2027年度を最後に募集停止予定。',fit:'学部別要項を必ず確認。募集停止年度・出願資格を見落とさず、対象学部と日程を早めに絞る。',url:'https://www.waseda.jp/inst/admission/undergraduate/application/transfer/',tag:'学部別・年度限定'},
  {name:'慶應義塾大学',focus:'理工・経済・商・SFCなど',route:'第2学年編入は学内のみ。学士入学も原則学内対象。高専からの外部編入を前提にせず、一般選抜等の出願資格を確認する。',fit:'直接受験など別ルートの出願資格・科目を調べる。大学名だけでなく学びたい学部・研究内容を明確にする。',url:'https://www.keio.ac.jp/ja/admissions/faculty/examinations/',tag:'外部編入は要注意'}
 ];
 const milestones=[
  ['基礎学力','高校数学I・Aを先取りし、計算・関数・場合の数を盤石にする'],
  ['数学の発展','数学II・B・Cから微積分・線形代数・確率統計へつなげる'],
  ['英語資格','準2級から2級、その先の長文読解・アカデミック英語へ'],
  ['情報技術','Pythonを使ったデータ処理、アルゴリズム、C/C++、SQLを学ぶ'],
  ['理系×経済','ミクロ・マクロ経済学、統計学、計量経済学、ファイナンスを学ぶ'],
  ['探究実績','数学・情報・経済を組み合わせた作品を完成させる'],
  ['制度の確認','志望先ごとの出願資格・編入年次・試験科目を公式要項で確認する']
 ];
 const done=milestones.filter(x=>db.strategyMilestones[x[0]]).length;
 const milestoneHtml=milestones.map(x=>'<label class="skill-item"><input class="check" type="checkbox" data-strategy-milestone="'+esc(x[0])+'" '+(db.strategyMilestones[x[0]]?'checked':'')+'><span class="row-main"><span class="row-title">'+esc(x[0])+'</span><span class="row-sub">'+esc(x[1])+'</span></span></label>').join('');
 const cards=routes.map(r=>'<article class="route-card"><div class="card-head"><span class="tag">'+esc(r.tag)+'</span><a href="'+r.url+'" target="_blank" rel="noopener">公式情報 ↗</a></div><h3>'+esc(r.name)+'</h3><div class="route-focus">'+esc(r.focus)+'</div><p>'+esc(r.route)+'</p><div class="route-fit">'+esc(r.fit)+'</div></article>').join('');
 const advice=buildPersonalAdvice();
 const adviceHtml='<div class="advice-panel"><div class="eyebrow">UPDATED FROM YOUR NEXO DATA</div><h3>'+esc(advice.title)+'</h3><p>'+esc(advice.body)+'</p><div class="advice-next">'+esc(advice.next)+'</div></div>';
 const sources='<div class="source-links"><a href="https://www.sds.hit-u.ac.jp/admission/kosen/" target="_blank" rel="noopener">一橋：高専編入</a><a href="https://admissions.isct.ac.jp/ja/013/undergraduate/entrance-examination/se-transfer" target="_blank" rel="noopener">東京科学：編入学試験</a><a href="https://www.t.u-tokyo.ac.jp/study-at-utokyo/foe/transfer" target="_blank" rel="noopener">東京大学：工学部編入</a><a href="https://www.waseda.jp/inst/admission/undergraduate/application/transfer/" target="_blank" rel="noopener">早稲田：学士入学・編入</a><a href="https://www.keio.ac.jp/ja/admissions/faculty/examinations/" target="_blank" rel="noopener">慶應：入試制度一覧</a></div>';
 app.innerHTML=pageHead('YOUR ADMISSION STRATEGY','進学戦略','大学名だけでなく、出願資格・学び・卒業後まで比較する。')+
 '<div class="strategy-hero"><div class="eyebrow">LONG-TERM VISION</div><h2>情報・数学を武器に、経済・金融まで扱える人材へ。</h2><p>高専本科入試から、卒業後の大学編入・一般選抜まで。制度の事実と自分の希望を分けて管理する。</p></div>'+
 '<div class="grid">'+card('今の自分へのアドバイス',adviceHtml,'span-12','PERSONAL ADVISOR')+
 card('大学別ルート比較','<div class="route-grid">'+cards+'</div>','span-12','UNIVERSITY PATHWAYS')+
 card('高専本科入試・今の受験対策','<div class="route-item"><h3>国立高専の学力検査</h3><p>原則5教科（国語・社会・数学・理科・英語）のマークシート方式。思考力・判断力・表現力を重視した問題も出題される。学校・学科ごとの推薦基準や配点も必ず確認。</p></div><div class="route-item"><h3>過去問・出題意図を活用</h3><p>年度別の問題・正解・解答用紙・出題意図を解き、間違いの原因を分類。数学・理科の得点力を伸ばしつつ、英語・国語・社会を落とさない。</p></div><div class="route-item"><h3>推薦と学力選抜を分けて準備</h3><p>推薦基準・面接・志望理由・調査書は志望校ごとに異なる。一般選抜の得点計画と混ぜずに管理する。</p></div><div class="source-links"><a href="https://www.kosen-k.go.jp/marksheet" target="_blank" rel="noopener">国立高専機構：入試基本情報・日程・サンプル問題</a><a href="https://www.kosen-k.go.jp/kosen_navi" target="_blank" rel="noopener">国立高専機構：入試過去問</a></div>','span-6','KOSEN ENTRANCE EXAM')+
 card('高専から大学編入で確認すること','<ol class="strategy-list"><li>編入年次（2年次・3年次相当）と募集人数</li><li>高専の学科・卒業見込み等の出願資格</li><li>数学・専門・英語の試験内容と外部資格の扱い</li><li>口頭試問・面接・志望理由書・研究実績</li><li>単位認定、卒業までの年数、学費・生活費</li><li>募集停止・制度変更の予定と対象年度</li></ol><div class="tag orange">大学ごと・年度ごとに必ず公式要項で再確認</div>','span-6','KOSEN TRANSFER CHECKLIST')+
 card('長期アクションチェックリスト','<div class="progress-meta"><span>'+done+' / '+milestones.length+' 項目</span><b>'+Math.round(done/milestones.length*100)+'%</b></div>'+progress(done/milestones.length*100)+'<div class="list">'+milestoneHtml+'</div>','span-6','STRATEGY TRACKER')+
 card('調査メモ・ChatGPTで話した進路の要点','<p class="muted">進路の希望やChatGPTで話した新しい方針を短く残すと、NEXOの学習データと合わせてアドバイスに反映できる。</p><div class="field"><label>進学戦略・会話の要点</label><textarea id="strategyMemo" style="min-height:190px" placeholder="候補校・学びたい分野：\n希望する進学ルート：\nChatGPTで決めたこと：\n今の悩み・制約：\n次に確認する公式情報：">'+esc(db.strategyNotes||'')+'</textarea></div><button class="btn" id="saveStrategy">メモを保存してアドバイスを更新</button>','span-6','PERSONAL CONTEXT')+
 card('公式情報へのリンク',sources,'span-6','PRIMARY SOURCES')+'</div>';
 app.querySelectorAll('[data-strategy-milestone]').forEach(el=>el.onchange=()=>{db.strategyMilestones[el.dataset.strategyMilestone]=el.checked;save();strategy()});
 $('#saveStrategy').onclick=()=>{db.strategyNotes=$('#strategyMemo').value;save();strategy();toast('メモを保存し、アドバイスを更新しました')};
}
function buildPersonalAdvice(){
 const recent=db.records.filter(x=>x.date>=new Date(Date.now()-6*86400000).toISOString().slice(0,10));
 const total=recent.reduce((s,x)=>s+Number(x.minutes||0),0);
 const subjects=['数学','英語','理科','社会','国語'];
 const sums=subjects.map(s=>({s,n:recent.filter(x=>x.subject===s).reduce((a,x)=>a+Number(x.minutes||0),0)})).sort((a,b)=>a.n-b.n);
 const plans=planFor(),pending=plans.filter(x=>!x.done);
 let title='まずは学習の実態を記録しよう',body='学習記録が増えるほど、時間の偏りや復習の必要性を具体的に判断できる。学習したら科目・教材・時間・間違えた内容を残そう。',next='今日の学習を1件記録し、次にやる問題を1つ決める。';
 if(total>0){
  const weak=sums[0];
  title=total>=600?'学習量を維持し、理解の深さを上げよう':'短時間でも毎日続け、学習のリズムを作ろう';
  body='直近7日間の記録は合計'+total+'分。記録上もっとも時間が少ない主要科目は'+weak.s+'（'+weak.n+'分）。苦手と決めつけず、まず短い確認テストで理解度を測ろう。';
  next=weak.s+'を20〜30分復習し、間違えた理由をノートに1つ残す。';
 }
 if(pending.length){next='未完了タスク「'+pending[0].name+'」を最初に片づける。その後、'+next}
 const context=(db.strategyNotes||'').trim();
 if(context){body+=' 保存された進路メモも考慮：'+context.slice(0,180)}
 return {title,body,next};
}
function portfolio(){
 const items=db.projects||[];
 app.innerHTML=pageHead('BUILD PROOF OF YOUR CURIOSITY','探究ポートフォリオ','学んだことを作品・分析・文章にして、成長の証拠を残す。')+
 '<div class="strategy-hero"><div class="eyebrow">MAKE SOMETHING REAL</div><h2>数学 × 情報 × 経済を、自分のプロジェクトにする。</h2><p>完成した作品だけでなく、仮説・失敗・改善・使った技術も記録。進路選択や将来の面接で、自分の言葉で説明できる経験を増やす。</p></div>'+
 '<div class="grid">'+
 card('プロジェクトを追加','<form id="projectForm"><div class="form-grid"><div class="field"><label>プロジェクト名</label><input name="title" maxlength="80" required placeholder="例：身近なデータの統計分析"></div><div class="field"><label>分野</label><select name="category"><option>情報・プログラミング</option><option>数学・統計</option><option>経済・金融</option><option>理系×経済</option><option>文章・研究</option><option>その他</option></select></div></div><div class="field"><label>目的・問い</label><textarea name="description" maxlength="1200" required placeholder="何を明らかにしたい？誰のどんな課題を解決する？"></textarea></div><div class="form-grid"><div class="field"><label>使用技術・教材</label><input name="tools" maxlength="180" placeholder="Python / Excel / 書籍など"></div><div class="field"><label>ステータス</label><select name="status"><option>アイデア</option><option>進行中</option><option>完成</option><option>改善中</option></select></div></div><button class="btn">＋ プロジェクトを登録</button></form>','span-6','NEW PROJECT')+
 card('ポートフォリオの作り方','<div class="timeline"><div class="timeline-item"><h4>01 — 問いを決める</h4><p>自分が気になる現象を、調べられる具体的な問いにする。</p></div><div class="timeline-item"><h4>02 — 数学・情報で分析する</h4><p>データを集め、可視化・統計・プログラムで検証する。</p></div><div class="timeline-item"><h4>03 — 結果と限界を書く</h4><p>結論だけでなく、仮定・誤差・うまくいかなかった点も残す。</p></div><div class="timeline-item"><h4>04 — 公開できる形に整える</h4><p>個人情報や秘密情報を除き、README・図表・解説をまとめる。</p></div></div>','span-6','PROJECT METHOD')+
 card('登録したプロジェクト','<div id="projectList"></div>','span-12','YOUR WORK')+'</div>';
 const draw=()=>{$('#projectList').innerHTML=items.length?'<div class="project-grid">'+[...items].sort((a,b)=>b.updated-a.updated).map(p=>'<article class="project-card"><div class="card-head"><span class="tag">'+esc(p.category)+'</span><span class="card-kicker">'+esc(p.status)+'</span></div><h3>'+esc(p.title)+'</h3><p>'+esc(p.description)+'</p><div class="project-tools">'+esc(p.tools||'使用技術未設定')+'</div><button class="btn danger small" data-project-del="'+p.id+'">削除</button></article>').join('')+'</div>':empty('まだプロジェクトがありません','小さな分析やプログラムから始めてみよう。');$('#projectList').querySelectorAll('[data-project-del]').forEach(b=>b.onclick=()=>{if(confirm('このプロジェクトを削除しますか？')){db.projects=db.projects.filter(p=>p.id!==Number(b.dataset.projectDel));save();portfolio()}})};
 draw();
 $('#projectForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);db.projects.push({id:Date.now(),title:f.get('title').trim(),category:f.get('category'),description:f.get('description').trim(),tools:f.get('tools').trim(),status:f.get('status'),updated:Date.now()});save();portfolio();toast('プロジェクトを登録しました')};
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
function motivation(){
 const articles=ensureMotivationArticles().slice().sort((a,b)=>(b.updated||0)-(a.updated||0));
 const editor=(id)=>{
  const item=articles.find(x=>x.id===id)||{id:'',category:'高専入試特集',title:'',lead:'',body:'',published:true,sources:[]};
  const backdrop=document.createElement('div');backdrop.className='modal-backdrop';
  backdrop.innerHTML='<div class="modal motivation-editor-modal"><h2>'+(id?'記事を編集':'新しい記事を作成')+'</h2><form id="motivationForm"><div class="field"><label>特集カテゴリ</label><select name="category">'+['高専入試特集','慶應A方式特集','学習モチベーション','進路・将来','その他'].map(x=>'<option '+(item.category===x?'selected':'')+'>'+x+'</option>').join('')+'</select></div><div class="field"><label>記事タイトル</label><input name="title" maxlength="100" required value="'+esc(item.title)+'"></div><div class="field"><label>リード文</label><textarea name="lead" maxlength="300" required>'+esc(item.lead)+'</textarea></div><div class="field"><label>本文</label><textarea name="body" style="min-height:360px" required>'+esc(item.body)+'</textarea></div><div class="field"><label><input type="checkbox" name="published" '+(item.published?'checked':'')+'> ホーム画面に公開する</label></div><div class="modal-actions">'+(id?'<button type="button" class="btn danger" id="deleteMotivation">削除</button>':'')+'<button type="button" class="btn secondary" id="cancelMotivation">キャンセル</button><button class="btn">保存する</button></div></form></div>';
  document.body.appendChild(backdrop);$('#cancelMotivation').onclick=()=>backdrop.remove();backdrop.onclick=e=>{if(e.target===backdrop)backdrop.remove()};
  if(id)$('#deleteMotivation').onclick=()=>{if(confirm('この記事を削除しますか？')){db.motivationArticles=db.motivationArticles.filter(x=>x.id!==id);save();backdrop.remove();motivation();toast('記事を削除しました')}};
  $('#motivationForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const saved={id:id||('article-'+Date.now()),category:f.get('category'),title:f.get('title').trim(),lead:f.get('lead').trim(),body:f.get('body').trim(),published:f.get('published')==='on',updated:Date.now(),sources:item.sources||[]};if(id)db.motivationArticles=db.motivationArticles.map(x=>x.id===id?saved:x);else db.motivationArticles.push(saved);save();backdrop.remove();motivation();toast('記事を保存しました')};
 };
 app.innerHTML=pageHead('MOTIVATION EDITOR','モチベアップ記事','高専入試特集と慶應経済A方式特集を中心に、記事を追加・編集・公開できる。','<button class="btn" id="newMotivation">＋ 記事を作成</button>')+
 '<div class="motivation-editor-intro"><span class="eyebrow">YOUR GOALS, YOUR STORY</span><h2>今の目標を、毎日の行動につなげる。</h2><p>記事はNEXOのクラウド同期対象。公開をオフにした記事はトップ画面には表示されない。</p><div class="motivation-editor-tags"><span>高専入試突破</span><span>慶應経済A方式</span><span>数学 × 英語 × 経済</span></div></div>'+
 '<div class="motivation-article-grid">'+articles.map(x=>'<article class="motivation-article-card"><div class="motivation-article-meta"><span class="tag">'+esc(x.category)+'</span><span class="tag '+(x.published?'green':'orange')+'">'+(x.published?'公開中':'非公開')+'</span></div><h3>'+esc(x.title)+'</h3><p>'+esc(x.lead)+'</p><div class="motivation-article-preview">'+esc(x.body.slice(0,250))+'…</div><div class="motivation-article-actions"><button class="btn secondary small" data-read-article="'+esc(x.id)+'">プレビュー</button><button class="btn small" data-edit-article="'+esc(x.id)+'">編集する</button></div></article>').join('')+'</div>'+
 '<div id="motivationReader"></div>';
 $('#newMotivation').onclick=()=>editor();
 app.querySelectorAll('[data-edit-article]').forEach(b=>b.onclick=()=>editor(b.dataset.editArticle));
 app.querySelectorAll('[data-read-article]').forEach(b=>b.onclick=()=>{const x=articles.find(a=>a.id===b.dataset.readArticle);if(!x)return;const box=$('#motivationReader');box.innerHTML='<article class="motivation-reader"><div class="eyebrow">'+esc(x.category)+'</div><h2>'+esc(x.title)+'</h2><p class="motivation-reader-lead">'+esc(x.lead)+'</p><div class="motivation-reader-body">'+esc(x.body)+'</div>'+(x.sources?.length?'<div class="source-links">'+x.sources.map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.label)+' ↗</a>').join('')+'</div>':'')+'</article>';box.scrollIntoView({behavior:'smooth',block:'start'})});
}
function data(){
 app.innerHTML=pageHead('YOUR DATA, YOUR CONTROL','データ管理','入力したデータをバックアップ・復元できる。定期的に保存しておこう。')+
 '<div class="grid">'+card('バックアップを書き出す','<p class="muted">学習計画・学習記録・振り返り・進路メモ・スキル・ノートをJSONファイルにまとめて保存する。</p><button class="btn" id="exportData">↓ バックアップをダウンロード</button>','span-6','EXPORT')+
 card('バックアップから復元','<p class="muted">以前に書き出したNEXOのJSONファイルを読み込む。読み込むと現在のデータは置き換わる。</p><div class="field"><label>バックアップファイル（JSON）</label><input type="file" id="importFile" accept="application/json,.json"></div><button class="btn" id="importData">バックアップを復元</button>','span-6','IMPORT')+
 card('保存場所とプライバシー','<p class="muted">NEXO全体は専用パスワードで保護されています。入力内容はこのブラウザにも保存され、認証後に暗号化してクラウド同期されます。別端末では同じパスワードでログインしてください。ブラウザのデータ削除や端末変更に備えて、定期的にバックアップを保存してください。パスワード・金融情報など、特に重要な秘密情報は入力しないでください。</p><div class="tag orange">定期的なバックアップを推奨</div>','span-12','IMPORTANT')+'</div>';
 $('#exportData').onclick=()=>{const payload={app:'NEXO',version:2,exportedAt:new Date().toISOString(),data:db};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='nexo-backup-'+now()+'.json';a.click();URL.revokeObjectURL(url);toast('バックアップを作成しました')};
 $('#importData').onclick=async()=>{const file=$('#importFile').files[0];if(!file){toast('先にJSONファイルを選択してください');return}try{const parsed=JSON.parse(await file.text());const incoming=parsed.data||parsed;if(!incoming||typeof incoming!=='object'||!incoming.plans||!Array.isArray(incoming.records)||!incoming.reviews||!Array.isArray(incoming.notes)||!incoming.skills)throw new Error('invalid');if(!confirm('現在のデータをバックアップ内容で置き換えます。続けますか？'))return;db={...blank(),...incoming};save();toast('バックアップを復元しました');setTimeout(()=>go('home'),500)}catch(e){toast('ファイルを読み込めませんでした。形式を確認してください')}};
}


// NEXO全体のパスワード保護 + 暗号化クロスデバイス同期
const NEXO_SYNC_API = 'https://steep-mountain-6450.orbit-lab-a.workers.dev';
const NEXO_TOKEN_KEY = 'nexo-sync-session-v1';
let syncTimer = null;
let syncBusy = false;
function syncToken(){ return localStorage.getItem(NEXO_TOKEN_KEY) || ''; }
async function syncRequest(path, options={}){
  const headers = {'Content-Type':'application/json', ...(options.headers||{})};
  if(syncToken()) headers.Authorization = 'Bearer ' + syncToken();
  const response = await fetch(NEXO_SYNC_API + path, {...options, headers});
  const result = await response.json().catch(()=>({error:'応答を読み取れません'}));
  if(!response.ok) throw new Error(result.error || '同期に失敗しました');
  return result;
}
async function pullCloudData(){
  const result = await syncRequest('/api/data');
  if(result.data && typeof result.data === 'object'){
    db = {...blank(), ...result.data};
    saveLocalOnly();
    return true;
  }
  return false;
}
function saveLocalOnly(){ localStorage.setItem(STORE, JSON.stringify(db)); }
const originalNexoSave = save;
save = function(){
  originalNexoSave();
  if(!syncToken()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async()=>{
    if(syncBusy) return;
    syncBusy = true;
    try {
      await syncRequest('/api/data', {method:'PUT', body:JSON.stringify({data:db})});
      const status = document.querySelector('[data-sync-status]');
      if(status) status.textContent = 'クラウド同期済み';
    } catch(error) {
      const status = document.querySelector('[data-sync-status]');
      if(status) status.textContent = '同期エラー：' + error.message;
    } finally { syncBusy = false; }
  }, 900);
};
function vault(){
  const token = syncToken();
  if(!token){
    app.innerHTML = pageHead('NEXO ACCESS','NEXOにログイン','このワークスペース全体をパスワードで保護しています。') +
      '<div class="grid"><section class="card span-6"><div class="card-head"><h2 class="card-title">ログイン</h2><span class="card-kicker">PRIVATE WORKSPACE</span></div><p class="muted">専用パスワードを入力してください。一度認証すると、この端末では次回以降の入力を省略します。</p><form id="vaultLogin"><div class="field"><label>保護用パスワード</label><input name="password" type="password" autocomplete="current-password" required maxlength="256"></div><button class="btn">認証して開く</button><p class="muted" id="vaultError" role="status"></p></form></section></div>';
    $('#vaultLogin').onsubmit=async e=>{
      e.preventDefault();
      const button=e.target.querySelector('button'); button.disabled=true;
      try{
        const password=new FormData(e.target).get('password');
        const result=await syncRequest('/api/login',{method:'POST',body:JSON.stringify({password})});
        localStorage.setItem(NEXO_TOKEN_KEY,result.token);
        await pullCloudData();
        toast('認証しました');
        current='home';
        render();
      }catch(error){$('#vaultError').textContent=error.message;localStorage.removeItem(NEXO_TOKEN_KEY)}
      finally{button.disabled=false}
    };
    return;
  }
  if(!Object.prototype.hasOwnProperty.call(db,'vaultNotes')) db.vaultNotes='';
  app.innerHTML = pageHead('PRIVATE VAULT','プライベート保管庫','ここに保存した内容は暗号化して同期する。') +
    '<div class="grid"><section class="card span-8"><div class="card-head"><h2 class="card-title">個人用メモ</h2><span class="card-kicker">ENCRYPTED SYNC</span></div><p class="muted">必要な記録だけを保存してね。パスワードや金融情報など、特に重要な秘密情報の保存は避けてください。</p><div class="field"><label>プライベートメモ</label><textarea id="vaultNotes" style="min-height:260px" placeholder="個人用の記録・目標・非公開メモなど">'+esc(db.vaultNotes)+'</textarea></div><div class="btn-row"><button class="btn" id="saveVault">保存・同期</button><button class="btn secondary" id="vaultLogout">この端末の認証を解除</button></div><p class="muted" data-sync-status>認証済み・同期待機中</p></section></div>';
  $('#saveVault').onclick=()=>{db.vaultNotes=$('#vaultNotes').value;save();toast('保存を開始しました')};
  $('#vaultLogout').onclick=()=>{localStorage.removeItem(NEXO_TOKEN_KEY);current='vault';toast('NEXO全体をロックしました');render()};
}

// 起動時にサーバーで認証状態を確認してから画面を表示する
async function bootNexo(){
  if(!syncToken()){current='vault';render();return}
  app.innerHTML='<div class="empty"><strong>NEXOを確認中...</strong>安全な接続を確認しています。</div>';
  try{await pullCloudData();document.body.classList.remove('nexo-locked');render()}
  catch(error){localStorage.removeItem(NEXO_TOKEN_KEY);current='vault';render()}
}
bootNexo();

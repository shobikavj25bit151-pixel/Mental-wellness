const $ = (id) => document.getElementById(id);
const todayKey = () => new Date().toLocaleDateString();
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const quotes = [
  ["You are allowed to grow at your own pace.","A gentle reminder"],
  ["Small steps every day add up to beautiful changes.","Your daily note"],
  ["Rest is productive, too. Give yourself permission.","A gentle reminder"],
  ["You deserve the same kindness you give to others.","Your daily note"],
  ["One difficult day does not mean a difficult life.","A gentle reminder"],
  ["Breathe. You are here, and that is enough for this moment.","Your daily note"]
];
let quoteIndex = Math.floor(Math.random() * quotes.length);
function showQuote(){ $("quote-text").textContent = `“${quotes[quoteIndex][0]}”`; $("quote-author").textContent = `— ${quotes[quoteIndex][1]}`; }
$("new-quote").addEventListener("click", () => { quoteIndex = (quoteIndex + 1) % quotes.length; showQuote(); });
showQuote();

const now = new Date();
$("today-date").textContent = now.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
$("journal-date").textContent = now.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});

let moods = read("bloomMoods", []);
function renderHistory(){
  $("entry-count").textContent = `${moods.length} ${moods.length === 1 ? "check-in" : "check-ins"}`;
  const list = $("history-list");
  if(!moods.length){ list.innerHTML = '<p class="empty-state">Your check-ins will appear here. Start by choosing a mood above.</p>'; return; }
  list.innerHTML = moods.slice().reverse().slice(0,12).map(item =>
    `<div class="history-item"><span class="history-emoji">${item.emoji}</span><div class="history-detail"><strong>${escapeHTML(item.mood)}</strong><p>${escapeHTML(item.note || "Mood check-in")}</p></div><span class="history-date">${escapeHTML(item.date)}</span></div>`
  ).join("");
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
document.querySelectorAll(".mood-option").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".mood-option").forEach(b=>b.classList.remove("selected"));
  button.classList.add("selected");
  const entry = {mood:button.dataset.mood,emoji:button.dataset.emoji,date:todayKey()};
  const existing = moods.findIndex(x=>x.date===entry.date);
  if(existing>=0) moods[existing]=entry; else moods.push(entry);
  write("bloomMoods",moods); renderHistory();
  $("mood-message").textContent = `Your ${entry.mood.toLowerCase()} mood has been saved. Thank you for checking in.`;
}));
renderHistory();

const savedJournal = read("bloomJournal",{});
$("journal-entry").value = savedJournal[todayKey()] || "";
$("save-journal").addEventListener("click",()=>{
  const value=$("journal-entry").value.trim();
  const journals=read("bloomJournal",{});
  if(!value){$("journal-message").textContent="Write a little something before saving.";return;}
  journals[todayKey()]=value;write("bloomJournal",journals);
  $("journal-message").textContent="Your thoughts have been saved privately in this browser. ♡";
});

$("stress-level").addEventListener("input",()=>{$("stress-value").textContent=$("stress-level").value+"/10";});
$("save-stress").addEventListener("click",()=>{
  const entries=read("bloomStress",{});entries[todayKey()]=Number($("stress-level").value);write("bloomStress",entries);
  $("stress-message").textContent="Stress level saved for today.";
});
const previousStress=read("bloomStress",{})[todayKey()];
if(previousStress){$("stress-level").value=previousStress;$("stress-value").textContent=previousStress+"/10";}
$("save-sleep").addEventListener("click",()=>{
  const hours=Number($("sleep-hours").value);
  if(!Number.isFinite(hours)||hours<0||hours>24){$("sleep-message").textContent="Enter a number between 0 and 24.";return;}
  const entries=read("bloomSleep",{});entries[todayKey()]=hours;write("bloomSleep",entries);
  $("sleep-message").textContent=`${hours} hours saved. Rest well!`;
});
const previousSleep=read("bloomSleep",{})[todayKey()];
if(previousSleep!==undefined)$("sleep-hours").value=previousSleep;

let meditationInterval=null, remaining=60;
function showMeditationTime(){$("meditation-time").textContent=`${String(Math.floor(remaining/60)).padStart(2,"0")}:${String(remaining%60).padStart(2,"0")}`;}
$("meditation-start").addEventListener("click",()=>{
  if(meditationInterval){clearInterval(meditationInterval);meditationInterval=null;$("meditation-start").textContent="Resume meditation";return;}
  $("meditation-start").textContent="Pause";
  meditationInterval=setInterval(()=>{
    remaining--;showMeditationTime();
    if(remaining<=0){clearInterval(meditationInterval);meditationInterval=null;$("meditation-start").textContent="Start again";$("meditation-message").textContent="Lovely work. Take a moment to notice how you feel."; }
  },1000);
  $("meditation-message").textContent="Breathe gently and let your shoulders relax.";
});
$("meditation-reset").addEventListener("click",()=>{clearInterval(meditationInterval);meditationInterval=null;remaining=60;showMeditationTime();$("meditation-start").textContent="Start meditation";$("meditation-message").textContent="Find a comfortable position.";});

let breathInterval=null, breathStep=0, breathSeconds=4;
const breathSteps=[["Breathe in", "inhale"],["Hold gently", "hold"],["Breathe out", "exhale"]];
function breathTick(){
  if(breathSeconds===4){$("breath-instruction").textContent=breathSteps[breathStep][0];$("breath-circle").className="breath-circle "+breathSteps[breathStep][1];}
  breathSeconds--;
  if(breathSeconds<=0){breathStep=(breathStep+1)%3;breathSeconds=4;}
}
$("breathing-start").addEventListener("click",()=>{
  if(breathInterval)return;
  breathStep=0;breathSeconds=4;breathTick();
  breathInterval=setInterval(breathTick,1000);
  $("breathing-message").textContent="Follow the circle at a comfortable pace.";
});
$("breathing-stop").addEventListener("click",()=>{
  clearInterval(breathInterval);breathInterval=null;$("breath-circle").className="breath-circle";$("breath-instruction").textContent="Ready?";$("breathing-message").textContent="Take your time. Resume whenever you like.";
});
$("clear-history").addEventListener("click",()=>{
  if(!confirm("Clear all saved mood history? This cannot be undone."))return;
  moods=[];write("bloomMoods",moods);renderHistory();$("mood-message").textContent="Mood history cleared.";
});
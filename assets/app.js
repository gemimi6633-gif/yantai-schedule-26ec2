const periods = {
  1: { label: "第一大节", sections: "01,02小节", time: "08:00-09:40", start: "08:00", end: "09:40" },
  2: { label: "第二大节", sections: "03,04小节", time: "10:00-11:40", start: "10:00", end: "11:40" },
  3: { label: "第三大节", sections: "05,06小节", time: "14:00-15:40", start: "14:00", end: "15:40" },
  4: { label: "第四大节", sections: "07,08小节", time: "16:00-17:40", start: "16:00", end: "17:40" },
  5: { label: "第五大节", sections: "09,10小节", time: "19:10-20:50", start: "19:10", end: "20:50" },
};

const dayNames = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const shortDayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const termStartText = "2026-08-31";
const maxWeek = 17;

const courses = [
  c("人工智能伦理", "贾鹏宇", 1, 1, [2, 4, 6, 8, 10, 12, 14, 16], "主校区 五教101"),
  c("直播营销与运营", "贾子十", 1, 2, range(1, 11).concat(range(14, 17)), "主校区 六教102"),
  c("短视频创作", "李宜男", 1, 3, [2, 4, 6, 8, 10, 11, 14, 16], "主校区 室外23"),
  c("消费者行为学", "迟少杰", 2, 1, range(1, 11).concat(range(14, 17)), "主校区 五教203"),
  c("大学体育5", "宋子函", 2, 2, [1, 3, 5, 7, 9, 11, 13, 15], "主校区 体能训练--6"),
  c("形势与政策1", "刘秋云", 2, 3, range(5, 8), "主校区 五教201"),
  c("网络营销", "龙溪莉", 3, 1, range(1, 11).concat(range(14, 17)), "主校区 五教303"),
  c("电子商务概论", "宋金波", 3, 3, [2, 7, 8, 9, 10, 11, 14, 16, 17], "主校区 五教203"),
  c("管理学", "林云连", 3, 4, [1, 3, 5, 7, 9, 11, 14, 15, 17], "主校区 四教402"),
  c("短视频创作", "李宜男", 3, 5, [1, 3, 5, 7, 9, 10, 11, 15], "主校区 四教401"),
  c("管理学", "林云连", 4, 1, range(1, 11).concat(range(14, 17)), "主校区 四教402"),
  c("直播营销与运营", "贾子十", 4, 2, [2, 4, 5, 8, 10, 14, 15, 16, 17], "主校区 六教102"),
  c("马克思主义基本原理", "宁帅", 4, 3, [2, 4, 6, 8, 10, 12, 14, 16], "主校区 五教101"),
  c("网络营销", "龙溪莉", 4, 4, [1, 3, 4, 8, 10, 14, 15, 16, 17], "主校区 四教302"),
  c("电子商务概论", "宋金波", 5, 1, range(1, 11).concat(range(14, 17)), "主校区 四教305"),
  c("马克思主义基本原理", "宁帅", 5, 2, range(1, 16), "主校区 五教101"),
  c("消费者行为学", "迟少杰", 5, 3, [1, 3, 5, 6, 7, 9, 11, 15, 17], "主校区 五教203"),
];

const specialNotes = [
  { name: "市场调查实习", teacher: "李鹏、罗林波", weeks: [12, 13], note: "原图备注未给固定星期和节次" },
];

const state = {
  selectedWeek: 1,
  selectedDay: 1,
};

function c(name, teacher, day, period, weeks, location) {
  return { name, teacher, day, period, weeks: [...new Set(weeks)].sort((a, b) => a - b), location };
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getToday() {
  return new Date();
}

function dateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getTermStart() {
  return new Date(`${termStartText}T00:00:00`);
}

function getWeekNumber(today = getToday()) {
  const start = getTermStart();
  const diff = dateOnly(today) - dateOnly(start);
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

function clampWeek(week) {
  if (week < 1) return 1;
  if (week > maxWeek) return maxWeek;
  return week;
}

function weekStartDate(week) {
  const start = dateOnly(getTermStart());
  start.setDate(start.getDate() + (week - 1) * 7);
  return start;
}

function dayOffset(day) {
  return day === 0 ? 6 : day - 1;
}

function dateForDay(week, day) {
  const date = weekStartDate(week);
  date.setDate(date.getDate() + dayOffset(day));
  return date;
}

function formatMonthDay(date) {
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

function formatFullDate(date) {
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function classStatus(course, now = getToday()) {
  const currentWeek = getWeekNumber(now);
  if (currentWeek !== state.selectedWeek || course.day !== now.getDay()) return "";
  const todayMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = periods[course.period].start.split(":").map(Number);
  const [endH, endM] = periods[course.period].end.split(":").map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  if (todayMinutes >= start && todayMinutes <= end) return "now";
  if (todayMinutes < start) return "upcoming";
  return "";
}

function coursesForDay(day, week) {
  return courses
    .filter((course) => course.day === day && course.weeks.includes(week))
    .sort((a, b) => a.period - b.period);
}

function defaultSelectedDay(currentWeek) {
  if (currentWeek < 1) return 1;
  return getToday().getDay();
}

function populateWeekSelect() {
  const select = document.querySelector("#weekSelect");
  const currentWeek = getWeekNumber();
  select.innerHTML = range(1, maxWeek)
    .map((week) => {
      const start = weekStartDate(week);
      const end = weekStartDate(week);
      end.setDate(end.getDate() + 6);
      const current = week === currentWeek ? " 当前" : "";
      return `<option value="${week}">第${week}周 ${formatMonthDay(start)}-${formatMonthDay(end)}${current}</option>`;
    })
    .join("");
  select.value = String(state.selectedWeek);
}

function renderHeader(currentWeek) {
  const today = getToday();
  const todayText = today.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" });
  document.querySelector("#todayLabel").textContent = todayText;
  document.querySelector("#weekLabel").textContent = `第 ${state.selectedWeek} 周`;
}

function renderDayButtons() {
  document.querySelectorAll("[data-day]").forEach((button) => {
    const day = Number(button.dataset.day);
    const date = dateForDay(state.selectedWeek, day);
    button.classList.toggle("active", day === state.selectedDay);
    button.innerHTML = `<span>${shortDayNames[day]}</span><small>${formatMonthDay(date)}</small>`;
  });
}

function renderFocus() {
  const visible = coursesForDay(state.selectedDay, state.selectedWeek);
  const date = dateForDay(state.selectedWeek, state.selectedDay);
  const focusTitle = document.querySelector("#focusTitle");
  const focusMeta = document.querySelector("#focusMeta");
  focusTitle.textContent = visible.length
    ? `第${state.selectedWeek}周 ${shortDayNames[state.selectedDay]}有 ${visible.length} 门课`
    : `第${state.selectedWeek}周 ${shortDayNames[state.selectedDay]}无课`;
  focusMeta.textContent = visible.length
    ? visible.map((course) => `${periods[course.period].time} ${course.name}`).join("，")
    : `${formatFullDate(date)} 没有固定课程安排。`;
}

function courseCard(course, compact = false) {
  const status = classStatus(course);
  if (compact) {
    return `
      <div class="mini-course">
        <strong>${periods[course.period].time} · ${course.name}</strong>
        <span>${course.teacher} · ${course.location}</span>
      </div>
    `;
  }
  return `
    <article class="course-card ${status}">
      <div class="time">${periods[course.period].time}<br><small>${periods[course.period].label}</small></div>
      <div>
        <h3 class="course-name">${course.name}</h3>
        <p class="course-meta">${course.teacher} · ${course.location}<br>${periods[course.period].sections}</p>
      </div>
    </article>
  `;
}

function renderSelectedDay() {
  const visible = coursesForDay(state.selectedDay, state.selectedWeek);
  const date = dateForDay(state.selectedWeek, state.selectedDay);
  const title = `${shortDayNames[state.selectedDay]}课程 · ${formatMonthDay(date)}`;
  document.querySelector("#currentDayTitle").textContent = title;
  document.querySelector("#todayCourses").innerHTML = visible.length
    ? visible.map((course) => courseCard(course)).join("")
    : `<div class="empty">第${state.selectedWeek}周 ${shortDayNames[state.selectedDay]}没有固定课程。</div>`;
}

function renderWeek() {
  const grid = document.querySelector("#weekGrid");
  const days = [1, 2, 3, 4, 5, 6, 0];
  grid.innerHTML = days
    .map((day) => {
      const list = coursesForDay(day, state.selectedWeek);
      const date = dateForDay(state.selectedWeek, day);
      const isActive = day === state.selectedDay;
      return `
        <section class="day-column ${isActive ? "active-day" : ""}">
          <div class="day-title"><span>${shortDayNames[day]} ${formatMonthDay(date)}</span><small>${list.length}门</small></div>
          ${
            list.length
              ? list.map((course) => courseCard(course, true)).join("")
              : `<div class="empty">无课</div>`
          }
        </section>
      `;
    })
    .join("");

  document.querySelector("#weekTitle").textContent = `第${state.selectedWeek}周每天课程`;
  renderWeekNotes();
}

function renderWeekNotes() {
  const notes = specialNotes.filter((item) => item.weeks.includes(state.selectedWeek));
  const box = document.querySelector("#weekNotes");
  if (!notes.length) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = notes
    .map((item) => `<p>备注：第${state.selectedWeek}周有${item.name}（${item.teacher}），${item.note}。</p>`)
    .join("");
}

function render() {
  const currentWeek = getWeekNumber();
  populateWeekSelect();
  renderHeader(currentWeek);
  renderDayButtons();
  renderFocus();
  renderSelectedDay();
  renderWeek();
}

function init() {
  const currentWeek = getWeekNumber();
  state.selectedWeek = clampWeek(currentWeek);
  state.selectedDay = defaultSelectedDay(currentWeek);

  document.querySelector("#weekSelect").addEventListener("change", (event) => {
    state.selectedWeek = Number(event.target.value);
    render();
  });

  document.querySelectorAll("[data-day]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDay = Number(button.dataset.day);
      render();
    });
  });

  render();
  setInterval(render, 60 * 1000);
}

init();

const periods = {
  1: { label: "第一大节", sections: "01,02小节", time: "08:00-09:40", start: "08:00", end: "09:40" },
  2: { label: "第二大节", sections: "03,04小节", time: "10:00-11:40", start: "10:00", end: "11:40" },
  3: { label: "第三大节", sections: "05,06小节", time: "14:00-15:40", start: "14:00", end: "15:40" },
  4: { label: "第四大节", sections: "07,08小节", time: "16:00-17:40", start: "16:00", end: "17:40" },
  5: { label: "第五大节", sections: "09,10小节", time: "19:10-20:50", start: "19:10", end: "20:50" },
};

const dayNames = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

const courses = [
  c("人工智能伦理", "贾鹏宇", 1, 1, [2, 4, 6, 8, 10, 12, 14, 16], "主校区 五教101"),
  c("直播营销与运营", "贾子十", 1, 2, range(1, 11).concat(range(14, 17)), "主校区 六教102"),
  c("短视频创作", "李宜男", 1, 3, [2, 4, 6, 8, 10, 11, 14, 16], "主校区 室外23"),
  c("消费者行为学", "迟少杰", 2, 1, range(1, 11).concat(range(14, 17)), "主校区 五教203"),
  c("大学体育5", "宋子函", 2, 2, [1, 3, 5, 7, 9, 11, 13, 15], "主校区 体能训练-6"),
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
  { name: "市场调查实习", teacher: "李鹏、罗林波", weeks: [12, 13], note: "备注课程，原图未给出固定节次" },
];

const state = {
  filter: "current",
  selectedDay: "today",
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
  const saved = localStorage.getItem("termStart");
  const input = document.querySelector("#termStart");
  const value = saved || input.value || "2026-08-31";
  input.value = value;
  return new Date(`${value}T00:00:00`);
}

function getWeekNumber(today = getToday()) {
  const start = getTermStart();
  const diff = dateOnly(today) - dateOnly(start);
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

function weekType(week) {
  if (week < 1) return "未开学";
  return week % 2 === 1 ? "单周" : "双周";
}

function compactWeeks(weeks) {
  const sorted = [...weeks].sort((a, b) => a - b);
  const parts = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (let i = 1; i <= sorted.length; i += 1) {
    const value = sorted[i];
    if (value === prev + 1) {
      prev = value;
      continue;
    }
    parts.push(start === prev ? `${start}` : `${start}-${prev}`);
    start = value;
    prev = value;
  }
  return `${parts.join(",")}周`;
}

function classStatus(course, now = getToday()) {
  const todayMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = periods[course.period].start.split(":").map(Number);
  const [endH, endM] = periods[course.period].end.split(":").map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  if (course.day !== now.getDay()) return "";
  if (todayMinutes >= start && todayMinutes <= end) return "now";
  if (todayMinutes < start) return "upcoming";
  return "";
}

function matchesFilter(course, week) {
  return week >= 1 && course.weeks.includes(week);
}

function displayWeek(currentWeek) {
  const baseWeek = Math.max(1, currentWeek);
  return state.filter === "next" ? baseWeek + 1 : baseWeek;
}

function targetDay() {
  if (state.selectedDay === "today") return getToday().getDay();
  return Number(state.selectedDay);
}

function coursesForDay(day, week) {
  return courses
    .filter((course) => course.day === day && matchesFilter(course, week))
    .sort((a, b) => a.period - b.period);
}

function getNextClass(week) {
  const now = getToday();
  for (let offset = 0; offset < 14; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const checkWeek = getWeekNumber(date);
    const day = date.getDay();
    const dayCourses = courses
      .filter((course) => course.day === day && course.weeks.includes(checkWeek))
      .sort((a, b) => a.period - b.period);
    for (const course of dayCourses) {
      if (offset > 0 || classStatus(course, now) === "upcoming" || classStatus(course, now) === "now") {
        return { ...course, week: checkWeek, day };
      }
    }
  }
  return null;
}

function describeCourse(course, week) {
  return `第${week}周 · ${dayNames[course.day]} · ${periods[course.period].time} · ${course.name}`;
}

function describeNextClass(course) {
  return `${dayNames[course.day].replace("星期", "周")} ${periods[course.period].time} · ${course.name}`;
}

function renderFocus(currentWeek, visibleWeek) {
  const day = targetDay();
  const visible = coursesForDay(day, visibleWeek);
  const focusTitle = document.querySelector("#focusTitle");
  const focusMeta = document.querySelector("#focusMeta");

  if (state.filter === "next") {
    const label = state.selectedDay === "today" ? `下周${dayNames[day].replace("星期", "周")}` : `下周${dayNames[day].replace("星期", "周")}`;
    focusTitle.textContent = visible.length ? `${label}有 ${visible.length} 门课` : `${label}无课`;
    focusMeta.textContent = visible.length
      ? visible.map((course) => `${periods[course.period].time} ${course.name}`).join("，")
      : `第${visibleWeek}周是${weekType(visibleWeek)}，当天没有课程安排。`;
    return;
  }

  const nowCourse = visible.find((course) => classStatus(course) === "now");
  const upcomingCourse = visible.find((course) => classStatus(course) === "upcoming");
  if (nowCourse) {
    focusTitle.textContent = `正在上：${nowCourse.name}`;
    focusMeta.textContent = describeCourse(nowCourse, visibleWeek);
    return;
  }
  if (upcomingCourse) {
    focusTitle.textContent = `下一节：${upcomingCourse.name}`;
    focusMeta.textContent = describeCourse(upcomingCourse, visibleWeek);
    return;
  }

  const next = getNextClass(currentWeek);
  if (next) {
    focusTitle.textContent = visible.length ? `下一节：${next.name}` : `下一节：${next.name}`;
    focusMeta.textContent = `第${next.week}周 · ${dayNames[next.day].replace("星期", "周")} ${periods[next.period].time} · ${next.location}`;
    return;
  }
  focusTitle.textContent = visible.length ? "今天课程已结束" : "今天没有课";
  focusMeta.textContent = "未来两周内没有找到课程。";
}

function courseCard(course, week, compact = false) {
  const status = state.filter === "current" ? classStatus(course) : "";
  const activeText =
    status === "now"
      ? "正在上课"
      : status === "upcoming"
        ? "稍后上课"
        : state.filter === "next"
          ? `第${week}周`
          : compactWeeks(course.weeks);
  if (compact) {
    return `
      <div class="mini-course">
        <strong>${periods[course.period].time} · ${course.name}</strong>
        <span>${course.teacher} · ${course.location}</span>
        <span>${compactWeeks(course.weeks)}</span>
      </div>
    `;
  }
  return `
    <article class="course-card ${status}">
      <div class="time">${periods[course.period].time}<br><small>${periods[course.period].label}</small></div>
      <div>
        <h3 class="course-name">${course.name}</h3>
        <p class="course-meta">${course.teacher} · ${course.location}<br>${periods[course.period].sections} · ${compactWeeks(course.weeks)}</p>
      </div>
      <span class="week-tag">${activeText}</span>
    </article>
  `;
}

function renderToday(week) {
  const day = targetDay();
  const visible = coursesForDay(day, week);
  const titlePrefix =
    state.selectedDay === "today" && state.filter === "next"
      ? "下周今天"
      : state.filter === "next"
        ? `下周${dayNames[day].replace("星期", "周")}`
        : state.selectedDay === "today"
          ? "今天"
          : dayNames[day];
  document.querySelector("#currentDayTitle").textContent = `${titlePrefix}课程`;
  document.querySelector("#courseCount").textContent = `${visible.length} 门课`;
  document.querySelector("#todayCourses").innerHTML = visible.length
    ? visible.map((course) => courseCard(course, week)).join("")
    : `<div class="empty">${titlePrefix}在当前筛选下没有课程。周六、周日通常为空课表。</div>`;
}

function renderWeek(week) {
  const grid = document.querySelector("#weekGrid");
  const days = [1, 2, 3, 4, 5, 6, 0];
  grid.innerHTML = days
    .map((day) => {
      const list = coursesForDay(day, week);
      const isActive = day === getToday().getDay();
      return `
        <section class="day-column ${isActive ? "active-day" : ""}">
          <div class="day-title"><span>${dayNames[day]}</span><small>${list.length}门</small></div>
          ${
            list.length
              ? list.map((course) => courseCard(course, week, true)).join("")
              : `<div class="empty">无课</div>`
          }
        </section>
      `;
    })
    .join("");

  const filterName = {
    current: `本周每天课程 · 第${week}周`,
    next: `下周每天课程 · 第${week}周`,
  };
  document.querySelector("#weekTitle").textContent = filterName[state.filter];
}

function renderSummary(week) {
  const currentLabelWeek = Math.max(1, week);
  const nextWeek = currentLabelWeek + 1;
  document.querySelector("#currentWeekType").textContent = weekType(week);
  document.querySelector("#currentWeekNumber").textContent = week < 1 ? "即将开学 · 第1周" : `本周 · 第${week}周`;
  document.querySelector("#nextWeekType").textContent = weekType(nextWeek);
  document.querySelector("#nextWeekNumber").textContent = `下周 · 第${nextWeek}周`;
  const next = getNextClass(week);
  document.querySelector("#nextClass").textContent = next
    ? `下一节：第${next.week}周 ${dayNames[next.day].replace("星期", "周")} ${periods[next.period].time}`
    : "未来两周内没有找到课程。";
}

function renderHeader(week) {
  const today = getToday();
  const date = today.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" });
  document.querySelector("#todayLabel").textContent = date;
  document.querySelector("#weekLabel").textContent = week < 1 ? "开学前" : `第 ${week} 周 · ${weekType(week)}`;
  document.querySelector("#termLabel").textContent =
    week > 17 ? "已超过图片课表覆盖的1-17周" : "页面会随日期自动更新";
}

function render() {
  const currentWeek = getWeekNumber();
  const week = displayWeek(currentWeek);
  renderHeader(currentWeek);
  renderFocus(currentWeek, week);
  renderToday(week);
  renderWeek(week);
  renderSummary(currentWeek);
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    render();
  });
});

document.querySelectorAll("[data-day]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-day]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.selectedDay = button.dataset.day;
    render();
  });
});

document.querySelector("#termStart").addEventListener("change", (event) => {
  localStorage.setItem("termStart", event.target.value);
  render();
});

render();
setInterval(render, 60 * 1000);

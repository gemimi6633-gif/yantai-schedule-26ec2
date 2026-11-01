import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../assets/app.js", import.meta.url), "utf8");

test("includes the courses added by the personal timetable", () => {
  assert.match(source, /c\("网络文学鉴赏", "毛振东", 1, 5, range\(2, 8\)\.concat\(range\(10, 17\)\), "主校区 二教210"\)/);
  assert.match(source, /c\("网络文学鉴赏", "毛振东", 2, 5, \[8\], "主校区 二教308"\)/);
  assert.match(source, /c\("大学生心理学", "董昭江", 5, 5, range\(2, 17\), "主校区 四教401"\)/);
});

test("keeps split teachers and rooms for network marketing and management", () => {
  assert.match(source, /c\("网络营销", "张桐豪", 3, 1, \[1, 3, 5, 7, 11\], "主校区 五教501"\)/);
  assert.match(source, /c\("网络营销", "张桐豪", 3, 1, range\(14, 17\), "主校区 四教302"\)/);
  assert.match(source, /c\("网络营销", "张桐豪", 5, 4, range\(14, 17\), "主校区 四教306"\)/);
  assert.match(source, /c\("管理学", "王艳敏", 4, 1, range\(4, 6\), "主校区 四教402"\)/);
  assert.match(source, /c\("管理学", "高小芹", 3, 4, \[7, 9, 11\], "主校区 四教402"\)/);
});

test("removes superseded teacher and room records", () => {
  assert.doesNotMatch(source, /"消费者行为学", "迟少杰"/);
  assert.doesNotMatch(source, /"网络营销", "龙溪莉"/);
  assert.doesNotMatch(source, /c\("网络营销"[^\n]*, 4, 4,/);
  assert.doesNotMatch(source, /体能训练--6/);
});

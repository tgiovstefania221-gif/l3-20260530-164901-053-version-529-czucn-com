const params = new URLSearchParams(window.location.search);
const initialKeyword = params.get("q") || "";
const movies = Array.isArray(window.__MOVIES__) ? window.__MOVIES__ : [];
const input = document.getElementById("search-keyword");
const category = document.getElementById("search-category");
const year = document.getElementById("search-year");
const sort = document.getElementById("search-sort");
const results = document.getElementById("search-results");

const unique = (items) => Array.from(new Set(items.filter(Boolean)));
const writeOptions = (select, values, label) => {
  select.innerHTML = `<option value="">${label}</option>` + values.map((value) => `<option value="${value}">${value}</option>`).join("");
};
const card = (movie) => {
  const tags = movie.tags.slice(0, 4).map((tag) => `<span class="tag">${tag}</span>`).join("");
  return `<article class="movie-card" data-title="${movie.title}" data-year="${movie.year}" data-views="${movie.views}" data-category="${movie.category}">
  <a class="poster-link" href="${movie.url}">
    <img src="${movie.cover}" alt="${movie.title}" loading="lazy">
    <span class="poster-badge">${movie.year}</span>
    <span class="poster-play">▶</span>
  </a>
  <div class="movie-card-body">
    <div class="meta-line">
      <span>${movie.category}</span>
      <span>${movie.region}</span>
      <span>${movie.type}</span>
    </div>
    <h3><a href="${movie.url}">${movie.title}</a></h3>
    <p>${movie.oneLine}</p>
    <div class="card-tags">${tags}</div>
    <div class="card-bottom">
      <span>★ ${movie.rating}</span>
      <span>${movie.genre}</span>
    </div>
  </div>
</article>`;
};
const apply = () => {
  const keyword = input.value.trim().toLowerCase();
  const selectedCategory = category.value;
  const selectedYear = year.value;
  let list = movies.filter((movie) => {
    const text = `${movie.title} ${movie.region} ${movie.genre} ${movie.category} ${movie.oneLine} ${movie.tags.join(" ")}`.toLowerCase();
    return (!keyword || text.includes(keyword)) && (!selectedCategory || movie.category === selectedCategory) && (!selectedYear || String(movie.year) === selectedYear);
  });
  if (sort.value === "views") list.sort((a, b) => b.views - a.views);
  if (sort.value === "year") list.sort((a, b) => b.year - a.year || b.views - a.views);
  if (sort.value === "rating") list.sort((a, b) => Number(b.rating) - Number(a.rating) || b.views - a.views);
  list = list.slice(0, 120);
  results.innerHTML = list.length ? list.map(card).join("") : `<div class="story-card"><h2>未找到相关作品</h2><p>可以尝试更换剧名、题材、地区或分类关键词。</p></div>`;
};

if (input) {
  input.value = initialKeyword;
  writeOptions(category, unique(movies.map((movie) => movie.category)).sort((a, b) => a.localeCompare(b, "zh-Hans-CN")), "全部分类");
  writeOptions(year, unique(movies.map((movie) => String(movie.year))).sort((a, b) => Number(b) - Number(a)), "全部年份");
  [input, category, year, sort].forEach((element) => element.addEventListener("input", apply));
  [category, year, sort].forEach((element) => element.addEventListener("change", apply));
  apply();
}

/* 商家利润管家 · 手机端辅助（不改业务逻辑）
 * 1) 给表格单元格加 data-label，手机端用 CSS 把每行显示成卡片
 * 2) 手机端顶部固定显示「利润 / 库存成本 / 库存件数」（镜像总览卡片的数字） */
(function () {
  function labelTables(root) {
    (root || document).querySelectorAll('.table-wrap table,#recentSales table').forEach(function (t) {
      var heads = [].map.call(t.querySelectorAll('thead th'), function (th) { return th.textContent.trim(); });
      t.querySelectorAll('tbody tr').forEach(function (tr) {
        [].forEach.call(tr.children, function (td, i) {
          if (heads[i] != null && td.getAttribute('data-label') !== heads[i]) td.setAttribute('data-label', heads[i]);
          if (heads[i] === '操作') td.classList.add('m-actions');
        });
      });
    });
  }
  function buildSummary() {
    var side = document.querySelector('.sidebar'); if (!side || document.getElementById('mSummary')) return;
    var box = document.createElement('div'); box.id = 'mSummary'; box.className = 'm-summary';
    box.innerHTML = '<div><span>已实现利润</span><b id="msProfit"></b></div><div><span>库存成本</span><b id="msStock"></b></div><div><span>库存件数</span><b id="msQty"></b></div>';
    side.appendChild(box);
  }
  function syncSummary() {
    var p = document.getElementById('mProfit'), s = document.getElementById('mStock'), q = document.getElementById('mQty');
    if (!p || !document.getElementById('msProfit')) return;
    var mp = document.getElementById('msProfit');
    mp.textContent = p.textContent; mp.className = /red/.test(p.className) ? 'red' : 'green';
    document.getElementById('msStock').textContent = s.textContent;
    document.getElementById('msQty').textContent = q.textContent;
  }
  buildSummary(); labelTables(); syncSummary();
  var mo = new MutationObserver(function () { labelTables(); syncSummary(); });
  mo.observe(document.querySelector('main'), { childList: true, subtree: true, characterData: true });
})();

let chamCongData = [];

function initDashboard() {
  checkPermission();
}

document.getElementById("btn-process").addEventListener("click", () => {
  const file = document.getElementById("input-excel").files[0];
  if (!file) return alert("Chọn file Excel!");
  const reader = new FileReader();
  reader.onload = e => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    chamCongData = tinhTongTheoThang(json);
    renderTable(chamCongData);
    veBieuDoThoiGian(chamCongData);
  };
  reader.readAsArrayBuffer(file);
});

function tinhTongTheoThang(data) {
  const grouped = {};
  data.forEach(row => {
    const name = row["Họ tên"];
    const date = new Date(row["Ngày"]);
    const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
    const gioVao = parseFloat(row["Giờ vào"]) || 0;
    const gioRa = parseFloat(row["Giờ ra"]) || 0;
    const gioLam = gioRa - gioVao;
    const OT = gioLam > 8 ? gioLam - 8 : 0;
    const luongGio = parseFloat(row["Lương/giờ"]) || 0;
    const tongLuong = gioLam * luongGio;

    if (!grouped[name]) grouped[name] = {};
    if (!grouped[name][monthKey]) grouped[name][monthKey] = { gio: 0, luong: 0 };

    grouped[name][monthKey].gio += gioLam;
    grouped[name][monthKey].luong += tongLuong;
  });

  const result = [];
  for (let name in grouped) {
    for (let month in grouped[name]) {
      result.push({
        "Họ tên": name,
        "Tháng": month,
        "Tổng giờ": grouped[name][month].gio.toFixed(1),
        "Tổng lương": grouped[name][month].luong.toFixed(0)
      });
    }
  }
  return result;
}

function renderTable(data) {
  let html = "<table><tr>";
  Object.keys(data[0]).forEach(k => html += `<th>${k}</th>`);
  html += "</tr>";
  data.forEach(row => {
    html += "<tr>";
    Object.values(row).forEach(val => html += `<td>${val}</td>`);
    html += "</tr>";
  });
  html += "</table>";
  document.getElementById("output").innerHTML = html;
}

function veBieuDoThoiGian(data) {
  const ctx = document.getElementById("trendChart");
  const groupedByMonth = {};
  data.forEach(r => {
    if (!groupedByMonth[r["Tháng"]]) groupedByMonth[r["Tháng"]] = 0;
    groupedByMonth[r["Tháng"]] += parseFloat(r["Tổng lương"]);
  });

  const labels = Object.keys(groupedByMonth);
  const values = Object.values(groupedByMonth);

  if (window.trendChart) window.trendChart.destroy();
  window.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Tổng lương toàn công ty',
        data: values,
        borderColor: '#007bff',
        fill: false
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}
